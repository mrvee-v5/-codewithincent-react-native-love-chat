import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  ActivityIndicator,
} from 'react-native';
import { appSize, Logger } from '../../utils';
import { defaultTheme, useTheme } from '../../utils/theme';
import { PlayIcon, PauseIcon } from '../Icons';
import { AudioEngine } from '../adapters/UniversalAudio';

interface AudioMessageProps {
  uri: string;
  maxWidth?: number;
  isMine?: boolean;
}

export default function AudioCard({ uri, maxWidth, isMine }: AudioMessageProps) {
  const soundRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const totalDuration = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');

  const theme = useTheme();

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    if (AudioEngine.type === 'expo-audio' && soundRef.current) {
      await soundRef.current?.stop?.();
    }

    if (AudioEngine.type === 'rnsound' && soundRef.current) {
      soundRef.current.release();
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
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
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const play = async () => {
    if (!uri) return;

    // 🔵 EXPO-AUDIO MODE
    if (AudioEngine.type === 'expo-audio') {
      try {
        setIsLoading(true);

        const { createAudioPlayer } = AudioEngine.ExpoAudio;
        const player = createAudioPlayer({ uri });

        soundRef.current = player;

        player.play();
        setIsPlaying(true);
        setIsLoading(false);

        totalDuration.current = player.duration ?? 0;

        intervalRef.current = setInterval(() => {
          const pos = player.currentTime ?? 0;

          if (totalDuration.current > 0) {
            progressAnim.setValue(pos / totalDuration.current);
          }

          setCurrentTime(formatTime(pos));

          if (player.didJustFinish) {
            onFinish();
          }
        }, 200);
      } catch (e) {
        Logger.error('expo-audio error', e);
        setIsLoading(false);
      }
      return;
    }

    // 🟠 RN SOUND MODE
    if (AudioEngine.type === 'rnsound') {
      const Sound = AudioEngine.RNSound;

      if (!soundRef.current) {
        setIsLoading(true);

        const sound = new Sound(uri, '', (err: any) => {
          setIsLoading(false);
          if (err) {
            Logger.error('RN Sound error', err);
            return;
          }

          soundRef.current = sound;
          totalDuration.current = sound.getDuration();

          sound.play(onFinish);
          setIsPlaying(true);

          intervalRef.current = setInterval(() => {
            sound.getCurrentTime((sec: number) => {
              if (totalDuration.current > 0) {
                progressAnim.setValue(sec / totalDuration.current);
              }
              setCurrentTime(formatTime(sec));
            });
          }, 200);
        });

        return;
      }

      soundRef.current.play(onFinish);
      setIsPlaying(true);
      return;
    }

    Logger.error('No audio engine available.');
  };

  const pause = async () => {
    if (!soundRef.current) return;

    if (AudioEngine.type === 'expo-audio') {
      soundRef.current.pause?.();
    }

    if (AudioEngine.type === 'rnsound') {
      soundRef.current.pause();
    }

    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
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
        {
          maxWidth: maxWidth || appSize.width(60),
          backgroundColor: cardBackgroundColor
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: theme.colors.darkRed }]}
        onPress={isPlaying ? pause : play}
        disabled={isLoading}
      >
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
