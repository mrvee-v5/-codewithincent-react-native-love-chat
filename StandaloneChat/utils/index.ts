import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const widthPercentageToDP = (widthPercent: string | number) => {
  const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

const heightPercentageToDP = (heightPercent: string | number) => {
  const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

// Layout utility similar to the original appSize
export const appSize = {
  width: (percent: number) => widthPercentageToDP(percent),
  height: (percent: number) => heightPercentageToDP(percent),
  font: (size: number) => size * (SCREEN_WIDTH / 375), // approximate scaling
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};

export const Logger = {
  info: (...args: any[]) => console.log('[Chat]', ...args),
  error: (...args: any[]) => console.error('[Chat Error]', ...args),
  debug: (...args: any[]) => console.debug('[Chat Debug]', ...args),
};

export const isSameUser = (currentMessage: any, diffMessage: any) => {
  return !!(
    diffMessage &&
    diffMessage.user &&
    currentMessage.user &&
    diffMessage.user._id === currentMessage.user._id
  );
};

export const isSameDay = (currentMessage: any, diffMessage: any) => {
  if (!diffMessage || !diffMessage.createdAt) {
    return false;
  }
  const currentCreatedAt = new Date(currentMessage.createdAt);
  const diffCreatedAt = new Date(diffMessage.createdAt);

  return (
    currentCreatedAt.getDate() === diffCreatedAt.getDate() &&
    currentCreatedAt.getMonth() === diffCreatedAt.getMonth() &&
    currentCreatedAt.getFullYear() === diffCreatedAt.getFullYear()
  );
};
