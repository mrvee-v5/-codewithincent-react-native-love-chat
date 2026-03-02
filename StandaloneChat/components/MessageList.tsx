import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { IMessage, ChatProps } from '../types';
import Message from './Message';
import { isSameDay } from '../utils';
import { defaultTheme, useTheme } from '../utils/theme';

interface MessageListProps extends ChatProps {
  contentContainerStyle?: any;
  inverted?: boolean;
}

/**
 * A list component for rendering chat messages.
 * @param {MessageListProps} props - Props for rendering the message list.
 * @param {ChatProps} props - Props that are shared with the chat component.
 * @param {boolean} props.inverted - Whether the list should be inverted.
 * @param {boolean} props.loadEarlier - Whether the list should load earlier messages.
 * @param {() => void} props.onLoadEarlier - A callback function to load earlier messages.
 * @param {boolean} props.isLoadingEarlier - Whether the list is currently loading earlier messages.
 * @param {ViewStyle} props.contentContainerStyle - Styles for the content container.
 */
const MessageList = (props: MessageListProps) => {
  const { messages, user, onLoadEarlier, loadEarlier, isLoadingEarlier } = props;
  const listRef = useRef<any>(null);
  const theme = useTheme();

  const listData = useMemo(() => {
    return Array.isArray(messages) ? messages : [];
  }, [messages]);

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

  const keyExtractor = useCallback((item: IMessage) => item.id.toString(), []);

  /**
   * Renders a header that shows an activity indicator while earlier messages are being loaded
   * or a button to load earlier messages when they are available.
   * @returns {React.ReactElement} A JSX element that renders a header.
   */
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
    <FlatList
      ref={listRef}
      testID="message-list"
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      inverted
      contentContainerStyle={[styles.listContent, props.contentContainerStyle]}
      ListFooterComponent={renderHeader}
      keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
      onEndReached={loadEarlier ? onLoadEarlier : undefined}
      onEndReachedThreshold={0.1}
      estimatedItemSize={72}
      {...props.listViewProps}
    />
  );
};

/**
 * Returns true if the date header should be rendered for the current message.
 * A date header should be rendered if there is no previous message (i.e., the current message is the first in the list)
 * or if the current message was sent on a different day than the previous message.
 * @param currentMessage The current message.
 * @param previousMessage The previous message, or undefined if there is no previous message.
 * @returns True if the date header should be rendered, false otherwise.
 */
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
