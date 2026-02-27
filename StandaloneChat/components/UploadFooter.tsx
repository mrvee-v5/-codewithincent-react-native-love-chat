import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appSize } from '../utils';
import { defaultTheme, useTheme } from '../utils/theme';
import { ImageIcon, VideoIcon, FileIcon } from './Icons';

const uploadOptions = [
  { id: '1', label: 'Image', icon: ImageIcon },
  { id: '2', label: 'Video', icon: VideoIcon },
  { id: '3', label: 'Document', icon: FileIcon },
];

const UploadFooter = ({
  onActionPress,
}: {
  onActionPress: (type: string) => void;
}) => {
  const inset = useSafeAreaInsets();
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.verySoftGray }, { paddingBottom: inset.bottom + 20 }]}>
      {uploadOptions.map(item => {
        const Icon = item.icon;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.iconBox}
            onPress={() => onActionPress(item.label)}
          >
            <Icon size={22} color={theme.colors.darkRed} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: appSize.width(3),
    backgroundColor: defaultTheme.colors.verySoftGray,
    justifyContent: 'space-between',
  },
  iconBox: {
    padding: 10,
  },
});

export default UploadFooter;
