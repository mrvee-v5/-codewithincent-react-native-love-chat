import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { IMessage, IUser } from '../types';
import Bubble from './Bubble';
import MessageStatus from './MessageStatus';
import { defaultTheme, useTheme } from '../utils/theme';
import ReplyPreview from './ReplyPreview';
import ImageCard from './media/ImageCard';
import FileCard from './media/FileCard';
import ReactionBubble from './ReactionBubble';

interface MessageProps {
  currentMessage: IMessage;
  nextMessage?: IMessage;
  previousMessage?: IMessage;
  user: IUser;
  renderBubble?: (props: any) => React.ReactNode;
  onLongPress?: (context: any, message: IMessage) => void;
  onPress?: (context: any, message: IMessage) => void;
  onReply?: (message: IMessage) => void;
  onReaction?: (message: IMessage, reaction: string) => void;
  onDeleteMessage?: (message: IMessage) => void;
  onDownloadFile?: (message: IMessage) => void;
  renderMessageText?: (props: any) => React.ReactNode;
  renderMessageImage?: (props: any) => React.ReactNode;
  renderMessageVideo?: (props: any) => React.ReactNode;
  renderMessageAudio?: (props: any) => React.ReactNode;
}

const Message = (props: MessageProps) => {
  const [isFullScreen, setFullScreen] = useState(false);
  const [isVideo, setVideo] = useState(false);
  const theme = useTheme();

  const {
    currentMessage,
    user,
    onLongPress,
    onPress,
    renderBubble,
    onReply,
    onReaction,
    onDeleteMessage,
    onDownloadFile,
  } = props;

  const isMine = currentMessage.user._id === user._id || currentMessage.isMine;

  const fileType = currentMessage.fileType?.toLowerCase();

  const isMedia = !!(
    currentMessage.image ||
    currentMessage.video ||
    currentMessage.audio ||
    fileType === 'image' ||
    fileType === 'video' ||
    fileType === 'file' ||
    fileType === 'audio'
  );

  const timestamp = new Date(currentMessage.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleLongPress = () => {
    onLongPress?.(null, currentMessage);
  };

  const handlePress = () => {
    onPress?.(null, currentMessage);

    if (!isMedia) return;

    if (currentMessage.image || fileType === 'image') {
      setFullScreen(!isFullScreen);
      return;
    }

    if (currentMessage.video || currentMessage.fileType === 'video') {
      setVideo(true);
      return;
    }
  };

  const handleReactionPress = (reaction: string | undefined) => {
    if (reaction && onReaction) {
      onReaction(currentMessage, reaction);
    }
  };

  // =============================
  // Universal Swipe Implementation
  // =============================

  const translateX = useSharedValue(0);
  const threshold = 60;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .minDistance(15)
    .maxPointers(1)
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value > threshold && onReply) {
        runOnJS(onReply)(currentMessage);
      }

      translateX.value = withTiming(0, { duration: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // =============================
  // Content Rendering
  // =============================

  const renderContent = () => {
    if (currentMessage.image || fileType === 'image') {
      if (props.renderMessageImage) return props.renderMessageImage(currentMessage);

      return (
        <ImageCard
          uri={currentMessage.image || currentMessage.fileUrl || ''}
          time={timestamp}
          setFullScreen={setFullScreen}
          isFullScreen={isFullScreen}
        />
      );
    }

    if (currentMessage.video || fileType === 'video') {
      const currentProps = {
        ...currentMessage,
        setFullScreen: setVideo,
        isFullScreen: isVideo,
      };
      if (props.renderMessageVideo) return props.renderMessageVideo(currentProps);

      return null;
    }

    if (currentMessage.audio || fileType === 'audio') {
      if (props.renderMessageAudio) return props.renderMessageAudio(currentMessage);

      return null;
    }

    if (fileType === 'file') {
      return (
        <FileCard fileName={currentMessage.fileName || 'File'} isMine={!!isMine} time={timestamp} />
      );
    }

    return (
      <View>
        {currentMessage.text ? (
          props.renderMessageText ? (
            props.renderMessageText(props)
          ) : (
            <Text
              style={[
                styles.text,
                isMine
                  ? { color: theme.colors.ownMessageText }
                  : { color: theme.colors.otherMessageText },
              ]}>
              {currentMessage.text}
            </Text>
          )
        ) : null}
      </View>
    );
  };

  // =============================
  // Reactions
  // =============================

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🤲'];

  const myReaction = currentMessage.reactions?.find((r: any) => r.userId === user._id)?.emoji;
  const contentEl = renderContent();
  const bubbleContent = contentEl ? (
    <Bubble isOwnMessage={!!isMine} isMedia={isMedia}>
      {currentMessage.replyTo && <ReplyPreview replyTo={currentMessage.replyTo} />}

      {contentEl}

      {!isMedia && (
        <View style={styles.footer}>
          <Text style={[styles.time, isMine ? styles.timeMine : { color: theme.colors.timestamp }]}>
            {timestamp}
          </Text>

          {isMine && <MessageStatus status={currentMessage.status} isMine={!!isMine} />}
        </View>
      )}
    </Bubble>
  ) : null;

  const messageView = (
    <View style={[styles.container, isMine ? styles.containerMine : styles.containerOther]}>
      <ReactionBubble
        reactions={reactions}
        isMine={!!isMine}
        selectedReaction={myReaction}
        onReactionPress={handleReactionPress}
        onPress={handlePress}
        onLongPress={handleLongPress}
        bubbleStyle={styles.reactionPopup}
        onReply={() => onReply?.(currentMessage)}
        onDelete={onDeleteMessage ? () => onDeleteMessage(currentMessage) : undefined}
        onDownload={onDownloadFile ? () => onDownloadFile(currentMessage) : undefined}
        isFile={isMedia}>
        {renderBubble
          ? renderBubble({
              ...props,
              isMine,
              children: contentEl,
            })
          : bubbleContent}
      </ReactionBubble>
    </View>
  );

  // =============================
  // Conditional Swipe Wrapper
  // =============================

  if (onReply) {
    return (
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, Gesture.Native())}>
        <Animated.View style={animatedStyle}>{messageView}</Animated.View>
      </GestureDetector>
    );
  }

  return messageView;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  containerMine: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  textMine: {
    color: defaultTheme.colors.ownMessageText,
  },
  textOther: {
    color: defaultTheme.colors.otherMessageText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    marginRight: 4,
  },
  timeMine: {
    color: defaultTheme.colors.timestampMine,
  },
  timeOther: {
    color: defaultTheme.colors.timestamp,
  },
  reactionPopup: {
    backgroundColor: defaultTheme.colors.reactionPopupBg,
  },
});

export default Message;
