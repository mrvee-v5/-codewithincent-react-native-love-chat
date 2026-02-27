import { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { appSize } from '../../StandaloneChat/utils';
import { defaultTheme, useTheme } from '../../StandaloneChat/utils/theme';
import { PlayIcon, PauseIcon, CloseIcon } from '../../StandaloneChat/components/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, AVPlaybackStatus, AVPlaybackStatusSuccess, ResizeMode } from 'expo-av';

interface VideoMessageProps {
  file: { uri: string };
  maxWidth?: number;
  time?: string;
  setFullScreen?: (isFullScreen: boolean) => void;
  isFullScreen?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_ASPECT_RATIO = 16 / 9;

const VideoCard: React.FC<VideoMessageProps> = ({
  file,
  maxWidth,
  time,
  setFullScreen,
  isFullScreen,
}) => {
  const inset = useSafeAreaInsets();
  const theme = useTheme();
  const videoRef = useRef<Video>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const bubbleWidth = maxWidth || appSize.width(65);
  const initialHeight = Math.min(Math.max(bubbleWidth / DEFAULT_ASPECT_RATIO, 120), 350);
  const [videoHeight] = useState(initialHeight);

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

  useEffect(() => {
    const ensurePlay = async () => {
      if (!isFullScreen || !videoRef.current) return;
      const status: AVPlaybackStatus = await videoRef.current.getStatusAsync();
      if (!('isLoaded' in status) || !status.isLoaded) return;
      const s = status as AVPlaybackStatusSuccess;
      if (!s.isPlaying) {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    };
    ensurePlay();
  }, [isFullScreen]);

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    const status: AVPlaybackStatus = await videoRef.current.getStatusAsync();
    if (!('isLoaded' in status) || !status.isLoaded) return;
    const s = status as AVPlaybackStatusSuccess;
    if (s.isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const renderVideoPlayer = (isFull: boolean) => (
    <View
      style={
        isFull
          ? styles.fullScreenWrapper
          : [styles.videoArea, { width: bubbleWidth, height: videoHeight }]
      }>
      <Video
        ref={videoRef}
        source={{ uri: file.uri }}
        style={isFull ? styles.fullScreenVideo : styles.video}
        resizeMode={isFull ? ResizeMode.CONTAIN : ResizeMode.COVER}
        isLooping
        shouldPlay={isPlaying}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (!('isLoaded' in status) || !status.isLoaded) return;
          const s = status as AVPlaybackStatusSuccess;
          setCurrent(s.positionMillis / 1000);
          setIsPlaying(s.isPlaying);
          const dur = typeof s.durationMillis === 'number' ? s.durationMillis / 1000 : 0;
          if (dur && dur !== duration) setDuration(dur);
        }}
      />

      {isFull && (
        <>
          {/* Fullscreen Controls */}
          <TouchableOpacity
            style={[styles.overlayCenter, StyleSheet.absoluteFill]}
            onPress={togglePlayPause}
            activeOpacity={1}>
            <View style={styles.centerButtonFull}>
              <View style={styles.controlCircle}>
                {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.modalCloseButton, { top: inset.top + 10 }]}>
            <TouchableOpacity onPress={() => setFullScreen(false)}>
              <CloseIcon size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalProgressWrapper}>
            <Text style={styles.modalTime}>{formatTime(current)}</Text>
            <View style={styles.modalProgressBackground}>
              <Animated.View
                style={[
                  styles.modalProgressForeground,
                  { width: progressWidth, backgroundColor: theme.colors.darkRed },
                ]}
              />
            </View>
            <Text style={styles.modalTime}>{formatTime(duration)}</Text>
          </View>
        </>
      )}

      {!isFull && time && (
        <View style={styles.timeOverlay}>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      {/* Non-fullscreen video without any touch interaction */}
      {!isFullScreen && (
        <View style={[styles.wrapper, { width: bubbleWidth }]}>{renderVideoPlayer(false)}</View>
      )}

      {/* Fullscreen modal */}
      <Modal
        visible={isFullScreen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setFullScreen(false)}>
        {renderVideoPlayer(true)}
      </Modal>
    </>
  );
};

export default VideoCard;

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
  centerButtonFull: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  overlayCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlCircle: {
    width: appSize.width(10),
    height: appSize.width(10),
    borderRadius: 31,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: defaultTheme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
    bottom: 25,
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
