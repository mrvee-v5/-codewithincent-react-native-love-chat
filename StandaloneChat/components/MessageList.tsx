import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { IMessage, ChatProps } from '../types';
import Message from './Message';
import { isSameDay } from '../utils';
import { defaultTheme, useTheme } from '../utils/theme';

interface MessageListProps extends ChatProps {
  inverted?: boolean;
}

const MessageList = (props: MessageListProps) => {
  const { messages, user, onLoadEarlier, loadEarlier, isLoadingEarlier } = props;
  const listRef = useRef<any>(null);
  const isMounted = useRef(false);
  const theme = useTheme();

  const listData = useMemo(() => {
    return Array.isArray(messages) ? [...messages].reverse() : [];
  }, [messages]);

  // Automatic scrolling logic
  useEffect(() => {
    if (listData.length === 0) return;

    if (!isMounted.current) {
      // Scenario 1: Initial mount - scroll to bottom immediately
      isMounted.current = true;
      // Use a small timeout to ensure list is ready
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 0);
    } else {
      // Scenario 2: New message added - smooth scroll to bottom
      // We can also check if we are already at the bottom to avoid annoyance,
      // but requirements state "always displays the most recent message".
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [listData.length]);

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

      const showDateHeader = shouldRenderDateHeader(item, previousMessage);

      return (
        <View>
          {showDateHeader && (
            <View style={[styles.dateHeader, { backgroundColor: theme.colors.lightGrey }]}>
              <Text style={[styles.dateText, { color: theme.colors.gray }]}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
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
    [listData, user, props]
  );

  const keyExtractor = useCallback((item: IMessage) => item._id.toString(), []);

  const renderHeader = () => {
    if (loadEarlier) {
      return (
        <View style={styles.loadEarlierContainer}>
          {isLoadingEarlier ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <TouchableOpacity onPress={onLoadEarlier}>
              <Text style={[styles.loadEarlierText, { color: theme.colors.darkRed }]}>
                Load earlier messages
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <FlashList
      ref={listRef}
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={renderHeader}
      keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
      maintainVisibleContentPosition={{
        autoscrollToBottomThreshold: 0.2,
        animateAutoScrollToBottom: true,
        startRenderingFromBottom: true,
      }}
      onStartReached={loadEarlier ? onLoadEarlier : undefined}
      onStartReachedThreshold={0.1}
      estimatedItemSize={72}
      {...props.listViewProps}
    />
  );
};

const shouldRenderDateHeader = (
  currentMessage: IMessage,
  previousMessage: IMessage | undefined
) => {
  if (!previousMessage) return true;
  return !isSameDay(currentMessage, previousMessage);
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  dateHeader: {
    alignSelf: 'center',
    backgroundColor: defaultTheme.colors.lightGrey,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  dateText: {
    fontSize: 12,
    color: defaultTheme.colors.gray,
    fontWeight: '500',
  },
  loadEarlierContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadEarlierText: {
    color: defaultTheme.colors.darkRed,
    fontWeight: '600',
  },
});

export default MessageList;
