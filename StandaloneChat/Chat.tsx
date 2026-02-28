import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  UIManager,
  findNodeHandle,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatProps, IMessage } from './types';
import MessageList from './components/MessageList';
import InputToolbar from './components/InputToolbar';
import { defaultTheme, ThemeProvider, useTheme } from './utils/theme';

const InnerChat = (props: ChatProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [containerTopOffset, setContainerTopOffset] = useState(0);
  const containerRef = React.useRef<SafeAreaView | null>(null);
  const d1 = React.useRef(new Animated.Value(0)).current;
  const d2 = React.useRef(new Animated.Value(0)).current;
  const d3 = React.useRef(new Animated.Value(0)).current;
  const {
    messages = [],
    text: propText,
    onInputTextChanged,
    onSend,
    renderInputToolbar,
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

  useEffect(() => {
    if (propText !== undefined && propText !== text) {
      setText(propText);
    }
  }, [propText]);

  const handleInputTextChanged = (newText: string) => {
    setText(newText);
    if (onInputTextChanged) {
      onInputTextChanged(newText);
    }
  };

  const handleSend = (newMessages: IMessage[]) => {
    if (Array.isArray(newMessages)) {
      onSend(newMessages);
    }
    setText('');
    if (onInputTextChanged) {
      onInputTextChanged('');
    }
    setReplyMessage(null);
  };

  const handleReply = (message: IMessage) => {
    setReplyMessage(message);
    onReply?.(message);
  };

  const handleClearReply = () => {
    setReplyMessage(null);
    onClearReply?.();
  };

  useEffect(() => {
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

  return (
    <SafeAreaView
      ref={containerRef}
      style={[styles.container, { backgroundColor: theme.colors.white }, containerStyle]}
      onLayout={() => {
        const node = findNodeHandle(containerRef.current as unknown as any);
        if (node) {
          UIManager.measureInWindow(node, (_x, y) => {
            if (typeof y === 'number') {
              setContainerTopOffset(Math.max(0, Math.round(y)));
            }
          });
        }
      }}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + containerTopOffset : 0}>
        <View style={styles.contentContainer}>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Chat = (props: ChatProps) => (
  <ThemeProvider theme={props.theme}>
    <InnerChat {...props} />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultTheme.colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
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
});

export default Chat;
