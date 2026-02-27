import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, UIManager, findNodeHandle } from 'react-native';
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
    };

    if (renderInputToolbar) {
      return renderInputToolbar(inputProps);
    }
    return (
      <InputToolbar
        {...inputProps}
      />
    );
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
      }}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + containerTopOffset : 0}
      >
        <View style={styles.contentContainer}>
          <MessageList
            {...props}
            messages={messages}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            onReply={handleReply}
          />
          
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
});

export default Chat;
