import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatProps, IMessage } from './types';
import MessageList from './components/MessageList';
import InputToolbar from './components/InputToolbar';
import { defaultTheme, ThemeProvider, useTheme } from './utils/theme';

const InnerChat = (props: ChatProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
  const [inputHeight, setInputHeight] = useState(0);

  const d1 = React.useRef(new Animated.Value(0)).current;
  const d2 = React.useRef(new Animated.Value(0)).current;
  const d3 = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (propText !== undefined && propText !== text) {
      setText(propText);
    }
  }, [propText]);

  const handleInputTextChanged = (newText: string) => {
    setText(newText);
    onInputTextChanged?.(newText);
  };

  const handleSend = (newMessages: IMessage[]) => {
    if (Array.isArray(newMessages)) {
      onSend(newMessages);
    }
    setText('');
    onInputTextChanged?.('');
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

  const handleInputLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setInputHeight(height);
  };

  const bottomInset = inputHeight + insets.bottom + (props.isTyping ? 40 : 0); // approximate typing indicator height

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.contentContainer, containerStyle]}>
        <MessageList
          {...props}
          messages={messages}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          onReply={handleReply}
          contentContainerStyle={{ paddingBottom: bottomInset }}
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

        <View onLayout={handleInputLayout}>{renderInput()}</View>
      </View>
    </KeyboardAvoidingView>
  );
};

const Chat = (props: ChatProps) => (
  <ThemeProvider theme={props.theme}>
    <InnerChat {...props} />
  </ThemeProvider>
);

const styles = StyleSheet.create({
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
