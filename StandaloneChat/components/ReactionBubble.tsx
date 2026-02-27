import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  UIManager,
  findNodeHandle,
  Dimensions,
} from 'react-native';
import Animated, {
  ZoomIn,
  ZoomOut,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import RootSibling from 'react-native-root-siblings';
import { UniversalBlurView } from './../components/adapters/UniversalBlurView';
import { appSize } from '../utils';
import { defaultTheme, useTheme } from '../utils/theme';
import { ReplyIcon, TrashIcon, DownloadIcon } from './Icons';

const SCREEN = Dimensions.get('window');

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Helper exported for tests (non-breaking)
export const computePositions = ({
  pos,
  reactionsCount,
  isMine,
  screenW,
  screenH,
  popupHeight = 60,
  menuWidth = 200,
  menuItemCount = 3,
  menuItemHeight = 44,
  verticalGap = 12,
  horizontalMargin = 8,
  reactionCoreWidth = 28,
  reactionHorizontalPadding = 8,
  popupHorizontalPadding = 12,
}: {
  pos: { x: number; y: number; width: number; height: number };
  reactionsCount: number;
  isMine: boolean;
  screenW: number;
  screenH: number;
  popupItemWidth?: number;
  popupHeight?: number;
  menuWidth?: number;
  menuItemCount?: number;
  menuItemHeight?: number;
  verticalGap?: number;
  horizontalMargin?: number;
  reactionCoreWidth?: number;
  reactionHorizontalPadding?: number;
  popupHorizontalPadding?: number;
}) => {
  // More accurate width estimation: per-reaction width + container paddings
  const perReactionWidth = reactionCoreWidth + reactionHorizontalPadding * 2;
  const emojiPanelWidth = reactionsCount * perReactionWidth + popupHorizontalPadding * 2;

  let left = pos.x + pos.width / 2 - emojiPanelWidth / 2;
  if (isMine) {
    left = pos.x + pos.width - emojiPanelWidth - appSize.width(6.5);
  }
  left = clamp(left, horizontalMargin, screenW - emojiPanelWidth - horizontalMargin);

  let top = pos.y - popupHeight - verticalGap;
  let emojiBelow = false;
  if (top < horizontalMargin) {
    top = pos.y + pos.height + verticalGap;
    emojiBelow = true;
  }

  // Compute menu height based on visible items
  const menuHeight = menuItemCount * menuItemHeight + verticalGap; // include gap/padding

  // Default: menu below the message
  let menuTop = emojiBelow ? top + popupHeight + verticalGap : pos.y + pos.height + verticalGap;
  let menuLeft = isMine ? pos.x + pos.width - menuWidth : pos.x;
  menuLeft = clamp(menuLeft, horizontalMargin, screenW - menuWidth - horizontalMargin);

  // Check bottom space and reposition menu above if insufficient
  const bottomSpace = screenH - menuTop;
  const neededSpace = menuHeight + 16;
  const placeAbove = bottomSpace < neededSpace;
  if (placeAbove) {
    menuTop = emojiBelow ? pos.y - menuHeight - verticalGap : top - menuHeight - verticalGap;
    if (menuTop < horizontalMargin) {
      menuTop = horizontalMargin;
    }
  }

  return {
    emojiPanel: { left, top, width: emojiPanelWidth, height: popupHeight },
    menu: { left: menuLeft, top: menuTop, width: menuWidth, height: menuHeight, above: placeAbove },
  };
};

export type ReactionBubbleProps = {
  reactions: string[];
  isMine: boolean;
  selectedReaction?: string;
  onReactionPress: (reaction: string | undefined) => void;
  style?: any;
  bubbleStyle?: any;
  reactionStyle?: any;
  highlightColor?: string;
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;

  // Context Menu Props
  onReply?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  isFile?: boolean;
};

export default function ReactionBubble({
  reactions,
  selectedReaction,
  onReactionPress,
  style,
  bubbleStyle,
  reactionStyle,
  highlightColor,
  children,
  isMine,
  onPress,
  onLongPress,
  onReply,
  onDelete,
  onDownload,
  isFile,
  ...rest
}: ReactionBubbleProps) {
  const triggerRef = useRef<View>(null);
  const siblingRef = useRef<RootSibling | null>(null);
  const theme = useTheme();

  const scale = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(scale.value, {
          damping: 12,
          stiffness: 220,
          mass: 0.25,
        }),
      },
    ],
  }));

  const showPopup = (pos: { x: number; y: number; width: number; height: number }) => {
    hidePopup();
    scale.value = 0;

    // Feature-detection gate: only use robust positioning when Dimensions exists and measureInWindow is available
    const canMeasure =
      typeof UIManager.measureInWindow === 'function' && SCREEN && typeof SCREEN.width === 'number';

    let left: number;
    let top: number;
    let menuLeft: number;
    let menuTop: number;
    const menuWidth = 200;

    if (canMeasure) {
      const positions = computePositions({
        pos,
        reactionsCount: reactions.length,
        isMine,
        screenW: SCREEN.width,
        screenH: SCREEN.height,
        popupItemWidth: 42,
        popupHeight: 60,
        menuWidth,
        menuItemCount: (onReply ? 1 : 0) + (isFile && onDownload ? 1 : 0) + (onDelete ? 1 : 0),
        menuItemHeight: 44,
        verticalGap: 12,
        horizontalMargin: 8,
        reactionCoreWidth: 28,
        reactionHorizontalPadding: 8,
        popupHorizontalPadding: 12,
      });
      left = positions.emojiPanel.left;
      top = positions.emojiPanel.top;
      menuLeft = positions.menu.left;
      menuTop = positions.menu.top;
    } else {
      // Fallback to previous behavior (unchanged)
      const popupWidth = reactions.length * 42;
      const popupHeight = 60;
      const screenW = SCREEN.width;
      top = pos.y - popupHeight - 12;
      left = pos.x + pos.width / 2 - popupWidth / 2;
      if (isMine) {
        left = pos.x + pos.width - popupWidth - appSize.width(6.5);
      }
      left = clamp(left, 10, screenW - popupWidth - 10);
      menuTop = pos.y + pos.height + 10;
      let _menuLeft = isMine ? pos.x + pos.width - menuWidth : pos.x;
      menuLeft = clamp(_menuLeft, 10, screenW - menuWidth - 10);
    }

    siblingRef.current = new RootSibling(
      <View style={styles.overlayContainer}>
        <Pressable style={StyleSheet.absoluteFill} onPress={hidePopup}>
          <UniversalBlurView
            style={StyleSheet.absoluteFill}
            blurType={'dark'}
            blurAmount={12}
            tint="dark"
            intensity={60}
            reducedTransparencyFallbackColor={theme.colors.blurFallback}
          />
        </Pressable>

        <View
          style={[
            styles.messageDuplicateWrapper,
            {
              top: pos.y,
              left: pos.x,
              width: pos.width,
            },
          ]}>
          {children}
        </View>

        {/* Reaction Bar */}
        <Animated.View
          entering={ZoomIn.duration(100)}
          exiting={ZoomOut.duration(100)}
          style={{
            position: 'absolute',
            top,
            left,
          }}>
          <Animated.View style={[styles.popup, bubbleStyle, animStyle]}>
            {reactions.map((r, i) => (
              <Pressable key={i} onPress={() => handleReactionPress(r)}>
                <Text style={[styles.reaction, reactionStyle]}>{r}</Text>
              </Pressable>
            ))}
          </Animated.View>
        </Animated.View>

        {/* Context Menu */}
        <Animated.View
          entering={ZoomIn.duration(150).delay(50)}
          exiting={ZoomOut.duration(150)}
          style={[
            styles.contextMenu,
            {
              top: menuTop,
              left: menuLeft,
              width: menuWidth,
            },
          ]}>
          {onReply && (
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                hidePopup();
                onReply();
              }}>
              <Text style={styles.menuText}>Reply</Text>
              <ReplyIcon size={18} color={theme.colors.white} />
            </Pressable>
          )}

          {isFile && onDownload && (
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                hidePopup();
                onDownload();
              }}>
              <Text style={styles.menuText}>Download</Text>
              <DownloadIcon size={18} color={theme.colors.white} />
            </Pressable>
          )}

          {onDelete && (
            <Pressable
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                hidePopup();
                onDelete();
              }}>
              <Text style={[styles.menuText, { color: defaultTheme.colors.darkRed }]}>Delete</Text>
              <TrashIcon size={18} />
            </Pressable>
          )}
        </Animated.View>
      </View>
    );

    requestAnimationFrame(() => {
      scale.value = 1;
    });
  };

  const hidePopup = () => {
    if (siblingRef.current) {
      siblingRef.current.destroy();
      siblingRef.current = null;
    }
  };

  const handleLongPress = () => {
    const node = findNodeHandle(triggerRef.current);
    if (!node) return;

    UIManager.measureInWindow(node, (x, y, width, height) => {
      showPopup({ x, y, width, height });
    });

    if (onLongPress) {
      onLongPress();
    }
  };

  const handleReactionPress = (reaction: string) => {
    hidePopup();
    onReactionPress(reaction);
  };

  useEffect(() => {
    return hidePopup;
  }, []);

  return (
    <View>
      <Pressable
        ref={triggerRef}
        onPress={onPress}
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          style,
          {
            backgroundColor: pressed ? highlightColor : style?.backgroundColor,
          },
        ]}
        {...rest}>
        {children}
      </Pressable>

      {selectedReaction && (
        <Pressable onPress={() => onReactionPress(undefined)}>
          <Animated.View style={[styles.miniReaction, { backgroundColor: theme.colors.primary }]}>
            <Text>{selectedReaction}</Text>
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
  messageDuplicateWrapper: {
    position: 'absolute',
    zIndex: 50,
  },
  popup: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 40,
    backgroundColor: defaultTheme.colors.reactionPopupBg,
    zIndex: 100,
  },
  reaction: {
    fontSize: 28,
    paddingHorizontal: 8,
  },
  miniReaction: {
    marginStart: 8,
    padding: 4,
    borderRadius: 100,
    width: appSize.width(8),
    height: appSize.width(8),
    backgroundColor: defaultTheme.colors.primary,
    top: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: defaultTheme.colors.reactionMenuBg,
    borderRadius: 12,
    paddingVertical: 4,
    width: 200,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: defaultTheme.colors.reactionMenuSeparator,
  },
  menuText: {
    color: defaultTheme.colors.white,
    fontSize: 16,
    fontWeight: '400',
  },
});
