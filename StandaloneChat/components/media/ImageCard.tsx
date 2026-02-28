import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, View, Modal, Text } from 'react-native';
import { appSize } from '../../utils';
import { CloseIcon } from '../Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { defaultTheme, useTheme } from '../../utils/theme';
import MessageStatus from '../MessageStatus';

interface ImageCardProps {
  uri: string;
  maxWidth?: number;
  time?: string;
  isFullScreen?: boolean;
  setFullScreen?: any;
  isMine?: boolean;
  status?: 'pending' | 'sent' | 'delivered' | 'read';
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ImageComponent = Image;

export default function ImageCard({
  uri,
  maxWidth,
  time,
  isFullScreen,
  setFullScreen,
  isMine,
  status,
}: ImageCardProps) {
  const inset = useSafeAreaInsets();
  const theme = useTheme();
  const bubbleWidth = maxWidth || appSize.width(65);

  const [bubbleHeight, setBubbleHeight] = useState(bubbleWidth * 0.75);

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => {
        const ratio = h / w;
        const height = bubbleWidth * ratio;
        const minH = 120;
        const maxH = 400;
        setBubbleHeight(Math.min(Math.max(height, minH), maxH));
      },
      () => {
        setBubbleHeight(bubbleWidth * 0.75);
      }
    );
  }, [uri]);

  return (
    <>
      <View style={[styles.container, { width: bubbleWidth, height: bubbleHeight }]}>
        <ImageComponent source={{ uri }} style={styles.image} resizeMode="cover" />
        {time && (
          <View style={styles.timeOverlay}>
            <Text style={styles.timeText}>{time}</Text>
            {isMine && status ? (
              <View style={styles.statusWrap}>
                <MessageStatus status={status} isMine />
              </View>
            ) : null}
          </View>
        )}
      </View>

      <Modal
        visible={isFullScreen}
        transparent={false}
        onRequestClose={() => setFullScreen(false)}
        animationType="fade">
        <View style={styles.modal}>
          <ImageComponent source={{ uri }} style={styles.fullScreenImage} resizeMode="contain" />

          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Close image"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.closeButton, { top: inset.top + defaultTheme.spacing.sm }]}
            onPress={() => setFullScreen(false)}>
            <View style={styles.closeBg}>
              <CloseIcon size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: appSize.width(2),
    overflow: 'hidden',
    backgroundColor: defaultTheme.colors.black,
    margin: -2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: defaultTheme.colors.black,
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    right: defaultTheme.spacing.lg,
    zIndex: 10,
    padding: defaultTheme.spacing.sm,
  },
  closeBg: {
    backgroundColor: defaultTheme.colors.overlayBlack55,
    borderRadius: 16,
    padding: defaultTheme.spacing.xs,
  },
  timeOverlay: {
    position: 'absolute',
    bottom: defaultTheme.spacing.xs + 1,
    right: defaultTheme.spacing.xs + 1,
    backgroundColor: defaultTheme.colors.overlayBlack50,
    borderRadius: 10,
    paddingHorizontal: defaultTheme.spacing.sm,
    paddingVertical: defaultTheme.spacing.xs / 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: defaultTheme.colors.textOnOverlay,
    fontSize: defaultTheme.typography.caption,
    fontWeight: '600',
  },
  statusWrap: {
    marginLeft: defaultTheme.spacing.xs,
  },
});
