import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { IMessage, ChatProps } from '../types';
import Message from './Message';
import { isSameDay } from '../utils';
import { defaultTheme, useTheme } from '../utils/theme';

interface MessageListProps extends ChatProps {
  contentContainerStyle?: any;
  inverted?: boolean;
}

const MessageList = (props: MessageListProps) => {
  const { messages, user, onLoadEarlier, loadEarlier, isLoadingEarlier, inverted = true } = props;

  const listRef = useRef<FlatList<IMessage>>(null);
  const theme = useTheme();

  /**
   * Ensure stable array
   */
  const listData = useMemo<IMessage[]>(() => {
    return Array.isArray(messages) ? messages : [];
  }, [messages]);

  /**
   * Force scroll to bottom (Android fix)
   */
  const scrollToBottom = useCallback(() => {
    if (!inverted) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
    });
  }, [inverted]);

  /**
   * Render Message
   */
  const renderItem = useCallback(
    ({ item, index }: { item: IMessage; index: number }) => {
      const previousMessage = listData[index - 1];
      const nextMessage = listData[index + 1];

      const messageProps = {
        ...props,
        currentMessage: item,
        previousMessage,
        nextMessage,
        user,
      };

      if (props.renderMessage) {
        return props.renderMessage(messageProps);
      }

      // 🔥 Correct compare for inverted list
      const compareMessage = inverted ? nextMessage : previousMessage;

      const showDateHeader = !compareMessage || !isSameDay(item, compareMessage);

      return (
        <View>
          {showDateHeader && (
            <View style={[styles.dateHeader, { backgroundColor: theme.colors.lightGrey }]}>
              <Text style={[styles.dateText, { color: theme.colors.gray }]}>
                {new Date(item.createdAt || Date.now()).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}

          <Message {...messageProps} />
        </View>
      );
    },
    [listData, user, props, inverted, theme]
  );

  /**
   * Stable key extractor (prevents Android delay)
   */
  const keyExtractor = useCallback(
    (item: IMessage, index: number) => (item?.id ? String(item.id) : `msg-${index}`),
    []
  );

  /**
   * Load earlier header
   */
  const renderHeader = useCallback(() => {
    if (!loadEarlier) return null;

    return (
      <View style={styles.loadEarlierContainer}>
        {isLoadingEarlier ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <TouchableOpacity onPress={onLoadEarlier}>
            <Text style={[styles.loadEarlierText, { color: theme.colors.iconAccentDanger }]}>
              Load earlier messages
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loadEarlier, isLoadingEarlier, theme, onLoadEarlier]);

  return (
    <FlatList
      ref={listRef}
      testID="message-list"
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      inverted={inverted}
      contentContainerStyle={[styles.listContent, { flexGrow: 1 }, props.contentContainerStyle]}
      ListFooterComponent={renderHeader}
      ListEmptyComponent={
        props.renderListEmptyComponent ? (
          <View style={[styles.emptyContainer, inverted ? styles.emptyFix : null]}>
            {props.renderListEmptyComponent()}
          </View>
        ) : null
      }
      keyboardShouldPersistTaps="handled"
      onEndReached={loadEarlier ? onLoadEarlier : undefined}
      onEndReachedThreshold={0.1}
      removeClippedSubviews={Platform.OS === 'android'}
      onContentSizeChange={scrollToBottom} // 🔥 Android fix
      {...props.listViewProps}
    />
  );
};

/**
 * Date grouping helper
 */
const shouldRenderDateHeader = (currentMessage: IMessage, compareMessage: IMessage | undefined) => {
  if (!compareMessage) return true;
  return !isSameDay(currentMessage, compareMessage);
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: defaultTheme.spacing.lg,
    paddingHorizontal: defaultTheme.spacing.lg - 2,
  },
  dateHeader: {
    alignSelf: 'center',
    paddingVertical: defaultTheme.spacing.xs,
    paddingHorizontal: defaultTheme.spacing.lg - 4,
    borderRadius: 16,
    marginBottom: defaultTheme.spacing.xl,
    marginTop: defaultTheme.spacing.xl,
  },
  dateText: {
    fontSize: defaultTheme.typography.body2,
    fontWeight: '500',
  },
  loadEarlierContainer: {
    alignItems: 'center',
    paddingVertical: defaultTheme.spacing.lg - 2,
  },
  loadEarlierText: {
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: defaultTheme.spacing.lg - 2,
    paddingHorizontal: defaultTheme.spacing.lg - 4,
  },
  emptyFix: {
    transform: [{ scaleY: -1 }],
  },
});

export default React.memo(MessageList);
