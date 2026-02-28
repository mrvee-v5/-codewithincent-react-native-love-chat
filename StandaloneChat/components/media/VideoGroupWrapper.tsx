import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { defaultTheme, useTheme } from '../../utils/theme';
import MessageStatus from '../MessageStatus';

interface VideoGroupWrapperProps {
  children: React.ReactNode;
  isGroup?: boolean;
  isMine?: boolean;
  name?: string;
  avatar?: string | number;
  time?: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read';
}

const VideoGroupWrapper = (props: VideoGroupWrapperProps) => {
  const { children, isGroup, isMine, name, avatar, time, status } = props;
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {isGroup && !isMine && (name || avatar) ? (
        <View style={styles.nameRow}>
          {avatar ? (
            <Image
              source={typeof avatar === 'string' ? { uri: avatar } : (avatar as any)}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : null}
          {name ? (
            <Text style={styles.nameText} numberOfLines={1}>
              {name}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
      {time ? (
        <View pointerEvents="none" style={styles.infoRow}>
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
  nameRow: {
    position: 'absolute',
    top: defaultTheme.spacing.sm,
    left: defaultTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultTheme.colors.overlayBlack50,
    borderRadius: 12,
    paddingHorizontal: defaultTheme.spacing.sm,
    paddingVertical: defaultTheme.spacing.xs / 2,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: defaultTheme.colors.softGray,
    marginRight: defaultTheme.spacing.md,
  },
  nameText: {
    color: defaultTheme.colors.white,
    fontSize: defaultTheme.typography.body2,
    fontWeight: '600',
    maxWidth: 200,
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
  timeText: {
    fontSize: defaultTheme.typography.caption,
    fontWeight: '600',
    marginRight: defaultTheme.spacing.sm,
  },
});

export default VideoGroupWrapper;
