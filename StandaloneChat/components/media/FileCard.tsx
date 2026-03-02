import { View, StyleSheet, Text } from 'react-native';
import { appSize } from '../../utils';
import { defaultTheme, useTheme } from '../../utils/theme';
import MessageStatus from '../MessageStatus';
import { FileIcon } from '../Icons';

interface FileCardProps {
  fileName: string;
  color?: string;
  isMine?: boolean;
  time?: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read';
}

/**
 * A reusable wrapper that displays a file message in a consistent layout around arbitrary chat content.
 * Props:
 * fileName: string - The name of the file to be displayed.
 * isMine?: boolean - Whether the file is from the current user or not. Defaults to false.
 * time?: string - The timestamp to be displayed in the footer. Optional.
 * status?: 'pending' | 'sent' | 'delivered' | 'read' - The status of the file to be displayed in the footer. Optional.
 */
/*******  e93b6b15-23c4-4a42-929d-26f1cb3a7d6d  *******/
export default function FileCard({ fileName, isMine = false, time, status }: FileCardProps) {
  const theme = useTheme();

  const cardBackgroundColor = isMine
    ? theme.colors.surfaceBubbleOutgoing
    : theme.colors.surfaceBubbleIncoming;
  const textColor = isMine ? theme.colors.textOnBubbleOutgoing : theme.colors.textOnBubbleIncoming;
  const subTextColor = isMine ? theme.colors.textTimestampMine : theme.colors.mediumGray;
  const iconColor = isMine ? theme.colors.iconOnBubbleOutgoing : theme.colors.iconAccentDanger;

  /**
   * Returns the file extension from the given file name.
   * If no extension is found, returns 'FILE'.
   * @param {string} name - The file name.
   * @returns {string} The file extension in uppercase.
   */
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
            ellipsizeMode="middle">
            {fileName}
          </Text>
          <Text style={[styles.fileSize, { color: subTextColor }]}>1.2 MB • {extension}</Text>
        </View>
      </View>

      {/* Footer with timestamp (only when provided) */}
      {time ? (
        <View style={styles.footer}>
          <Text style={[styles.timeText, { color: subTextColor }]}>{time}</Text>
          {isMine && status ? <MessageStatus status={status} isMine /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: appSize.width(60),
    maxWidth: appSize.width(75),
    position: 'relative',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: defaultTheme.spacing.lg - 2,
    marginBottom: defaultTheme.spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: defaultTheme.spacing.md + 2,
  },
  extensionText: {
    fontSize: defaultTheme.typography.micro,
    fontWeight: 'bold',
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: defaultTheme.typography.body,
    fontWeight: '500',
    marginBottom: defaultTheme.spacing.xs / 2,
  },
  fileSize: {
    fontSize: defaultTheme.typography.body2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: defaultTheme.spacing.xs,
    paddingBottom: defaultTheme.spacing.xs / 2,
  },
  timeText: {
    fontSize: defaultTheme.typography.caption,
  },
});
