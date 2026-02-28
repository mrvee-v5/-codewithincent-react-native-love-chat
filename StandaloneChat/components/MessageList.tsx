import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { IMessage, ChatProps } from '../types';
import Message from './Message';
import { isSameDay } from '../utils';
import { defaultTheme, useTheme } from '../utils/theme';

interface MessageListProps extends ChatProps {
  contentContainerStyle?: any;
  inverted?: boolean;
}

const MessageList = (props: MessageListProps) => {
  const { messages, user, onLoadEarlier, loadEarlier, isLoadingEarlier } = props;
  const listRef = useRef<any>(null);
  const theme = useTheme();

  // ✅ DO NOT reverse when using inverted
  const listData = useMemo(() => {
    return Array.isArray(messages) ? messages : [];
  }, [messages]);

  const renderItem = useCallback(
    ({ item, index }: { item: IMessage; index: number }) => {
      // 🔥 Fix for inverted list
      const previousMessage = listData[index + 1];
      const nextMessage = listData[index - 1];

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
  };

  return (
    <FlashList
      ref={listRef}
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      inverted
      contentContainerStyle={[styles.listContent, props.contentContainerStyle]}
      ListFooterComponent={renderHeader}
      keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0,
        minIndexForVisible: 0,
      }}
      onEndReached={loadEarlier ? onLoadEarlier : undefined}
      onEndReachedThreshold={0.1}
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
    paddingVertical: defaultTheme.spacing.lg - 2,
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
});

export default MessageList;
