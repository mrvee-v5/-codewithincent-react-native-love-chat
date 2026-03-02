import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Converts a width percentage to a pixel value.
 * @param {string|number} widthPercent width percentage as a string or number.
 * @returns {number} pixel value.
 */
const widthPercentageToDP = (widthPercent: string | number) => {
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

/**
 * Converts a height percentage to a pixel value.
 * @param {string|number} heightPercent height percentage as a string or number.
 * @returns {number} pixel value.
 */
const heightPercentageToDP = (heightPercent: string | number) => {
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
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

/**
 * Returns true if messages share the same user id.
 * @param {any} currentMessage current message object
 * @param {any} diffMessage diff message object
 * @returns {boolean} true if same user, false otherwise
 */
export const isSameUser = (currentMessage: any, diffMessage: any) => {
  return !!(
    diffMessage &&
    diffMessage.user &&
    currentMessage.user &&
    diffMessage.user.id === currentMessage.user.id
  );
};

/**
 * Returns true if messages share the same calendar day.
 * @param {any} currentMessage current message object
 * @param {any} diffMessage diff message object
 * @returns {boolean} true if same day, false otherwise
 */
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

/**
 * Sorts messages by createdAt in ascending (AC) or descending (DC) order.
 * Returns a new array with the sorted messages.
 * @param {any[]} messages array of message objects
 * @param {'AC'|'DC'} order sorting order (ascending or descending)
 * @throws {Error} if order is not 'AC' or 'DC'
 * @returns {any[]} new array with sorted messages
 */
export const sortByDate = (messages: any, order = 'AC') => {
  return [...messages].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    if (isNaN(dateA) || isNaN(dateB)) {
      return 0; // Keep relative order if date is invalid
    }

    if (order === 'AC') return dateA - dateB;
    if (order === 'DC') return dateB - dateA;

    throw new Error("Invalid order parameter. Use 'AC' or 'DC'.");
  });
};
