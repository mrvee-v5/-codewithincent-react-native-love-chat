import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet} from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { IMessage, IUser } from '../types';
import Bubble from './Bubble';
import MessageStatus from './MessageStatus';
import { defaultTheme, useTheme } from '../utils/theme';
import ReplyPreview from './ReplyPreview';
import ImageCard from './media/ImageCard';
import VideoCard from './media/VideoCard';
import AudioCard from './media/AudioCard';
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
  const swipeableRef = useRef<any>(null);
  const fileType = currentMessage.fileType?.toLowerCase();

  const isMedia = !!(currentMessage.image || currentMessage.video || currentMessage.audio || fileType === 'image' || fileType === 'video' || fileType === 'file' || fileType === 'audio');
  const timestamp = new Date(currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const handleLongPress = () => {
    onLongPress?.(null, currentMessage);
  };

  const handlePress = () => {
    onPress?.(null, currentMessage);
    if(!isMedia) return;
    if(currentMessage.image  || fileType === 'image' ) {
      setFullScreen(!isFullScreen);
    }
  };

  const handleReactionPress = (reaction: string | undefined) => {
    if (reaction && onReaction) {
      onReaction(currentMessage, reaction);
    }
  };

  const handleSwipeReply = () => {
    swipeableRef.current?.close();
    onReply?.(currentMessage);
  };

  const renderLeftActions = () => {
      // Invisible view for swipe action trigger
      return <View style={{ width: 50 }} />;
  };



  const renderContent = () => {
    
    if (currentMessage.image || fileType === 'image') {
      if (props.renderMessageImage) return props.renderMessageImage(props);
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
      if (props.renderMessageVideo) return props.renderMessageVideo(props);
      return (
        <VideoCard
          file={{ uri: currentMessage.video || currentMessage.fileUrl || '' }}
          time={timestamp}
          onLongPress={handleLongPress}
        />
      );
    }

    if (currentMessage.audio || fileType === 'audio') {
      if (props.renderMessageAudio) return props.renderMessageAudio(props);
      return <AudioCard uri={currentMessage.audio || currentMessage.fileUrl || ''} isMine={!!isMine} />;
    }

    if (fileType === 'file') {
       return <FileCard fileName={currentMessage.fileName || 'File'} isMine={!!isMine} time={timestamp} />;
    }

    return (
        <View>
            {currentMessage.text ? (
            props.renderMessageText ? (
                props.renderMessageText(props)
            ) : (
                <Text style={[styles.text, isMine ? { color: theme.colors.ownMessageText } : { color: theme.colors.otherMessageText }]}>
                {currentMessage.text}
                </Text>
            )
            ) : null}
        </View>
    );
  };

  // Reactions logic
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🤲'];
  const myReaction = currentMessage.reactions?.find((r: any) => r.userId === user._id)?.emoji;

  const bubbleContent = (
    <Bubble
        isOwnMessage={!!isMine}
        isMedia={isMedia}
    >
        {currentMessage.replyTo && (
            <ReplyPreview replyTo={currentMessage.replyTo} />
        )}

        {renderContent()}

        {!isMedia && (
            <View style={styles.footer}>
                <Text style={[styles.time, isMine ? styles.timeMine : { color: theme.colors.timestamp }]}>
                {timestamp}
                </Text>
                {isMine && <MessageStatus status={currentMessage.status} isMine={!!isMine} />}
            </View>
        )}
    </Bubble>
  );

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
          isFile={isMedia}
       >
          {renderBubble ? renderBubble({
            ...props,
            isMine,
            children: renderContent(),
          }) : bubbleContent}
       </ReactionBubble>
    </View>
  );

  if (onReply) {
      return (
        <ReanimatedSwipeable
            ref={swipeableRef}
            onSwipeableOpen={handleSwipeReply}
            renderLeftActions={renderLeftActions}
            leftThreshold={40}
            overshootLeft={false}
        >
            {messageView}
        </ReanimatedSwipeable>
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeOther: {
    color: '#aaa',
  },
  reactionPopup: {
      backgroundColor: '#202A30',
  }
});

export default Message;
