import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  UIManager,
  findNodeHandle,
  Dimensions,
  Platform,
  Modal,
  Image,
  ScrollView,
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
import { defaultTheme, useTheme, ThemeProvider } from '../utils/theme';
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
  selectedOtherReaction?: string;
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
  isGroup?: boolean;
  messageReactions?: Array<{ userId: string | number; emoji: string }>;
  participants?: Array<{
    id: string | number;
    name?: string;
    avatar?: string | number;
    phone?: string;
  }>;
  closeOnBackdropPress?: boolean;
  userId?: string | number;
  onRemoveEmoji?: (emoji: { emoji: string; userId?: string | number }) => void;
};

export default function ReactionBubble({
  reactions,
  selectedReaction,
  selectedOtherReaction,
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
  isGroup,
  messageReactions,
  participants,
  closeOnBackdropPress,
  userId,
  onRemoveEmoji,
  ...rest
}: ReactionBubbleProps) {
  const triggerRef = useRef<View>(null);
  const siblingRef = useRef<RootSibling | null>(null);
  const theme = useTheme();
  const [showGroupModal, setShowGroupModal] = React.useState(false);
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState(false);

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
      <ThemeProvider
        theme={{
          colors: theme.colors,
          spacing: (theme as any).spacing,
          typography: (theme as any).typography,
          fonts: (theme as any).fonts,
        }}>
        <View style={styles.overlayContainer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={hidePopup}>
            <UniversalBlurView
              style={StyleSheet.absoluteFill}
              blurType={'dark'}
              blurAmount={20}
              tint="dark"
              intensity={90}
              reducedTransparencyFallbackColor={theme.colors.blurFallback}
            />
            {Platform.OS === 'android' && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
            )}
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
            <Animated.View
              style={[
                styles.popup,
                { backgroundColor: theme.colors.reactionPopupBg },
                bubbleStyle,
                animStyle,
              ]}>
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
                backgroundColor: theme.colors.reactionMenuBg,
              },
            ]}>
            {onReply && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  hidePopup();
                  onReply();
                }}>
                <Text style={[styles.menuText, { color: theme.colors.textOnOverlay }]}>Reply</Text>
                <ReplyIcon size={18} color={theme.colors.textOnOverlay} />
              </Pressable>
            )}

            {isFile && onDownload && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  hidePopup();
                  onDownload();
                }}>
                <Text style={[styles.menuText, { color: theme.colors.textOnOverlay }]}>
                  Download
                </Text>
                <DownloadIcon size={18} color={theme.colors.textOnOverlay} />
              </Pressable>
            )}

            {onDelete && (
              <Pressable
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                onPress={() => {
                  hidePopup();
                  onDelete();
                }}>
                <Text style={[styles.menuText, { color: theme.colors.iconAccentDanger }]}>
                  Delete
                </Text>
                <TrashIcon size={18} color={theme.colors.iconAccentDanger} />
              </Pressable>
            )}
          </Animated.View>
        </View>
      </ThemeProvider>
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

      {!isGroup && selectedReaction && (
        <Pressable
          onPress={() => {
            if (onRemoveEmoji) {
              onRemoveEmoji({ emoji: selectedReaction, userId });
            } else {
              onReactionPress(undefined);
            }
          }}>
          <Animated.View style={[styles.miniReaction, { backgroundColor: theme.colors.primary }]}>
            <Text>{selectedReaction}</Text>
          </Animated.View>
        </Pressable>
      )}
      {!isGroup && selectedOtherReaction && (
        <Animated.View
          style={[styles.miniReactionOther, { backgroundColor: theme.colors.primary }]}>
          <Text>{selectedOtherReaction}</Text>
        </Animated.View>
      )}
      {isGroup && messageReactions && messageReactions.length > 0 && (
        <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
          <View style={[styles.groupCard, { backgroundColor: theme.colors.reactionMenuBg }]}>
            <View style={styles.groupCardContent}>
              {aggregateGrouped(messageReactions).map((ar, idx) => (
                <Pressable
                  key={`${ar.emoji}-${idx}`}
                  style={styles.groupItem}
                  onPress={() => {
                    setSelectedEmoji(ar.emoji);
                    setShowGroupModal(true);
                  }}>
                  <Text style={[styles.groupItemEmoji, { color: theme.colors.textOnOverlay }]}>
                    {ar.emoji}
                  </Text>
                </Pressable>
              ))}
              <Text style={[styles.groupItemBadgeText, { color: theme.colors.textOnOverlay }]}>
                {' '}
                {totalAggregatedCount(messageReactions)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <Modal
        visible={showGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}>
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: theme.colors.overlayBlack55 }]}
          onPress={() => {
            if (shouldCloseOnBackdropPress(closeOnBackdropPress)) setShowGroupModal(false);
          }}
          accessibilityRole="button"
          accessibilityLabel="Close reactions modal"
        />
        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: theme.colors.bgModal,
              borderTopColor: theme.colors.borderDefault,
              shadowColor: theme.colors.black,
            },
          ]}
          accessibilityLabel="Reactions details"
          accessible>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}>
              {countForEmoji(messageReactions || [], selectedEmoji || '')} Reactions
            </Text>
          </View>
          <View style={styles.sheetChipsRow}>
            {aggregateGrouped(messageReactions || []).map((ar, idx) => (
              <Pressable
                key={`sheet-${ar.emoji}-${idx}`}
                style={[styles.sheetChip, selectedEmoji === ar.emoji && styles.sheetChipSelected]}
                onPress={() => setSelectedEmoji(ar.emoji)}>
                <Text style={[styles.sheetChipText, { color: theme.colors.textPrimary }]}>
                  {ar.emoji}
                </Text>
                <Text style={[styles.sheetChipText, { color: theme.colors.textPrimary }]}>
                  {ar.count}
                </Text>
              </Pressable>
            ))}
          </View>
          <ScrollView style={{ maxHeight: SCREEN.height * 0.65 }}>
            {(
              usersForEmoji(messageReactions || [], participants || [], selectedEmoji || '') || []
            ).map((u, idx) => (
              <Pressable
                key={`user-${u.id}-${idx}`}
                style={[styles.userRow, !canRemoveOwn(u.id, userId) ? { opacity: 0.6 } : null]}
                onPress={() => {
                  if (!selectedEmoji) return;
                  if (!canRemoveOwn(u.id, userId) || removing) return;
                  setRemoving(true);
                  try {
                    if (onRemoveEmoji) {
                      onRemoveEmoji({ emoji: selectedEmoji, userId });
                    } else {
                      onReactionPress(undefined);
                    }
                  } finally {
                    setRemoving(false);
                  }
                  setShowGroupModal(false);
                }}>
                {u.avatar ? (
                  typeof u.avatar === 'string' ? (
                    <Image source={{ uri: u.avatar }} style={styles.userAvatar} />
                  ) : (
                    <Image source={u.avatar as any} style={styles.userAvatar} />
                  )
                ) : (
                  <View style={[styles.userAvatar, { backgroundColor: theme.colors.softGray }]} />
                )}
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                    {u.name || String(u.id)}
                  </Text>
                  {u.phone ? (
                    <Text style={[styles.userPhone, { color: theme.colors.textSecondary }]}>
                      {u.phone}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.userEmoji, { color: theme.colors.textPrimary }]}>
                  {selectedEmoji || ''}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.closeButton} onPress={() => setShowGroupModal(false)}>
            <Text style={[styles.closeText, { color: theme.colors.textPrimary }]}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

export const aggregateGrouped = (reactions: Array<{ userId: string | number; emoji: string }>) => {
  const map = new Map<string, Set<string | number>>();
  for (let i = 0; i < reactions.length; i++) {
    const r = reactions[i];
    if (!r || typeof r.emoji !== 'string') continue;
    if (!map.has(r.emoji)) map.set(r.emoji, new Set());
    map.get(r.emoji)!.add(r.userId);
  }
  return Array.from(map.entries())
    .map(([emoji, users]) => ({ emoji, count: users.size }))
    .sort((a, b) => (b.count === a.count ? a.emoji.localeCompare(b.emoji) : b.count - a.count));
};

const totalAggregatedCount = (reactions: Array<{ userId: string | number; emoji: string }>) => {
  const agg = aggregateGrouped(reactions);
  let sum = 0;
  for (let i = 0; i < agg.length; i++) sum += agg[i].count;
  return sum;
};

export function shouldCloseOnBackdropPress(v?: boolean) {
  return !!v;
}

export const hasUserEmoji = (
  reactions: Array<{ userId: string | number; emoji: string }>,
  userId?: string | number,
  emoji?: string
) => {
  if (!userId || !emoji) return false;
  if (!Array.isArray(reactions)) return false;
  for (let i = 0; i < reactions.length; i++) {
    const r = reactions[i];
    if (r && r.userId === userId && r.emoji === emoji) return true;
  }
  return false;
};

export const canRemoveOwn = (targetUserId?: string | number, currentUserId?: string | number) => {
  if (!currentUserId) return false;
  return targetUserId === currentUserId;
};
export const usersForEmoji = (
  reactions: Array<{ userId: string | number; emoji: string }>,
  participants: Array<{
    id: string | number;
    name?: string;
    avatar?: string | number;
    phone?: string;
  }>,
  emoji: string
) => {
  if (!emoji) return [];
  const ids = new Set<string | number>();
  for (let i = 0; i < reactions.length; i++) {
    const r = reactions[i];
    if (r && r.emoji === emoji) ids.add(r.userId);
  }
  const byId = new Map<string | number, any>();
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    byId.set(p.id, p);
  }
  const list: Array<any> = [];
  ids.forEach((id) => {
    const p = byId.get(id);
    list.push(p || { id });
  });
  return list;
};

export const countForEmoji = (
  reactions: Array<{ userId: string | number; emoji: string }>,
  emoji: string
) => {
  if (!emoji) return 0;
  let c = 0;
  for (let i = 0; i < reactions.length; i++) {
    if (reactions[i]?.emoji === emoji) c++;
  }
  return c;
};

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
  miniReactionOther: {
    marginStart: 4,
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
    fontSize: 16,
    fontWeight: '400',
  },
  groupReactionRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 6,
  },
  groupCard: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  groupCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  groupItemEmoji: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupItemBadge: {
    display: 'none',
  },
  groupItemBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 0,
  },
  parenText: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupReactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: defaultTheme.colors.primary,
    gap: 6,
  },
  groupReactionEmoji: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
  },
  groupBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: SCREEN.height * 0.8,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sheetChip: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: defaultTheme.colors.softGray,
  },
  sheetChipSelected: {
    backgroundColor: defaultTheme.colors.primary,
  },
  sheetChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 13,
  },
  userEmoji: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: defaultTheme.colors.softGray,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
