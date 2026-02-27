import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  ActivityIndicator,
} from 'react-native';
import { appSize, Logger } from '../../StandaloneChat/utils';
import { defaultTheme, useTheme } from '../../StandaloneChat/utils/theme';
import { PlayIcon, PauseIcon } from '../../StandaloneChat/components/Icons';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

interface AudioMessageProps {
  uri: string;
  maxWidth?: number;
  isMine?: boolean;
}

export default function AudioCard({ uri, maxWidth, isMine }: AudioMessageProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState(0);

  const theme = useTheme();

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        Logger.error('Error unloading audio', e);
      }
      soundRef.current = null;
    }
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const onFinish = () => {
    setIsPlaying(false);
    progressAnim.setValue(0);
    setCurrentTime('0:00');
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
  };

  const play = async () => {
    if (!uri) return;

    try {
      setIsLoading(true);

      if (!soundRef.current) {
        const { sound, status } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        soundRef.current = sound;

        const dur =
          'isLoaded' in status &&
          status.isLoaded &&
          typeof (status as AVPlaybackStatusSuccess).durationMillis === 'number'
            ? ((status as AVPlaybackStatusSuccess).durationMillis as number) / 1000
            : 0;
        setDuration(dur);
      } else {
        await soundRef.current.playAsync();
      }

      setIsPlaying(true);
      setIsLoading(false);

      intervalRef.current = setInterval(async () => {
        if (!soundRef.current) return;
        const status: AVPlaybackStatus = await soundRef.current.getStatusAsync();
        if (!('isLoaded' in status) || !status.isLoaded) return;

        const s = status as AVPlaybackStatusSuccess;
        const pos = (s.positionMillis ?? 0) / 1000;
        const dur = (s.durationMillis ?? 0) / 1000;

        setCurrentTime(formatTime(pos));
        if (dur > 0) progressAnim.setValue(pos / dur);

        if (s.didJustFinish) {
          onFinish();
        }
      }, 200) as unknown as number;
    } catch (e) {
      Logger.error('expo-audio error', e);
      setIsLoading(false);
    }
  };

  const pause = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    } catch (e) {
      Logger.error('Error pausing audio', e);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const cardBackgroundColor = isMine ? theme.colors.ownFileBg : theme.colors.otherFileBg;
  const textColor = isMine ? theme.colors.ownMessageText : theme.colors.otherMessageText;

  return (
    <View
      style={[
        styles.container,
        { maxWidth: maxWidth || appSize.width(60), backgroundColor: cardBackgroundColor },
      ]}>
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: theme.colors.darkRed }]}
        onPress={isPlaying ? pause : play}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : isPlaying ? (
          <PauseIcon size={18} color="#fff" />
        ) : (
          <PlayIcon size={18} color="#fff" />
        )}
      </TouchableOpacity>

      <View style={styles.middle}>
        <View style={styles.progressBackground} />
        <Animated.View
          style={[
            styles.progressForeground,
            { width: progressWidth, backgroundColor: theme.colors.darkRed },
          ]}
        />
      </View>

      <Text style={[styles.timeText, { color: textColor }]}>{currentTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minWidth: appSize.width(60),
    alignItems: 'center',
    backgroundColor: defaultTheme.colors.white,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: appSize.width(2),
    flexShrink: 1,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: defaultTheme.colors.darkRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    marginLeft: 12,
    width: 45,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e0e0e0',
  },
  progressForeground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: defaultTheme.colors.darkRed,
  },
});
