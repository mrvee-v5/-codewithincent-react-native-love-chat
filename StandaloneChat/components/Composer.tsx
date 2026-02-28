import React, { useState } from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';
import { defaultTheme, useTheme } from '../utils/theme';

interface ComposerProps {
  text?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  textInputProps?: any;
  onTextChanged?: (text: string) => void;
  onSend?: () => void;
  textInputStyle?: any;
  multiline?: boolean;
  maxComposerHeight?: number;
  minComposerHeight?: number;
}

const Composer = (props: ComposerProps) => {
  const theme = useTheme();
  const {
    text = '',
    placeholder = 'Type a message...',
    placeholderTextColor = theme.colors.gray,
    textInputProps,
    onTextChanged,
    textInputStyle,
    multiline = true,
    maxComposerHeight = 100,
    minComposerHeight = 40,
  } = props;

  const [composerHeight, setComposerHeight] = useState(minComposerHeight);

  const handleContentSizeChange = (e: any) => {
    const contentSize = e.nativeEvent.contentSize;
    if (!contentSize) return;

    if (
      !composerHeight ||
      (composerHeight && composerHeight < maxComposerHeight) ||
      (composerHeight === maxComposerHeight && contentSize.height < maxComposerHeight)
    ) {
      setComposerHeight(
        Math.max(minComposerHeight, Math.min(maxComposerHeight, contentSize.height))
      );
    }
  };

  return (
    <TextInput
      testID={placeholder}
      accessible
      accessibilityLabel={placeholder}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      multiline={multiline}
      onChangeText={onTextChanged}
      onContentSizeChange={handleContentSizeChange}
      style={[
        styles.textInput,
        { color: theme.colors.textPrimary, backgroundColor: theme.colors.primary },
        textInputStyle,
        {
          height: composerHeight,
        },
      ]}
      autoFocus={false}
      value={text}
      enablesReturnKeyAutomatically
      underlineColorAndroid="transparent"
      blurOnSubmit={false}
      {...textInputProps}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    fontSize: defaultTheme.typography.title,
    lineHeight: 22,
    color: defaultTheme.colors.black,
    backgroundColor: defaultTheme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: defaultTheme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? defaultTheme.spacing.md : defaultTheme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? defaultTheme.spacing.md : defaultTheme.spacing.sm,
    marginHorizontal: defaultTheme.spacing.md,
  },
});

export default Composer;
