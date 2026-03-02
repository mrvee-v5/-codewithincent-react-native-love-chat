import React, { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import Composer from './Composer';
import { useTheme } from '../utils/theme';
import { SendIcon, ImageIcon, VideoIcon, MicIcon, ChevronDownIcon } from './Icons';
import FooterReplyPreview from './FooterReplyPreview';
import { IMessage } from '../types';

interface InputToolbarProps {
  onSend?: (messages: any[]) => void;
  text?: string;
  onTextChanged?: (text: string) => void;
  renderComposer?: (props: any) => React.ReactNode;
  renderSend?: (props: any) => React.ReactNode;
  renderToggleIcon?: (props: {
    expanded: boolean;
    onToggle: () => void;
    rotateAnim: Animated.Value;
  }) => React.ReactNode;
  user: any;
  placeholder?: string;
  onPressAttachment?: (type: string) => void;
  replyMessage?: IMessage | null;
  onClearReply?: () => void;
  renderUploadFooter?: (props: any) => React.ReactNode;
  enableToggleAnimation?: boolean;
  renderInputLeftContent?: (props: any) => React.ReactNode;
  rightInputContentWidth?: number;
}

/**
 * Component to render the input toolbar with the given props.
 * @param props {Object} - props to pass to the InputToolbar component
 * @returns {ReactElement} - the rendered InputToolbar component
 */
const InputToolbar = (props: InputToolbarProps) => {
  const ICONS_WIDTH = props.rightInputContentWidth || 110;
  const theme = useTheme();
  const {
    onSend,
    text,
    user,
    onPressAttachment,
    replyMessage,
    onClearReply,
    renderComposer,
    renderSend,
    renderUploadFooter,
    renderToggleIcon,
    enableToggleAnimation = true,
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);

  // Animated values drive the attachment icons row and the optional toggle rotation
  const iconsAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Fades and resizes the attachment icons row when the input expands/collapses
  const animateIcons = (show: boolean) => {
    Animated.timing(iconsAnim, {
      toValue: show ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  /**
   * Animates the toggle icon to rotate when the input expands/collapses.
   * @param {boolean} expanded - whether the input is expanded or not
   */
  const animateToggleIcon = (expanded: boolean) => {
    if (!enableToggleAnimation) {
      return;
    }
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  /**
   * Called when the input field gains focus.
   * Sets the isFocused state to true, animates the attachment icons row to hide,
   * and animates the toggle icon to rotate.
   */
  const handleFocus = () => {
    setIsFocused(true);
    animateIcons(false);
    animateToggleIcon(true);
  };

  /**
   * Called when the input field loses focus.
   * Sets the isFocused state to false, animates the attachment icons row to show,
   * and animates the toggle icon to its original state.
   */
  const handleBlur = () => {
    if (!text || text.trim().length === 0) {
      setIsFocused(false);
      animateIcons(true);
      animateToggleIcon(false);
    }
  };

  /**
   * Handles sending a message. If the input field contains text, it trims the text,
   * creates a new message object, calls the onSend callback with the message,
   * and clears the reply message.
   */
  const handleSend = () => {
    if (text && text.trim().length > 0) {
      const message = {
        id: Math.random().toString(),
        text: text.trim(),
        createdAt: new Date(),
        user,
        replyTo: replyMessage,
      };

      onSend?.([message]);
      onClearReply?.();
    }
  };

  const hasText = !!text && text.trim().length > 0;

  const animatedWidth = iconsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ICONS_WIDTH],
  });
  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  /**
   * Toggles the input field between expanded and collapsed states.
   * If the input field is currently expanded, it will collapse and hide the attachment icons row.
   * If the input field is currently collapsed, it will expand and show the attachment icons row.
   */
  const handleTogglePress = () => {
    const next = !isFocused;
    setIsFocused(next);
    animateIcons(!next);
    animateToggleIcon(next);
  };

  return (
    <View>
      {replyMessage && (
        <FooterReplyPreview chatMessage={replyMessage} clearReply={onClearReply} userId={user.id} />
      )}

      <View
        style={[
          styles.container,
          {
            borderTopColor: theme.colors.borderGray,
            backgroundColor: theme.colors.white,
          },
        ]}>
        {renderToggleIcon ? (
          renderToggleIcon({ expanded: isFocused, onToggle: handleTogglePress, rotateAnim })
        ) : (
          <Pressable onPress={handleTogglePress} style={[styles.iconBtn, styles.toggleBtn]}>
            <Animated.View style={rotateStyle}>
              <ChevronDownIcon size={20} color={theme.colors.mediumGray} />
            </Animated.View>
          </Pressable>
        )}

        <Animated.View
          style={[
            {
              width: animatedWidth,
              opacity: iconsAnim,
              overflow: 'hidden',
            },
          ]}>
          {props.renderInputLeftContent ? (
            props.renderInputLeftContent(props)
          ) : (
            <View style={styles.toolsRow}>
              <Pressable onPress={() => onPressAttachment?.('Image')} style={styles.iconBtn}>
                <ImageIcon size={22} color={theme.colors.darkRed} />
              </Pressable>
              <Pressable onPress={() => onPressAttachment?.('Video')} style={styles.iconBtn}>
                <VideoIcon size={22} color={theme.colors.darkRed} />
              </Pressable>
              <Pressable onPress={() => onPressAttachment?.('Audio')} style={styles.iconBtn}>
                <MicIcon size={22} color={theme.colors.darkRed} />
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* Composer */}
        <View style={styles.composerWrapper}>
          {renderComposer ? (
            renderComposer(props)
          ) : (
            <Composer
              {...rest}
              text={text}
              onSend={handleSend}
              textInputProps={{
                multiline: true,
                onFocus: handleFocus,
                onBlur: handleBlur,
              }}
            />
          )}
        </View>

        {/* Send */}
        <View style={styles.rightActions}>
          {hasText &&
            (renderSend ? (
              renderSend({ ...props, onSend: handleSend })
            ) : (
              <Pressable onPress={handleSend} style={styles.sendButton}>
                <View style={[styles.sendIconWrapper, { backgroundColor: theme.colors.darkRed }]}>
                  <SendIcon size={18} color={theme.colors.white} />
                </View>
              </Pressable>
            ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  toggleBtn: {
    marginRight: 2,
  },
  composerWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  rightActions: {
    marginLeft: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sendButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sendIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InputToolbar;
