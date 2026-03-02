import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { defaultTheme, useTheme } from '../../utils/theme';
import MessageStatus from '../MessageStatus';

interface VideoGroupWrapperProps {
  children: React.ReactNode;
  isGroup?: boolean;
  isMine?: boolean;
  time?: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read';
  isAudio?: boolean;
}

/**
 * Wraps a rendered video/audio component with group metadata header and footer.
 * @param {VideoGroupWrapperProps} props - accepts children, isGroup, isMine, time, status, and isAudio.
 * @returns {React.ReactElement} - a wrapped video/audio component with group metadata header and footer.
 */
const VideoGroupWrapper = (props: VideoGroupWrapperProps) => {
  const { children, isMine, time, status } = props;
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {children}
      {time ? (
        <View pointerEvents="none" style={[styles.infoRow, props.isAudio ? styles.audio : null]}>
          <Text
            style={[
              styles.timeText,
              { color: isMine ? theme.colors.timestampMine : theme.colors.timestamp },
            ]}>
            {time}
          </Text>
          {isMine && status ? <MessageStatus status={status} isMine /> : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  infoRow: {
    position: 'absolute',
    right: defaultTheme.spacing.sm,
    bottom: defaultTheme.spacing.sm,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultTheme.colors.overlayBlack50,
    borderRadius: 12,
    paddingHorizontal: defaultTheme.spacing.sm,
    paddingVertical: defaultTheme.spacing.xs / 2,
  },
  audio: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    bottom: defaultTheme.spacing.sm - 3,
  },
  timeText: {
    fontSize: defaultTheme.typography.caption,
    fontWeight: '600',
    marginRight: defaultTheme.spacing.sm,
  },
});

export default VideoGroupWrapper;
