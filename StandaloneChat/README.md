# React Native Standalone Chat

A customizable chat UI component for React Native with replies, reactions, media attachments, theming, and performance optimizations.

## Features

- Replies and swipe-to-reply interactions
- Reactions with overlay UI
- Image, video, audio, and generic file attachments
- Load earlier messages header
- Theming via theme prop override
- FlashList-backed message rendering
- TypeScript types included

## Installation

Install the package and required peers:

```bash
npm install @codewithvincent/react-native-love-chat
# or
yarn add @codewithvincent/react-native-love-chat
```

Peer dependencies (install as needed):

- react
- react-native
- react-native-gesture-handler
- react-native-reanimated
- react-native-safe-area-context
- react-native-root-siblings
- @shopify/flash-list
- react-native-svg
- Optional blur providers: @react-native-community/blur or expo-blur

## Usage

```tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Chat, IMessage } from '@codewithvincent/react-native-love-chat';

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const user = { _id: 1, name: 'Developer' };

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) => [...newMessages, ...previousMessages]);
  }, []);

  return (
    <Chat messages={messages} onSend={onSend} user={user} placeholder="Type your message here..." />
  );
}
```

## API Reference

### Essential Props

- messages: IMessage[] — array of messages (newest first if inverted)
- user: IUser — current user object
- onSend: (messages: IMessage[]) => void — send handler
- placeholder?: string
- isTyping?: boolean
- loadEarlier?: boolean
- isLoadingEarlier?: boolean
- onLoadEarlier?: () => void
- onPressAttachment?: (type: string) => void
- onReaction?: (msg: IMessage, emoji: string) => void
- onDeleteMessage?: (msg: IMessage) => void
- onDownloadFile?: (msg: IMessage) => void
- renderUploadFooter?: (props) => ReactNode
- theme?: PartialTheme — to override default theme colors

## Data Structures

### IMessage

```typescript
interface IMessage {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: IUser;
  image?: string;
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
  // ... custom fields
}
```

### IUser

```typescript
interface IUser {
  _id: string | number;
  name?: string;
  avatar?: string | number;
}
```

## Theming

Override with the `theme` prop. Example:

```tsx
<Chat
  messages={messages}
  user={user}
  onSend={onSend}
  theme={{
    colors: {
      primary: '#4fd1a5',
      darkRed: '#ff5757',
    },
  }}
/>
```

## Examples

See the `examples` folder for complete usage samples.

## Contributing

- Fork the repo and create a feature branch
- Run tests and build before submitting a PR
- Follow semantic commit messages

## License

MIT © Contributors
