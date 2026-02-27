import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { appSize } from '../utils';
import { defaultTheme, useTheme } from '../utils/theme';
import { VideoIcon, AudioIcon, FileIcon } from './Icons';
import { IMessage } from '../types';

interface ReplyPreviewProps {
  replyTo: IMessage;
  maxMediaWidth?: number;
}

const ReplyPreview = ({ replyTo }: ReplyPreviewProps) => {
  const theme = useTheme();
  if (!replyTo) return null;

  const senderName = replyTo.user?.name || 'Unknown';
  const fileType = replyTo.fileType?.toLowerCase();
  const caption = replyTo.caption || '';
  const text = replyTo.text || '';

  const getFileNameFromUrl = (url?: string) => {
    console.log('url', url);
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

  const computedFileName = replyTo.fileName || getFileNameFromUrl((replyTo as any).fileUrl);
  const extension = getExtension(computedFileName);

  const isMedia =
    fileType === 'image' || fileType === 'video' || !!replyTo.image || !!replyTo.video;

  const isFile =
    !!computedFileName || fileType === 'audio' || fileType === 'file' || !!replyTo.audio;

  const renderMedia = () => (
    <View style={styles.mediaRow}>
      <View style={styles.textWrapper}>
        <Text numberOfLines={1} style={[styles.senderName, { color: theme.colors.darkPrimary }]}>
          {senderName}
        </Text>
        <View style={!caption && fileType ? { minWidth: '100%' } : null}>
          <Text numberOfLines={1} style={[styles.captionText, { color: theme.colors.gray }]}>
            {caption || (fileType === 'image' || replyTo.image ? 'Photo' : 'Video')}
          </Text>
        </View>
      </View>

      {fileType === 'image' || replyTo.image ? (
        <Image
          source={{ uri: replyTo.image || replyTo.fileUrl }}
          style={styles.mediaThumb}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.mediaThumb}>
          {/* Use thumbnail if available, else generic video icon */}
          <VideoIcon size={30} color={theme.colors.white} />
        </View>
      )}
    </View>
  );

  const renderFileRow = () => (
    <View style={styles.fileRow}>
      {fileType === 'audio' ||
      replyTo.audio ||
      (extension && ['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(extension)) ? (
        <AudioIcon size={18} color={theme.colors.gray} />
      ) : (
        <FileIcon size={18} color={theme.colors.gray} />
      )}
      <Text numberOfLines={1} style={[styles.fileName, { color: theme.colors.gray }]}>
        {computedFileName || (extension ? extension.toUpperCase() : fileType || 'File')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.softRed }]}>
      <View style={[styles.borderIndicator, { backgroundColor: theme.colors.primary }]} />

      <View style={styles.textWrapper}>
        {isMedia ? (
          renderMedia()
        ) : isFile ? (
          renderFileRow()
        ) : (
          <>
            <Text
              numberOfLines={1}
              style={[styles.senderName, { color: theme.colors.darkPrimary }]}>
              {senderName}
            </Text>
            <Text numberOfLines={1} style={[styles.textSnippet, { color: theme.colors.darkBrown }]}>
              {text}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: defaultTheme.colors.softRed,
    padding: appSize.width(1.5),
    borderRadius: appSize.width(2),
    width: 'auto',
    maxWidth: '100%',
    marginVertical: appSize.height(0.5),
  },
  borderIndicator: {
    width: 3,
    backgroundColor: defaultTheme.colors.primary,
    borderRadius: 3,
    marginRight: 8,
  },
  textWrapper: {
    flexShrink: 1,
  },
  senderName: {
    fontSize: appSize.font(11),
    fontWeight: '600',
    color: defaultTheme.colors.darkPrimary,
  },
  textSnippet: {
    fontSize: appSize.font(13),
    color: defaultTheme.colors.darkBrown,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionText: {
    fontSize: appSize.font(12),
    color: defaultTheme.colors.gray,
  },
  mediaThumb: {
    width: appSize.width(10),
    height: appSize.width(10),
    borderRadius: 6,
    marginLeft: 10,
    overflow: 'hidden',
    backgroundColor: defaultTheme.colors.mediaThumbBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    marginLeft: 6,
    color: defaultTheme.colors.gray,
  },
});

export default ReplyPreview;
