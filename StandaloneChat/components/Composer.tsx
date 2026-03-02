import React, { useRef, useState } from 'react';
import { TextInput, StyleSheet, Platform, View, Pressable, Animated, Easing } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { defaultTheme, useTheme } from '../utils/theme';
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

/**
 * A text input component for rendering a chat composer.
 * The component accepts a text as a prop, and renders it as the value of the text input.
 * The component also accepts a placeholder, placeholder text color, text input props, and a callback function to handle text changes.
 * The component has a max height of 100, and a min height of 40, and the height of the component is animated to match the content size.
 * The component is scrollable if the content exceeds the maximum allowed height.
 * The component renders an emoji icon on the right side of the text input.
 * The component has a primary color as the background color, and a medium gray color for the text and the emoji icon.
 * The component has a test ID and an accessibility label.
 * @param {ComposerProps} props - Props for rendering the chat composer.
 * @param {string} [props.text] - The value of the text input.
 * @param {string} [props.placeholder] - The placeholder of the text input.
 * @param {string} [props.placeholderTextColor] - The text color of the placeholder.
 * @param {any} [props.textInputProps] - Props for the text input.
 * @param {() => void} [props.onTextChanged] - A callback function to handle text changes.
 * @param {boolean} [props.multiline=true] - Whether the text input should accept multiple lines of text.
 * @param {number} [props.maxComposerHeight=100] - The maximum height of the component.
 * @param {number} [props.minComposerHeight=40] - The minimum height of the component.
 */
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
    minComposerHeight = 40,
  } = props;

  const animHeight = useRef(new Animated.Value(minComposerHeight)).current;
  const lastHeightRef = useRef(minComposerHeight);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  /**
   * Animates the height of the composer text input container to the given target value.
   * If the target value is the same as the current height, the animation is skipped.
   * The animation duration is 180ms, and the easing function is Easing.out(Easing.ease).
   * The animation is driven by the JavaScript engine, not the native driver.
   */
  const animateTo = (target: number) => {
    if (target === lastHeightRef.current) return;
    lastHeightRef.current = target;
    Animated.timing(animHeight, {
      toValue: target,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  /**
   * Handles changes in the size of the composer text input, animates the
   * height of the container to match the content size, and enables/disables
   * scrolling depending on whether the content exceeds the maximum allowed height.
   * @param {any} e - The event containing the new content size.
   */
  const handleContentSizeChange = (e: any) => {
    const contentHeight = e?.nativeEvent?.contentSize?.height;
    if (!contentHeight) return;

    const verticalPadding = moderateScale(defaultTheme.spacing.md) * 2;
    const desiredHeight = Math.max(
      minComposerHeight,
      Math.min(maxComposerHeight, Math.ceil(contentHeight + verticalPadding))
    );

    animateTo(desiredHeight);
    const shouldScroll = contentHeight + verticalPadding > maxComposerHeight;
    if (shouldScroll !== scrollEnabled) {
      setScrollEnabled(shouldScroll);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Animated.View
        style={[
          styles.inputWrap,
          {
            height: animHeight,
            overflow: 'hidden',
          },
        ]}>
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

        <Pressable onPress={textInputProps?.onEmojiPress} style={styles.emojiBtn}>
          <EmojiIcon size={22} color={theme.colors.mediumGray} />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginHorizontal: moderateScale(defaultTheme.spacing.md),
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'flex-start',
  },
  textInput: {
    fontSize: defaultTheme.typography.title,
    backgroundColor: 'transparent',
    paddingLeft: moderateScale(defaultTheme.spacing.lg),
    paddingRight: moderateScale(defaultTheme.spacing.lg + 32),
    paddingTop: moderateScale(defaultTheme.spacing.md),
    // paddingBottom: moderateScale(defaultTheme.spacing.md),
  },
  emojiBtn: {
    position: 'absolute',
    right: moderateScale(defaultTheme.spacing.md),
    bottom:
      Platform.OS === 'ios'
        ? moderateScale(defaultTheme.spacing.md)
        : moderateScale(defaultTheme.spacing.lg),
  },
});

export default Composer;
