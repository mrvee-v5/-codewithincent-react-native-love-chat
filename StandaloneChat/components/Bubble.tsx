import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { appSize } from '../utils';
import { useTheme } from '../utils/theme';

interface ChatBubbleProps {
  isOwnMessage: boolean;
  children: React.ReactNode;
  bubbleColor?: string;
  tailColor?: string;
  withTail?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
  hitSlop?: number | { top: number; bottom: number; left: number; right: number };
  maxWidth?: number;
  isMedia?: boolean;
}

/**
 * A speech bubble component for rendering chat messages.
 * @param {ChatBubbleProps} props - Props for rendering the chat bubble.
 * @param {boolean} props.isOwnMessage - Whether the message is from the current user.
 * @param {ReactNode} props.children - The content of the chat bubble.
 * @param {string} [props.bubbleColor] - The color of the chat bubble.
 * @param {string} [props.tailColor] - The color of the chat bubble's tail.
 * @param {boolean} [props.withTail=true] - Whether the chat bubble should have a tail.
 * @param {ViewStyle} [props.style] - Styles for the chat bubble.
 * @param {() => void} [props.onPress] - A callback function to handle the press event of the chat bubble.
 * @param {number | {top:number;bottom:number;left:number;right:number}} [props.hitSlop] - The hit slop for the chat bubble.
 * @param {number} [props.maxWidth] - The maximum width of the chat bubble.
 * @param {boolean} [props.isMedia] - Whether the chat bubble is for media.
 */
const ChatBubble: React.FC<ChatBubbleProps> = ({
  isOwnMessage,
  children,
  bubbleColor,
  tailColor,
  withTail = true,
  style,
  onPress,
  hitSlop,
  maxWidth,
  isMedia,
  ...rest
}) => {
  const theme = useTheme();
  const effectiveBubbleColor =
    bubbleColor || (isOwnMessage ? theme.colors.ownMessageBubble : theme.colors.otherMessageBubble);
  const tailFillColor = tailColor || effectiveBubbleColor;

  const styles = getStyleObj({ isOwnMessage, maxWidth, isMedia });

  const SvgContainerStyle = isOwnMessage ? styles.svgContainerOwn : styles.svgContainerOther;

  const Container: any = onPress ? Pressable : View;

  const tailPath = isOwnMessage
    ? 'M48,35c-7-4-6-8.75-6-17.5C28,17.5,29,35,48,35z'
    : 'M38.484,17.5c0,8.75,1,13.5-6,17.5C51.484,35,52.484,17.5,38.484,17.5z';

  const bubbleStyle = {
    ...styles.bubble,
    ...style,
    backgroundColor: effectiveBubbleColor,
  };

  return (
    <Container {...rest} hitSlop={hitSlop} onPress={onPress}>
      <View style={bubbleStyle}>{children}</View>

      {withTail && (
        <View style={[styles.svgContainer, SvgContainerStyle]}>
          <Svg
            width={appSize.width(4.5)}
            height={appSize.height(2.5)}
            viewBox="32.485 17.5 15.515 17.5">
            <Path d={tailPath} fill={tailFillColor} />
          </Svg>
        </View>
      )}
    </Container>
  );
};

export default ChatBubble;

/**
 * Returns an object containing styles for the chat bubble and its tail.
 *
 * @param {{ isOwnMessage: boolean, maxWidth?: number, isMedia?: boolean }}
 * @returns {{ bubble: ViewStyle, svgContainer: ViewStyle, svgContainerOwn: ViewStyle, svgContainerOther: ViewStyle }}
 */
/*******  184542c7-05c5-4dd8-882b-6c21b7dffe23  *******/
const getStyleObj = ({
  isOwnMessage,
  maxWidth,
  isMedia,
}: {
  isOwnMessage: boolean;
  maxWidth?: number;
  isMedia?: boolean;
}) => ({
  bubble: {
    maxWidth: maxWidth || appSize.width(80),
    alignSelf: isOwnMessage ? ('flex-end' as const) : ('flex-start' as const),
    paddingHorizontal: isMedia ? 0 : appSize.width(3),
    paddingTop: isMedia ? 0 : appSize.height(0.5),
    paddingBottom: isMedia ? 0 : appSize.height(0.8),
    borderRadius: appSize.width(2),
    marginVertical: appSize.height(0.5),
  },
  svgContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    flex: 1,
  },
  svgContainerOwn: {
    justifyContent: 'flex-end' as const,
    alignItems: 'flex-end' as const,
  },
  svgContainerOther: {
    justifyContent: 'flex-end' as const,
    alignItems: 'flex-start' as const,
  },
});
