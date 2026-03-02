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
  const user = { id: 1, name: 'Developer' };

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          id: 2,
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

This section summarizes the most important types and props. For the full, in-depth guide, see
[docs/API.md](./docs/API.md), which is shipped with the npm package.

### Core Types

#### `IUser`

```ts
interface IUser {
  id: string | number;
  name?: string;
  avatar?: string | number;
}
```

#### `IMessage`

```ts
interface IMessage {
  id: string | number;
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
  quickReplies?: any;
  caption?: string;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  replyTo?: IMessage;
  reactions?: Array<{ userId: string | number; emoji: string }>;
  status?: 'pending' | 'sent' | 'delivered' | 'read';
  isMine?: boolean;
}
```

### `Chat` Props (high level)

```ts
interface ChatProps {
  messages: IMessage[];
  user: IUser;
  onSend: (messages: IMessage[]) => void;
  participants?: IUser[];
  placeholder?: string;
  text?: string;
  onInputTextChanged?: (text: string) => void;

  // Rendering overrides
  renderBubble?: (props: any) => React.ReactNode;
  renderInputToolbar?: (props: any) => React.ReactNode;
  renderComposer?: (props: any) => React.ReactNode;
  renderSend?: (props: any) => React.ReactNode;
  renderInputLeftContent?: (props: any) => React.ReactNode;
  renderToggleIcon?: (props: {
    expanded: boolean;
    onToggle: () => void;
    rotateAnim: any;
  }) => React.ReactNode;
  renderMessage?: (props: any) => React.ReactNode;
  renderMessageText?: (props: any) => React.ReactNode;
  renderMessageImage?: (props: any) => React.ReactNode;
  renderMessageVideo?: (props: any) => React.ReactNode;
  renderMessageAudio?: (props: any) => React.ReactNode;
  renderChatHeader?: () => React.ReactNode;
  renderChatFooter?: () => React.ReactNode;
  renderUploadFooter?: (props: any) => React.ReactNode;
  renderAttachmentButton?: (props: {
    toggle: () => void;
    showing: boolean;
    onPressAttachment?: (type: string) => void;
    theme: any;
  }) => React.ReactNode;

  // List behavior
  loadEarlier?: boolean;
  onLoadEarlier?: () => void;
  isLoadingEarlier?: boolean;
  listViewProps?: any;

  // Input behavior
  textInputProps?: any;
  enableToggleAnimation?: boolean;
  rightInputContentWidth?: number;

  // Actions
  onPressAttachment?: (type: string) => void;
  onReply?: (message: IMessage) => void;
  onClearReply?: () => void;
  onReaction?: (message: IMessage, reaction: string) => void;
  onRemoveEmoji?: (message: IMessage, emoji: { emoji: string; userId?: string | number }) => void;
  onDeleteMessage?: (message: IMessage) => void;
  onDownloadFile?: (message: IMessage) => void;

  // Behavior
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  isTyping?: boolean;
  isGroup?: boolean;

  // Style
  theme?: PartialTheme;
  containerStyle?: any;
  messagesContainerStyle?: any;
}
```

Common callbacks you will typically use:

- `onSend(messages)` — append or prepend messages to your state.
- `onReaction(message, emoji)` — apply a reaction to a message.
- `onPressAttachment(type)` — open your own media picker; `type` is whatever you choose.
- `onDeleteMessage(message)` — remove the message from your data store.
- `onDownloadFile(message)` — handle file download logic.

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
