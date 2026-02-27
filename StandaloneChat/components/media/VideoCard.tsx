import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Dimensions,
} from 'react-native';
import { appSize } from '../../utils';
import { defaultTheme, useTheme } from '../../utils/theme';
import { PlayIcon, PauseIcon, VideoIcon, CloseIcon } from '../Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoEngine } from '../adapters/UniversalVideo';

interface VideoMessageProps {
  file: { uri: string };
  maxWidth?: number;
  time?: string;
  onLongPress?: () => void; // ✅ ADDED
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_ASPECT_RATIO = 16 / 9;

export default function VideoCard({
  file,
  maxWidth,
  time,
  onLongPress, // ✅ ADDED
}: VideoMessageProps) {
  const inset = useSafeAreaInsets();
  const videoRef = useRef<any>(null);
  const theme = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isFullScreen, setFullScreen] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const bubbleWidth = maxWidth || appSize.width(65);

  const initialHeight = Math.min(
    Math.max(bubbleWidth / DEFAULT_ASPECT_RATIO, 120),
    350,
  );
  const [videoHeight, setVideoHeight] = useState(initialHeight);

  useEffect(() => {
    progressAnim.setValue(current / (duration || 1));
  }, [current, duration]);

  const formatTime = (secs: number) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (VideoEngine.type === 'none') {
    return (
      <View
        style={[
          styles.wrapper,
          {
            width: bubbleWidth,
            height: 120,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.black,
          },
        ]}
      >
        <VideoIcon size={40} color={theme.colors.white} />
        <Text style={{ color: 'white', marginTop: 10 }}>
          Video not supported
        </Text>
      </View>
    );
  }

  const VideoComponent =
    VideoEngine.type === 'expo-video'
      ? VideoEngine.ExpoVideo.Video
      : VideoEngine.RNVideo;

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const renderVideoPlayer = (isFull: boolean) => (
    <View
      style={
        isFull
          ? styles.fullScreenWrapper
          : [styles.videoArea, { width: bubbleWidth, height: videoHeight }]
      }
    >
      <VideoComponent
        ref={videoRef}
        source={{ uri: file.uri }}
        style={isFull ? styles.fullScreenVideo : styles.video}
        resizeMode={isFull ? 'contain' : 'cover'}
        paused={!isPlaying}
        onLoad={(meta: any) => {
          const dur =
            meta?.duration ??
            (meta?.durationMillis
              ? meta.durationMillis / 1000
              : 0);

          setDuration(dur);

          if (!isFull && meta?.naturalSize) {
            const { width: w, height: h } =
              meta.naturalSize;
            if (w && h) {
              const ratio = h / w;
              let finalHeight = bubbleWidth * ratio;
              finalHeight = Math.min(
                Math.max(finalHeight, 120),
                350
              );
              setVideoHeight(finalHeight);
            }
          }
        }}
        onProgress={(data: any) => {
          const time =
            data?.currentTime ||
            data?.positionMillis / 1000 ||
            0;

          if (time !== undefined && time !== null) {
            setCurrent(time);
          }
        }}
        onEnd={() => {
          setIsPlaying(false);
          setCurrent(duration);
          progressAnim.setValue(1);
        }}
      />

      {/* Overlay Touch Area */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={togglePlayPause}
        onLongPress={onLongPress} // ✅ FIXED
        delayLongPress={250}
        activeOpacity={1}
      >
        <View style={styles.centerButton}>
          <View style={styles.controlCircle}>
            {isPlaying ? (
              <PauseIcon size={24} />
            ) : (
              <PlayIcon size={24} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {!isFull && (
        <>
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progress,
                {
                  width: progressWidth,
                  backgroundColor:
                    theme.colors.darkRed,
                },
              ]}
            />
          </View>

          {time && (
            <View style={styles.timeOverlay}>
              <Text style={styles.timeText}>
                {time}
              </Text>
            </View>
          )}
        </>
      )}

      {isFull && (
        <>
          <View
            style={[
              styles.modalCloseButton,
              { top: inset.top + 10 },
            ]}
          >
            <TouchableOpacity
              onPress={() => setFullScreen(false)}
            >
              <CloseIcon size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalProgressWrapper}>
            <Text style={styles.modalTime}>
              {formatTime(current)}
            </Text>

            <View style={styles.modalProgressBackground}>
              <Animated.View
                style={[
                  styles.modalProgressForeground,
                  {
                    width: progressWidth,
                    backgroundColor:
                      theme.colors.darkRed,
                  },
                ]}
              />
            </View>

            <Text style={styles.modalTime}>
              {formatTime(duration)}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  if (isFullScreen) {
    return (
      <View style={StyleSheet.absoluteFill}>
        {renderVideoPlayer(true)}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { width: bubbleWidth }]}>
      {renderVideoPlayer(false)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: appSize.width(2),
    overflow: 'hidden',
    backgroundColor: defaultTheme.colors.black,
    margin: -2,
  },
  videoArea: {
    borderRadius: appSize.width(2),
    overflow: 'hidden',
    backgroundColor: defaultTheme.colors.black,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: appSize.height(5),
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    paddingHorizontal: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  durationText: {
    color: defaultTheme.colors.white,
    fontSize: 13,
    marginLeft: 5,
  },
  centerButton: {
    position: 'absolute',
    top: '40%',
    left: '40%',
  },
  controlCircle: {
    width: appSize.width(10),
    height: appSize.width(10),
    borderRadius: 31,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: defaultTheme.colors.black,
  },
  progress: {
    height: 4,
    backgroundColor: defaultTheme.colors.darkRed,
  },
  fullScreenWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  modalPlayButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
  },
  modalProgressWrapper: {
    position: 'absolute',
    bottom: 40,
    width: SCREEN_WIDTH - 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalProgressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  modalProgressForeground: {
    height: '100%',
    backgroundColor: defaultTheme.colors.darkRed,
  },
  modalTime: {
    color: '#fff',
    fontSize: 14,
  },
  timeOverlay: {
    position: 'absolute',
    bottom: 25, // Above the progress bar
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
