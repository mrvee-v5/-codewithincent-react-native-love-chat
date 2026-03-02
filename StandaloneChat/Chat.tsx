import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ChatProps, IMessage } from './types';
import MessageList from './components/MessageList';
import InputToolbar from './components/InputToolbar';
import { defaultTheme, ThemeProvider, useTheme } from './utils/theme';
import { KeyboardProvider, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * InnerChat is a chat component that wraps MessageList and InputToolbar.
 * It is responsible for handling keyboard and typing animations.
 * It also manages the state of the reply message.
 *
 * @param {ChatProps} props - The props object passed into the component.
 * @returns {ReactElement} - The rendered component.
 */
const InnerChat = (props: ChatProps) => {
  const theme = useTheme();

  const {
    messages = [],
    text: propText,
    onInputTextChanged,
    onSend,
    renderInputToolbar,
    renderChatHeader,
    renderChatFooter,
    containerStyle,
    keyboardShouldPersistTaps = 'never',
    onPressAttachment,
    onReply,
    onClearReply,
    renderUploadFooter,
  } = props;

  const [text, setText] = useState(propText || '');
  const [replyMessage, setReplyMessage] = useState<IMessage | null>(null);

  const d1 = React.useRef(new Animated.Value(0)).current;
  const d2 = React.useRef(new Animated.Value(0)).current;
  const d3 = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (propText !== undefined && propText !== text) {
      setText(propText);
    }
  }, [propText]);

  /**
   * Handles input text changes for the chat input field.
   * @param {string} newText - The new text value of the input field.
   */
  const handleInputTextChanged = (newText: string) => {
    setText(newText);
    onInputTextChanged?.(newText);
  };

  /**
   * Handles sending messages to the parent component.
   * If the new messages are an array, it will call the onSend callback with the new messages.
   * It will also clear the input text and reply message.
   */
  const handleSend = (newMessages: IMessage[]) => {
    if (Array.isArray(newMessages)) {
      onSend(newMessages);
    }
    setText('');
    onInputTextChanged?.('');
    setReplyMessage(null);
  };

  /**
   * Sets the reply message to the given message and calls the onReply callback with the given message.
   * @param {IMessage} message - The message to set as the reply message.
   */
  /**
   * Handles replying to a message.
   * @param {IMessage} message - The message to reply to.
   */
  const handleReply = (message: IMessage) => {
    setReplyMessage(message);
    onReply?.(message);
  };

  /**
   * Clears the reply message and calls the onClearReply callback.
   */
  const handleClearReply = () => {
    setReplyMessage(null);
    onClearReply?.();
  };

  useEffect(() => {
    /**
     * Creates an animated loop that will animate the given Animated.Value between 0 and 1, with the given delay.
     * The animation will ease in and out using the Easing.ease function.
     * The animation will also use the native driver for optimization.
     * @param {Animated.Value} v - The Animated Value to animate.
     * @param {number} delay - The delay in milliseconds before starting the animation.
     * @returns {Animated.Composition} - The animated composition loop.
     */
    /*******  e227a78a-5a33-4f67-832d-7f8a93de9609  *******/
    const mk = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true }
      );

    const a1 = mk(d1, 0);
    const a2 = mk(d2, 150);
    const a3 = mk(d3, 300);

    if (props.isTyping) {
      d1.setValue(0);
      d2.setValue(0);
      d3.setValue(0);
      a1.start();
      a2.start();
      a3.start();
    } else {
      a1.stop();
      a2.stop();
      a3.stop();
    }

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [props.isTyping]);

  /**
   * Renders an InputToolbar component with the given props.
   * If renderInputToolbar is provided, it will be used instead of the default InputToolbar.
   * @param {Object} inputProps - props to pass to the InputToolbar component
   * @returns {ReactElement} - the rendered InputToolbar component
   */
  const renderInput = () => {
    const inputProps = {
      ...props,
      text,
      onTextChanged: handleInputTextChanged,
      onSend: handleSend,
      onPressAttachment,
      replyMessage,
      onClearReply: handleClearReply,
      renderUploadFooter,
      renderAttachmentButton: props.renderAttachmentButton,
    };

    if (renderInputToolbar) {
      return renderInputToolbar(inputProps);
    }

    return <InputToolbar {...inputProps} />;
  };
  // Use safe area insets so that header and keyboard-aware content avoid the notch/home indicator
  const inset = useSafeAreaInsets();
  return (
    <View style={styles.keyboardAvoidingView}>
      {renderChatHeader ? (
        <View style={[styles.headerContainer, { paddingTop: inset.top }]}>
          {renderChatHeader?.()}
        </View>
      ) : null}

      <KeyboardStickyView
        style={[
          styles.contentContainer,
          containerStyle,
          { paddingTop: inset.top, paddingBottom: inset.bottom },
        ]}>
        <MessageList
          {...props}
          messages={messages}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          onReply={handleReply}
        />

        {props.isTyping && (
          <View style={[styles.typingContainer, { backgroundColor: theme.colors.verySoftGray }]}>
            <Animated.View
              style={[styles.dot, { backgroundColor: theme.colors.gray, opacity: d1 }]}
            />
            <Animated.View
              style={[styles.dot, { backgroundColor: theme.colors.gray, opacity: d2 }]}
            />
            <Animated.View
              style={[styles.dot, { backgroundColor: theme.colors.gray, opacity: d3 }]}
            />
          </View>
        )}
        {renderChatFooter?.()}
        {renderInput()}
      </KeyboardStickyView>
    </View>
  );
};

/**
 * A standalone chat component that wraps the InnerChat component.
 * It provides a KeyboardProvider to handle keyboard events and a ThemeProvider to apply the given theme.
 * @param {ChatProps} props - The props to pass to the InnerChat component, including the theme.
 */
const Chat = (props: ChatProps) => (
  <ThemeProvider theme={props.theme}>
    <KeyboardProvider>
      <InnerChat {...props} />
    </KeyboardProvider>
  </ThemeProvider>
);

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: defaultTheme.colors.white,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: defaultTheme.colors.white,
  },
  typingContainer: {
    alignSelf: 'flex-start',
    marginLeft: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: defaultTheme.colors.white,
    flex: 1,
  },
});

export default Chat;
