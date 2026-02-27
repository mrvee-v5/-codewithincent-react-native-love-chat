import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  View,
  Modal,
  Text,
} from 'react-native';
import { appSize } from '../../utils';
import { CloseIcon } from '../Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { defaultTheme, useTheme } from '../../utils/theme';

interface ImageCardProps {
  uri: string;
  maxWidth?: number;
  time?: string;
isFullScreen?:boolean
setFullScreen?:any
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');

const ImageComponent = Image;

export default function ImageCard({
  uri,
  maxWidth,
  time,
  isFullScreen,
  setFullScreen,
}: ImageCardProps) {
  const inset = useSafeAreaInsets();
  const theme = useTheme();
  const bubbleWidth = maxWidth || appSize.width(65);

  const [bubbleHeight, setBubbleHeight] = useState(
    bubbleWidth * 0.75
  );

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => {
        const ratio = h / w;
        const height = bubbleWidth * ratio;
        const minH = 120;
        const maxH = 400;
        setBubbleHeight(
          Math.min(Math.max(height, minH), maxH)
        );
      },
      () => {
        setBubbleHeight(bubbleWidth * 0.75);
      }
    );
  }, [uri]);

  return (
    <>
  
        <View  style={[
          styles.container,
          { width: bubbleWidth, height: bubbleHeight },
        ]}>
        <ImageComponent
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
        {time && (
          <View style={styles.timeOverlay}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        )}
        </View>
 

      <Modal
        visible={isFullScreen}
        transparent={false}
        onRequestClose={() => setFullScreen(false)}
        animationType="fade"
      >
        <View style={styles.modal}>
          <ImageComponent
            source={{ uri }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={[
              styles.closeButton,
              { top: inset.top + 10 },
            ]}
            onPress={() => setFullScreen(false)}
          >
            <CloseIcon size={24} color={theme.colors.white} />
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
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  timeOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: defaultTheme.colors.overlayBlack50,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timeText: {
    color: defaultTheme.colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
});
