import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { appSize } from '../utils';
import { defaultTheme, useTheme } from '../utils/theme';
import { XCircleIcon, VideoIcon, AudioIcon, FileIcon } from './Icons';

interface FooterReplyPreviewProps {
  chatMessage: any;
  clearReply?: () => void;
  userId: string;
}

const FooterReplyPreview = ({ chatMessage, clearReply, userId }: FooterReplyPreviewProps) => {
  console.log('chatMessage', chatMessage);
  const theme = useTheme();
  if (!chatMessage) return null;

  const isMine = chatMessage.user?._id === userId;
  const senderName = isMine ? 'You' : chatMessage.user?.name || 'Unknown';

  const getFileNameFromUrl = (url?: string) => {
    if (!url) return undefined;
    try {
      const clean = url.split('?')[0];
      const parts = clean.split('/');
      const last = parts[parts.length - 1];
      return last || undefined;
    } catch {
      return undefined;
    }
  };

  const getExtension = (name?: string) => {
    if (!name) return undefined;
    const ext = name.split('.').pop();
    return ext ? ext.toLowerCase() : undefined;
  };

  const computedFileName = chatMessage.fileName || getFileNameFromUrl(chatMessage.fileUrl);
  const extension = getExtension(computedFileName);
  const isAudioByExt = extension ? ['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(extension) : false;

  const rawFileType =
    typeof chatMessage.fileType === 'string'
      ? chatMessage.fileType.toLowerCase()
      : chatMessage.fileType;
  const fileType =
    rawFileType ||
    (chatMessage.image
      ? 'image'
      : chatMessage.video
        ? 'video'
        : chatMessage.audio
          ? 'audio'
          : computedFileName
            ? isAudioByExt
              ? 'audio'
              : 'file'
            : null);

  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <Image
            source={{ uri: chatMessage.image || chatMessage.fileUrl }}
            style={styles.replyImage}
            resizeMode="cover"
          />
        );
      case 'video':
        return (
          <View style={styles.replyMediaContainer}>
            <VideoIcon size={20} color={theme.colors.darkBrown} />
          </View>
        );
      case 'audio':
        return (
          <View style={styles.replyFileContainer}>
            <AudioIcon size={18} color={theme.colors.darkBrown} />
            <Text
              numberOfLines={1}
              style={[styles.replyFileName, { color: theme.colors.darkBrown }]}>
              {computedFileName || 'Audio'}
            </Text>
          </View>
        );
      case 'file':
        return (
          <View style={styles.replyFileContainer}>
            <FileIcon size={18} color={theme.colors.darkBrown} />
            <Text
              numberOfLines={1}
              style={[styles.replyFileName, { color: theme.colors.darkBrown }]}>
              {computedFileName || (extension ? extension.toUpperCase() : 'File')}
            </Text>
          </View>
        );
      default:
        if (computedFileName) {
          return (
            <View style={styles.replyFileContainer}>
              {isAudioByExt ? (
                <AudioIcon size={18} color={theme.colors.darkBrown} />
              ) : (
                <FileIcon size={18} color={theme.colors.darkBrown} />
              )}
              <Text
                numberOfLines={1}
                style={[styles.replyFileName, { color: theme.colors.darkBrown }]}>
                {computedFileName}
              </Text>
            </View>
          );
        }
        return (
          <Text numberOfLines={1} style={[styles.replySnippet, { color: theme.colors.darkBrown }]}>
            {chatMessage.text || chatMessage.caption || ''}
          </Text>
        );
    }
  };

  return (
    <View
      style={[
        styles.replyPreviewContainer,
        { backgroundColor: theme.colors.softRed, borderLeftColor: theme.colors.primary },
      ]}>
      <View style={[styles.replyLine, { backgroundColor: theme.colors.primary }]} />
      <View style={styles.repContainer}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.replyTitle, { color: theme.colors.darkBrown }]}>{senderName}</Text>
          {renderContent()}
        </View>
        {clearReply && (
          <TouchableOpacity onPress={clearReply}>
            <XCircleIcon size={16} color={theme.colors.darkRed} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultTheme.colors.softRed,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: defaultTheme.colors.primary,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ddd',
  },
  replyLine: {
    width: 4,
    height: '100%',
    backgroundColor: defaultTheme.colors.primary,
    marginRight: 8,
  },
  repContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyTitle: {
    fontSize: appSize.font(11),
    fontWeight: '600',
    color: defaultTheme.colors.darkBrown,
  },
  replySnippet: {
    fontSize: appSize.font(13.5),
    color: defaultTheme.colors.darkBrown,
    marginTop: 2,
  },
  replyImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  replyMediaContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  replyFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyFileName: {
    marginLeft: 6,
    color: defaultTheme.colors.darkBrown,
  },
});

export default FooterReplyPreview;
