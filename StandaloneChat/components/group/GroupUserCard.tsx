import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { defaultTheme, useTheme } from '../../utils/theme';
import { IUser } from '../../types';
/**
 * A reusable wrapper that displays group user identity (avatar + name)
 * in a consistent layout around arbitrary chat content.
 */
export interface GroupUserCardProps {
  children: React.ReactNode;
  user?: IUser;
  isGroup?: boolean;
  isMine?: boolean;
  variant?: 'inline' | 'overlay';
  showAvatar?: boolean;
  style?: any;
}

const GroupUserCard = ({
  children,
  user,
  isGroup,
  isMine,
  variant = 'inline',
  showAvatar = true,
  style,
}: GroupUserCardProps) => {
  const theme = useTheme();
  const shouldShow = !!isGroup && !isMine && !!(user?.name || (showAvatar && user?.avatar));

  if (variant === 'overlay') {
    return (
      <View style={[styles.overlayContainer, style]}>
        {shouldShow ? (
          <View style={styles.overlayIdentity}>
            {showAvatar && user?.avatar ? (
              <Image
                source={
                  typeof user.avatar === 'string' ? { uri: user.avatar } : (user.avatar as any)
                }
                style={styles.overlayAvatar}
                resizeMode="cover"
              />
            ) : showAvatar ? (
              <View style={[styles.overlayAvatar, { backgroundColor: theme.colors.softGray }]} />
            ) : null}
            {user?.name ? (
              <Text
                style={[styles.overlayName, { color: defaultTheme.colors.white }]}
                numberOfLines={1}>
                {user.name}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.inlineContainer, style]}>
      {shouldShow ? (
        <View style={styles.inlineRow}>
          {showAvatar && user?.avatar ? (
            <Image
              source={typeof user.avatar === 'string' ? { uri: user.avatar } : (user.avatar as any)}
              style={styles.inlineAvatar}
            />
          ) : showAvatar ? (
            <View style={[styles.inlineAvatar, { backgroundColor: theme.colors.softGray }]} />
          ) : null}
          {user?.name ? (
            <Text
              style={[styles.inlineName, { color: theme.colors.textSecondary }]}
              numberOfLines={1}>
              {user.name}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  inlineContainer: {
    position: 'relative',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: defaultTheme.spacing.xs,
  },
  inlineAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: defaultTheme.spacing.sm,
  },
  inlineName: {
    fontSize: defaultTheme.typography.caption,
    fontWeight: '600',
  },

  overlayContainer: {
    position: 'relative',
  },
  overlayIdentity: {
    position: 'absolute',
    top: defaultTheme.spacing.sm,
    left: defaultTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultTheme.colors.overlayBlack50,
    borderRadius: 12,
    paddingHorizontal: defaultTheme.spacing.sm,
    paddingVertical: defaultTheme.spacing.xs / 2,
    zIndex: 5,
  },
  overlayAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: defaultTheme.colors.softGray,
    marginRight: defaultTheme.spacing.md,
  },
  overlayName: {
    fontSize: defaultTheme.typography.body2,
    fontWeight: '600',
    maxWidth: 200,
  },
});

export default GroupUserCard;
