import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { appSize } from '../../utils';
import {  useTheme } from '../../utils/theme';
import { FileIcon} from '../Icons';

interface FileCardProps {
  fileName: string;
  color?: string;
  isMine?: boolean;
  time?: string;
}

export default function FileCard({
  fileName,
  isMine = false,
  time,
}: FileCardProps) {
  const theme = useTheme();
  
  // WhatsApp-style colors
  // Sent: Lighter green bubble, file card is slightly darker green/transparent
  // Received: White bubble, file card is light gray
  
  const cardBackgroundColor = isMine ? theme.colors.ownFileBg : theme.colors.otherFileBg;
  const textColor = isMine ? theme.colors.ownMessageText : theme.colors.otherMessageText;
  const subTextColor = isMine ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)';
  const iconColor = isMine ? theme.colors.white : theme.colors.darkRed;

  const getExtension = (name: string) => {
    return name.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const extension = getExtension(fileName);
  
  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.iconContainer}>
            <FileIcon size={24} color={iconColor} />
            <Text style={[styles.extensionText, { color: iconColor }]}>{extension}</Text>
        </View>
        <View style={styles.infoContainer}>
            <Text 
                style={[styles.fileName, { color: textColor }]} 
                numberOfLines={1} 
                ellipsizeMode="middle"
            >
                {fileName}
            </Text>
            <Text style={[styles.fileSize, { color: subTextColor }]}>
                1.2 MB • {extension}
            </Text>
        </View>
      </View>
      
      {/* Footer with timestamp */}
      <View style={styles.footer}>
         <Text style={[styles.timeText, { color: subTextColor }]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: appSize.width(60),
    maxWidth: appSize.width(75),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  extensionText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 11,
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingRight: 4,
      paddingBottom: 2,
  },
  timeText: {
      fontSize: 10,
  }
});
