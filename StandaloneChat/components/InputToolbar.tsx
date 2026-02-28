import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated, Keyboard, Platform } from 'react-native';
import Composer from './Composer';
import { defaultTheme, useTheme } from '../utils/theme';
import { PlusIcon, SendIcon } from './Icons';
import UploadFooter from './UploadFooter';
import FooterReplyPreview from './FooterReplyPreview';
import { IMessage } from '../types';

interface InputToolbarProps {
  onSend?: (messages: any[]) => void;
  text?: string;
  onTextChanged?: (text: string) => void;
  renderComposer?: (props: any) => React.ReactNode;
  renderSend?: (props: any) => React.ReactNode;
  user: any;
  placeholder?: string;
  onPressAttachment?: (type: string) => void;
  replyMessage?: IMessage | null;
  onClearReply?: () => void;
  renderUploadFooter?: (props: any) => React.ReactNode;
  renderAttachmentButton?: (props: {
    toggle: () => void;
    showing: boolean;
    onPressAttachment?: (type: string) => void;
    theme: any;
  }) => React.ReactNode;
}

const InputToolbar = (props: InputToolbarProps) => {
  const theme = useTheme();
  const { 
    onSend, 
    text, 
    renderComposer, 
    renderSend, 
    user, 
    onPressAttachment,
    replyMessage,
    onClearReply,
    renderUploadFooter,
    renderAttachmentButton,
    ...rest 
  } = props;

  const [showUploadFooter, setShowUploadFooter] = useState(false);
  const [keyboardHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
        setShowUploadFooter(false);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      e => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = () => {
    if (text && text.trim().length > 0) {
      const message = {
        _id: Math.round(Math.random() * 1000000),
        text: text.trim(),
        createdAt: new Date(),
        user: user,
        replyTo: replyMessage,
      };
      onSend?.([message]);
      onClearReply?.();
    }
  };

  const toggleUploadFooter = () => {
    if (showUploadFooter) {
      setShowUploadFooter(false);
      Keyboard.dismiss();
    } else {
      setShowUploadFooter(true);
      Keyboard.dismiss();
    }
  };

  const handleActionPress = (type: string) => {
    onPressAttachment?.(type);
    setShowUploadFooter(false);
  };

  return (
    <View>
      {replyMessage && (
        <FooterReplyPreview 
          chatMessage={replyMessage} 
          clearReply={onClearReply} 
          userId={user._id} 
        />
      )}
      
      <View style={[styles.container, { borderTopColor: theme.colors.borderGray, backgroundColor: theme.colors.white }]}>
        {renderAttachmentButton ? (
          renderAttachmentButton({
            toggle: toggleUploadFooter,
            showing: showUploadFooter,
            onPressAttachment,
            theme,
          })
        ) : (
          <Pressable onPress={toggleUploadFooter} style={styles.addButton} accessibilityRole="button" accessibilityLabel="Open attachments">
             <PlusIcon size={24} color={theme.colors.darkRed} />
          </Pressable>
        )}

        {renderComposer ? (
          renderComposer(props)
        ) : (
          <Composer 
            {...rest} 
            text={text} 
            onSend={handleSend} 
            textInputProps={{
               onFocus: () => setShowUploadFooter(false)
            }}
          />
        )}
        
        {renderSend ? (
          renderSend({ ...props, onSend: handleSend })
        ) : (
          <Pressable onPress={handleSend} style={styles.sendButton} disabled={!text || text.trim().length === 0}>
             <View style={[styles.sendIconWrapper, { backgroundColor: theme.colors.darkRed }, (!text || text.trim().length === 0) && { backgroundColor: theme.colors.gray }]}>
                <SendIcon size={18} color={theme.colors.white} />
             </View>
          </Pressable>
        )}
      </View>

      {showUploadFooter && (
        renderUploadFooter ? (
          renderUploadFooter({
            onActionPress: handleActionPress,
            theme,
          })
        ) : (
          <UploadFooter onActionPress={handleActionPress} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: defaultTheme.colors.borderGray,
    backgroundColor: defaultTheme.colors.white,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  addButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  sendButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  sendIconWrapper: {
    backgroundColor: defaultTheme.colors.darkRed,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendWrapper: {
    backgroundColor: defaultTheme.colors.gray,
  },
});

export default InputToolbar;
