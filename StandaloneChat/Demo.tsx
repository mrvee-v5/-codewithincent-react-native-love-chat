import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { Chat, IMessage } from './index';
import VideoCard from '../ChatScreen/media/VideoCard';
import AudioCard from '../ChatScreen/media/AudioCard';

const Demo = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const user = { _id: 1, name: 'Developer' };

  // Custom upload options
  const uploadOptions = [
    { id: '1', label: 'Image', icon: '📷' },
    { id: '2', label: 'Video', icon: '🎥' },
    { id: '9', label: 'Audio', icon: '🎙️' },
    { id: '3', label: 'Document', icon: '📄' },
    { id: '4', label: 'XLS', icon: '📊' },
    { id: '5', label: 'DOC', icon: '📝' },
    { id: '6', label: 'PPT', icon: '📉' },
    { id: '7', label: 'TXT', icon: '🗒️' },
    { id: '8', label: 'Location', icon: '📍' },
  ];

  const renderCustomUploadFooter = (props: any) => {
    const { onActionPress, theme } = props;
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 10,
          justifyContent: 'space-around',
          backgroundColor: '#ffffff',
        }}>
        {uploadOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => onActionPress(option.label)}
            style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>{option.icon}</Text>
            <Text style={{ fontSize: 12, color: '#555' }}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  useEffect(() => {
    const now = Date.now();

    setMessages([
      // 🔵 TODAY
      {
        _id: 100,
        text: 'Are we pushing the new release today?',
        createdAt: new Date(now - 1000 * 60 * 2),
        user: { _id: 2, name: 'React Native' },
      },
      {
        _id: 101,
        text: 'Yes, after final testing 🚀',
        createdAt: new Date(now - 1000 * 60 * 1),
        user: { _id: 1, name: 'Developer' },
      },

      // 🔵 TODAY - MORNING
      {
        _id: 102,
        text: 'Morning! Did you check the animations?',
        createdAt: new Date(now - 1000 * 60 * 60 * 6),
        user: { _id: 2, name: 'React Native' },
      },
      {
        _id: 103,
        text: 'Yes, swipe-to-reply feels smooth now.',
        createdAt: new Date(now - 1000 * 60 * 60 * 5.8),
        user: { _id: 1, name: 'Developer' },
        reactions: [{ userId: 2, emoji: '🔥' }],
      },

      // 🟡 YESTERDAY
      {
        _id: 104,
        text: 'Blur effect is now working on Expo.',
        createdAt: new Date(now - 1000 * 60 * 60 * 24),
        user: { _id: 1, name: 'Developer' },
      },
      {
        _id: 105,
        text: 'Nice! Did you implement fallback?',
        createdAt: new Date(now - 1000 * 60 * 60 * 23.5),
        user: { _id: 2, name: 'React Native' },
      },
      {
        _id: 106,
        text: 'Yes, universal adapter with dynamic require.',
        createdAt: new Date(now - 1000 * 60 * 60 * 23),
        user: { _id: 1, name: 'Developer' },
        reactions: [{ userId: 2, emoji: '👏' }],
      },

      // 🟠 2 DAYS AGO
      {
        _id: 107,
        text: 'Testing root siblings overlay.',
        createdAt: new Date(now - 1000 * 60 * 60 * 48),
        user: { _id: 1, name: 'Developer' },
      },
      {
        _id: 108,
        text: 'Long press popup looks clean 👌',
        createdAt: new Date(now - 1000 * 60 * 60 * 47.5),
        user: { _id: 2, name: 'React Native' },
        reactions: [{ userId: 1, emoji: '💯' }],
      },

      // 🟣 3 DAYS AGO - NIGHT
      {
        _id: 109,
        text: 'Working late today...',
        createdAt: new Date(now - 1000 * 60 * 60 * 72),
        user: { _id: 1, name: 'Developer' },
      },
      {
        _id: 110,
        text: 'Don’t forget to sleep 😴',
        createdAt: new Date(now - 1000 * 60 * 60 * 71.5),
        user: { _id: 2, name: 'React Native' },
      },

      // 🔴 4 DAYS AGO
      {
        _id: 111,
        text: 'Swipe to reply implemented!',
        createdAt: new Date(now - 1000 * 60 * 60 * 96),
        user: { _id: 1, name: 'Developer' },
      },
      {
        _id: 112,
        text: 'Reactions next?',
        createdAt: new Date(now - 1000 * 60 * 60 * 95.5),
        user: { _id: 2, name: 'React Native' },
      },
      {
        _id: 113,
        text: 'Yes. Adding emoji picker soon.',
        createdAt: new Date(now - 1000 * 60 * 60 * 95),
        user: { _id: 1, name: 'Developer' },
        reactions: [{ userId: 2, emoji: '❤️' }],
      },

      // 🟢 5 DAYS AGO
      {
        _id: 114,
        text: 'Initial chat layout completed.',
        createdAt: new Date(now - 1000 * 60 * 60 * 120),
        user: { _id: 1, name: 'Developer' },
      },
      {
        _id: 115,
        text: 'Scrolling performance looks good.',
        createdAt: new Date(now - 1000 * 60 * 60 * 119.5),
        user: { _id: 2, name: 'React Native' },
      },
      {
        _id: 116,
        text: 'Let’s optimize message rendering next.',
        createdAt: new Date(now - 1000 * 60 * 60 * 118),
        user: { _id: 1, name: 'Developer' },
      },
      // 🟤 FILE TYPES - MIXED (6 DAYS AGO)

      {
        _id: 117,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 144),
        user: { _id: 2, name: 'React Native' },
        image: 'https://picsum.photos/400/300',
        fileType: 'image',
      },

      {
        _id: 118,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 143.5),
        user: { _id: 1, name: 'Developer' },
        image: 'https://picsum.photos/300/400',
        fileType: 'image',
        reactions: [{ userId: 2, emoji: '😍' }],
      },

      {
        _id: 119,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 143),
        user: { _id: 2, name: 'React Native' },
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        fileType: 'video',
      },

      {
        _id: 120,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 142.5),
        user: { _id: 1, name: 'Developer' },
        video: 'https://www.w3schools.com/html/movie.mp4',
        fileType: 'video',
      },

      {
        _id: 121,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 142),
        user: { _id: 2, name: 'React Native' },
        audio: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
        fileType: 'audio',
      },

      {
        _id: 122,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 141.5),
        user: { _id: 1, name: 'Developer' },
        audio: 'https://samplelib.com/lib/preview/mp3/sample-12s.mp3',
        reactions: [{ userId: 2, emoji: '🎧' }],
        fileType: 'audio',
      },

      {
        _id: 123,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 141),
        user: { _id: 2, name: 'React Native' },
        fileType: 'pdf',
        fileName: 'Design_System_v2.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },

      {
        _id: 124,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 140.5),
        user: { _id: 1, name: 'Developer' },
        fileType: 'file',
        fileName: 'Budget_2026.xls',
        fileUrl: 'https://example.com/budget.xls',
      },

      {
        _id: 125,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 140),
        user: { _id: 2, name: 'React Native' },
        fileType: 'file',
        fileName: 'Architecture.doc',
        fileUrl: 'https://example.com/architecture.doc',
        reactions: [{ userId: 1, emoji: '📄' }],
      },

      {
        _id: 126,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 139.5),
        user: { _id: 1, name: 'Developer' },
        fileType: 'file',
        fileName: 'Marketing_Pitch.ppt',
        fileUrl: 'https://example.com/pitch.ppt',
      },

      {
        _id: 127,
        text: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 139),
        user: { _id: 2, name: 'React Native' },
        fileType: 'file',
        fileName: 'changelog.txt',
        fileUrl: 'https://example.com/changelog.txt',
      },

      // 🟣 REPLY TO FILE EXAMPLE

      {
        _id: 128,
        text: 'This PDF looks good 👍',
        createdAt: new Date(now - 1000 * 60 * 60 * 138.5),
        user: { _id: 1, name: 'Developer' },
        replyTo: {
          _id: 123,
          text: '',
          createdAt: new Date(now - 1000 * 60 * 60 * 141),
          user: { _id: 2, name: 'React Native' },
          fileName: 'Design_System_v2.pdf',
        },
      },

      {
        _id: 129,
        text: 'We should revise slide 3.',
        createdAt: new Date(now - 1000 * 60 * 60 * 138),
        user: { _id: 2, name: 'React Native' },
        replyTo: {
          _id: 126,
          text: '',
          createdAt: new Date(now - 1000 * 60 * 60 * 139.5),
          user: { _id: 1, name: 'Developer' },
          fileName: 'Marketing_Pitch.ppt',
        },
      },
    ]);
  }, []);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) => [...newMessages, ...previousMessages]);
  }, []);

  const handleAttachment = (type: string) => {
    switch (type) {
      case 'Image':
        const imageMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: user,
          image: 'https://picsum.photos/300/200',
          fileType: 'image',
        };
        onSend([imageMessage]);
        break;
      case 'Video':
        const videoMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: user,
          video: 'https://www.w3schools.com/html/mov_bbb.mp4',
          fileType: 'video',
        };
        onSend([videoMessage]);
        break;
      case 'Audio':
        const audioMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: user,
          audio: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
          fileType: 'audio',
        };
        onSend([audioMessage]);
        break;
      case 'Document':
        const docMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: user,
          fileType: 'pdf',
          fileName: 'Project_Report.pdf',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        };
        onSend([docMessage]);
        break;
      case 'XLS':
        const xlsMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: user,
          fileType: 'file',
          fileName: 'Financial_Q3.xls',
          fileUrl: 'https://example.com/dummy.xls',
        };
        onSend([xlsMessage]);
        break;
      case 'DOC':
        const docxMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: user,
          fileType: 'file',
          fileName: 'Meeting_Notes.doc',
          fileUrl: 'https://example.com/dummy.doc',
        };
        onSend([docxMessage]);
        break;
      case 'PPT':
        const pptMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: user,
          fileType: 'file',
          fileName: 'Product_Pitch.ppt',
          fileUrl: 'https://example.com/dummy.ppt',
        };
        onSend([pptMessage]);
        break;
      case 'TXT':
        const txtMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: user,
          fileType: 'file',
          fileName: 'readme.txt',
          fileUrl: 'https://example.com/dummy.txt',
        };
        onSend([txtMessage]);
        break;
      default:
        Alert.alert('Attachment', `You selected: ${type}`);
    }
  };

  const handleReaction = (msg: IMessage, reaction: string) => {
    console.log('Reacted:', reaction, 'to msg:', msg._id);
    // Update message with reaction logic here
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id === msg._id) {
          return { ...m, reactions: [{ userId: 1, emoji: reaction }] };
        }
        return m;
      })
    );
  };

  const handleDeleteMessage = (msg: IMessage) => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setMessages((prev) => prev.filter((m) => m._id !== msg._id));
        },
      },
    ]);
  };

  const handleDownloadFile = (msg: IMessage) => {
    Alert.alert('Download', `Downloading ${msg.fileName || 'file'}...`);
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const demoTheme =
    themeMode === 'dark'
      ? {
          colors: {
            white: '#0b0f12',
            lightGrey: '#12171d',
            softGray: '#0f1419',
            verySoftGray: '#0e1318',
            primary: '#4fd1a5',
            darkRed: '#ff5757',
            timestamp: '#96a2ab',
            ownMessageBubble: '#2d7cff',
            otherMessageBubble: '#1b2430',
            ownMessageText: '#ffffff',
            otherMessageText: '#e6e6e6',
            ownFileBg: 'rgba(255,255,255,0.10)',
            otherFileBg: 'rgba(255,255,255,0.06)',
          },
        }
      : {};

  const renderVideo = (p) => {
    console.log('PPPPPPP =>', p);
    return (
      <VideoCard
        file={{ uri: p.video }}
        setFullScreen={p.setFullScreen}
        isFullScreen={p.isFullScreen}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleTheme} style={styles.toggleButton}>
          <Text style={styles.toggleText}>
            {themeMode === 'light' ? 'Enable Dark Theme' : 'Disable Dark Theme'}
          </Text>
        </TouchableOpacity>
      </View>
      <Chat
        messages={messages}
        isLoadingEarlier
        isTyping
        loadEarlier
        onSend={onSend}
        user={user}
        placeholder="Type a message..."
        onPressAttachment={handleAttachment}
        onReaction={handleReaction}
        renderUploadFooter={renderCustomUploadFooter}
        onDeleteMessage={handleDeleteMessage}
        onDownloadFile={handleDownloadFile}
        renderMessageVideo={renderVideo}
        renderMessageAudio={(p) => {
          console.log('PPPPPPP =>', JSON.stringify(p, null, 6));
          return <AudioCard uri={p.audio} />;
        }}
        theme={demoTheme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  toggleText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
});

export default Demo;
