import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Pressable } from 'react-native';
import { defaultTheme, useTheme } from '../utils/theme';
import { appSize } from '../utils';
import { EmojiIcon } from './Icons';

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
    placeholder = 'Message',
    placeholderTextColor = theme.colors.gray,
    textInputProps,
    onTextChanged,
    textInputStyle,
    multiline = true,
    maxComposerHeight = 100,
  } = props;

  const [scrollEnabled, setScrollEnabled] = useState(false);

  const handleContentSizeChange = (e: any) => {
    const contentHeight = e?.nativeEvent?.contentSize?.height;
    if (!contentHeight) return;

    const verticalPadding = defaultTheme.spacing.md * 2;

    setScrollEnabled(contentHeight + verticalPadding > maxComposerHeight);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={[styles.inputWrap, { overflow: 'hidden' }]}>
        {/* Emoji Button */}
        <Pressable onPress={textInputProps?.onEmojiPress} style={styles.emojiBtn}>
          <EmojiIcon size={22} color={theme.colors.mediumGray} />
        </Pressable>

        {/* Text Input */}
        <TextInput
          testID={placeholder}
          accessible
          accessibilityLabel={placeholder}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline={multiline}
          scrollEnabled={scrollEnabled}
          onChangeText={onTextChanged}
          onContentSizeChange={handleContentSizeChange}
          style={[styles.textInput, { color: theme.colors.textPrimary }, textInputStyle]}
          autoFocus={false}
          value={text}
          enablesReturnKeyAutomatically
          underlineColorAndroid="transparent"
          submitBehavior={'newline'}
          textAlignVertical={'top'}
          {...textInputProps}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'flex-start',
  },
  textInput: {
    flex: 1,
    fontSize: defaultTheme.typography.title - 1,
    backgroundColor: 'transparent',
    paddingLeft: appSize.width(4),
    paddingRight: appSize.width(12),
    paddingVertical: defaultTheme.spacing.md,
  },
  emojiBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sendBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sendText: {
    color: defaultTheme.colors.textPrimary, // keep existing color logic
    fontWeight: 'bold',
  },
});

export default Composer;
