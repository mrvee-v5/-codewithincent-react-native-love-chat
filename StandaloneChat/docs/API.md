# React Native Love Chat — Comprehensive API Documentation

This document explains the library’s purpose, architecture, public API, and usage patterns. It covers all exported modules, their properties, parameters, return values, error scenarios, and executable examples.

## Overview

- Purpose: Provide a production-ready chat UI for React Native with messages, replies, reactions, media, and theming.
- Architecture:
  - Chat orchestrates MessageList and InputToolbar, wrapped in ThemeProvider.
  - MessageList renders items using FlashList, anchors to the bottom, and groups by date.
  - Message renders text/media and integrates ReactionBubble and Bubble.
  - Theme utilities expose defaultTheme, ThemeProvider, useTheme.
  - Utils include appSize, Logger, isSameUser, isSameDay.
- Key Concepts:
  - Messages: IMessage with text/media fields, status, reactions.
  - User: IUser with id, optional name, avatar.
  - Theming: Override theme colors/typography/spacing via ThemeProvider or Chat prop.

## Quick Start

```tsx
import React, { useState, useCallback } from 'react';
import { Chat, IMessage } from '@codewithvincent/react-native-love-chat';

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: 1,
      text: 'Welcome!',
      createdAt: new Date(),
      user: { id: 2, name: 'RN', avatar: 'https://placeimg.com/140/140/any' },
    },
  ]);

  const user = { id: 1, name: 'Me' };

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previous) => [...newMessages, ...previous]);
  }, []);

  return <Chat messages={messages} user={user} onSend={onSend} placeholder="Type..." />;
}
```

---

## Modules

### types

- Exports: IUser, IMessage, ChatProps, PartialTheme (from theme).

#### IUser

Signature:

```ts
interface IUser {
  id: string | number;
  name?: string;
  avatar?: string | number;
}
```

- id (required): string | number; unique identifier.
- name (optional): string.
- avatar (optional): string (URL) or number (local asset).

#### IMessage

Signature:

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

Constraints:

- createdAt: Date or epoch number; used for ordering and headers.
- reactions: array entries must include userId and emoji.
- If image/video/audio present, Bubble renders as media layout.

#### ChatProps

Signature:

```ts
interface ChatProps {
  messages: IMessage[];
  user: IUser;
  onSend: (messages: IMessage[]) => void;
  participants?: IUser[];
  placeholder?: string;
  text?: string;
  onInputTextChanged?: (text: string) => void;
  renderBubble?: (props: any) => React.ReactNode;
  renderInputToolbar?: (props: any) => React.ReactNode;
  renderComposer?: (props: any) => React.ReactNode;
  renderSend?: (props: any) => React.ReactNode;
  renderMessage?: (props: any) => React.ReactNode;
  renderMessageText?: (props: any) => React.ReactNode;
  renderMessageImage?: (props: any) => React.ReactNode;
  renderMessageVideo?: (props: any) => React.ReactNode;
  renderMessageAudio?: (props: any) => React.ReactNode;
  renderChatFooter?: () => React.ReactNode;
  renderUploadFooter?: (props: any) => React.ReactNode;
  renderAttachmentButton?: (props: {
    toggle: () => void;
    showing: boolean;
    onPressAttachment?: (type: string) => void;
    theme: any;
  }) => React.ReactNode;
  loadEarlier?: boolean;
  onLoadEarlier?: () => void;
  isLoadingEarlier?: boolean;
  listViewProps?: any;
  textInputProps?: any;
  onPressAttachment?: (type: string) => void;
  onReply?: (message: IMessage) => void;
  onClearReply?: () => void;
  onReaction?: (message: IMessage, reaction: string) => void;
  onRemoveEmoji?: (message: IMessage, emoji: { emoji: string; userId?: string | number }) => void;
  onDeleteMessage?: (message: IMessage) => void;
  onDownloadFile?: (message: IMessage) => void;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  isTyping?: boolean;
  isGroup?: boolean;
  theme?: PartialTheme;
  containerStyle?: any;
  messagesContainerStyle?: any;
}
```

Return:

- React element. Handles state for input text and reply preview internally.

Errors:

- Missing peer deps (e.g., react-native-root-siblings, flash-list) cause runtime errors when related features mount.
- Invalid message shapes may render empty bubbles or no media.

Example (advanced: media and reactions):

```tsx
import { Chat, IMessage } from '@codewithvincent/react-native-love-chat';

const me = { id: 1, name: 'Me' };
const other = { id: 2, name: 'RN' };

const initial: IMessage[] = [
  { id: 1, text: 'Hi', createdAt: Date.now(), user: other },
  { id: 2, image: 'https://picsum.photos/400', text: '', createdAt: Date.now(), user: me },
];

function Screen() {
  const [messages, setMessages] = React.useState(initial);

  const onSend = (newMessages: IMessage[]) => setMessages((prev) => [...newMessages, ...prev]);
  const onReaction = (msg: IMessage, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? {
              ...m,
              reactions: [{ userId: me.id, emoji }, ...(m.reactions || [])],
            }
          : m
      )
    );
  };

  return (
    <Chat
      messages={messages}
      user={me}
      onSend={onSend}
      onReaction={onReaction}
      onDeleteMessage={(msg) => console.log('delete', msg.id)}
      onDownloadFile={(msg) => console.log('download', msg.fileUrl)}
    />
  );
}
```

Cross-refs:

- See MessageList (renderMessage) and InputToolbar (renderComposer, renderSend) for overrides.
- See Theme (ThemeProvider, useTheme) for styling.

---

### Chat

- Default export: `Chat` component.
- Function Signature: `(props: ChatProps) => React.ReactElement`.
- Responsibilities:
  - Wraps inner chat in `ThemeProvider` when `theme` prop is provided.
  - Manages input text, reply preview, typing animation, and delegates rendering to child components.
  - Emits handlers for send, reply, reaction, delete, download, and attachments.

Usage (group chat + custom attachment button):

```tsx
import { Chat } from '@codewithvincent/react-native-love-chat';

function Screen() {
  return (
    <Chat
      messages={[]}
      user={{ id: 1 }}
      onSend={(m) => {}}
      isGroup
      renderAttachmentButton={({ toggle, showing, onPressAttachment, theme }) => (
        <TouchableOpacity onPress={toggle}>
          <Text style={{ color: theme.colors.primary }}>{showing ? 'Close' : 'Attach'}</Text>
        </TouchableOpacity>
      )}
      onPressAttachment={(type) => console.log('attach', type)}
    />
  );
}
```

---

### MessageList

- Export: `MessageList`.
- Signature: `(props: ChatProps & { contentContainerStyle?: any; inverted?: boolean }) => ReactElement`.
- Behavior:
  - Uses FlashList; maintains visible content position; renders date headers when day changes.
  - Expects messages as is (no reversal) and derives previous/next for item rendering.
  - Supports `renderMessage` override for complete control.

Edge Case:

- Empty messages renders only headers or nothing; safe no-ops.

Usage (custom message renderer):

```tsx
import { MessageList } from '@codewithvincent/react-native-love-chat';

function MyList({ messages, user }) {
  return (
    <MessageList
      messages={messages}
      user={user}
      onSend={() => {}}
      renderMessage={({ currentMessage }) => <Text>{currentMessage.text || '[media]'}</Text>}
    />
  );
}
```

---

### Message

- Export: `Message`.
- Signature: `(props: { currentMessage: IMessage; previousMessage?: IMessage; nextMessage?: IMessage; user: IUser; ... }) => ReactElement`.
- Responsibilities:
  - Determines media type; renders ImageCard/FileCard/VideoGroupWrapper or text.
  - Computes timestamp, reaction badges (mine vs other), and status.
  - Wraps content in `Bubble` and integrates `ReactionBubble` interactions.

Usage (override message text):

```tsx
import { Message } from '@codewithvincent/react-native-love-chat';

function CustomMessage(props) {
  return (
    <Message
      {...props}
      renderMessageText={() => <Text>Custom: {props.currentMessage.text}</Text>}
    />
  );
}
```

---

### InputToolbar

- Export: `InputToolbar`.
- Signature: `(props: { onSend?: (messages: any[]) => void; text?: string; onTextChanged?: (text: string) => void; renderComposer?: (props: any) => ReactNode; renderSend?: (props: any) => ReactNode; user: any; placeholder?: string; onPressAttachment?: (type: string) => void; replyMessage?: IMessage | null; onClearReply?: () => void; renderUploadFooter?: (props: any) => ReactNode; renderAttachmentButton?: (props: { toggle: () => void; showing: boolean; onPressAttachment?: (type: string) => void; theme: any; }) => ReactNode; }) => ReactElement`.
- Emits: `onSend` when pressing send; wraps Composer and optional upload footer and reply preview.

Usage (custom send button):

```tsx
import { InputToolbar } from '@codewithvincent/react-native-love-chat';

function Toolbar({ user, onSend }) {
  return (
    <InputToolbar
      user={user}
      onSend={(msgs) => onSend?.(msgs)}
      renderSend={({ onSend }) => (
        <TouchableOpacity
          onPress={() => onSend?.([{ id: Date.now(), text: 'Hi', createdAt: Date.now(), user }])}>
          <Text>Send</Text>
        </TouchableOpacity>
      )}
    />
  );
}
```

---

### Composer

- Export: `Composer`.
- Signature: `(props: { text?: string; placeholder?: string; placeholderTextColor?: string; textInputProps?: any; onTextChanged?: (text: string) => void; onSend?: () => void; textInputStyle?: any; multiline?: boolean; maxComposerHeight?: number; minComposerHeight?: number; }) => ReactElement`.
- Behavior: Auto-resizes between min/max heights; forwards TextInput props.

Usage:

```tsx
import { Composer } from '@codewithvincent/react-native-love-chat';
<Composer text="Hello" onTextChanged={(t) => {}} minComposerHeight={40} maxComposerHeight={120} />;
```

---

### Bubble

- Export: `Bubble`.
- Signature: `(props: { isOwnMessage: boolean; children: ReactNode; bubbleColor?: string; tailColor?: string; withTail?: boolean; style?: ViewStyle; onPress?: () => void; hitSlop?: number | {top:number;bottom:number;left:number;right:number}; maxWidth?: number; isMedia?: boolean }) => ReactElement`.
- Behavior: Renders a speech bubble with optional tail; adjusts alignment and padding for media.

Usage:

```tsx
import { Bubble } from '@codewithvincent/react-native-love-chat';
<Bubble isOwnMessage>{/* children */}</Bubble>;
```

---

### MessageStatus

- Export: `MessageStatus`.
- Signature: `(props: { status?: 'pending' | 'sent' | 'delivered' | 'read'; isMine?: boolean }) => ReactElement | null`.
- Behavior: Shows clock/check/double-check icons depending on status for sender messages.

Usage:

```tsx
import { MessageStatus } from '@codewithvincent/react-native-love-chat';
<MessageStatus status="delivered" isMine />;
```

---

### VideoGroupWrapper

- Export: `VideoGroupWrapper`.
- Signature: `(props: { children: ReactNode; isGroup?: boolean; isMine?: boolean; name?: string; avatar?: string | number; time?: string; status?: 'pending' | 'sent' | 'delivered' | 'read' }) => ReactElement`.
- Behavior: Wraps a rendered video/audio component with group metadata header and footer.

Usage:

```tsx
import { VideoGroupWrapper } from '@codewithvincent/react-native-love-chat';
<VideoGroupWrapper isGroup isMine name="Alice" time="10:30" status="sent">
  {/* video */}
</VideoGroupWrapper>;
```

---

### Theme Utilities

Exports: `defaultTheme`, `ThemeProvider`, `useTheme`, `PartialTheme`.

#### ThemeProvider

- Signature: `<ThemeProvider theme?: PartialTheme>{children}</ThemeProvider>`
- Behavior: Supplies theme to all components; Chat wraps InnerChat with ThemeProvider when `theme` prop provided.

#### useTheme

- Signature: `const theme = useTheme();`
- Returns: runtime theme object with `colors`, `spacing`, `typography`, `fonts`.

#### defaultTheme

- Object containing base tokens; override selectively via `ThemeProvider` or `Chat theme` prop.

Usage (override colors):

```tsx
import { Chat } from '@codewithvincent/react-native-love-chat';
<Chat
  messages={[]}
  user={{ id: 1 }}
  onSend={() => {}}
  theme={{
    colors: {
      primary: '#4fd1a5',
      ownMessageBubble: '#4f8dfd',
      otherMessageBubble: '#f2f2f7',
      textOnOverlay: '#fff',
    },
  }}
/>;
```

---

### Utils

Exports: `appSize`, `Logger`, `isSameUser`, `isSameDay`.

#### appSize

- Signature: `{ width(percent:number): number; height(percent:number): number; font(size:number): number; SCREEN_WIDTH: number; SCREEN_HEIGHT: number }`
- Purpose: Percentage-based sizing helpers using screen metrics.

#### Logger

- Methods: `info(...args)`, `error(...args)`, `debug(...args)`.
- Purpose: Namespaced console logging for development.

#### isSameUser

- Signature: `(currentMessage: any, diffMessage: any) => boolean`
- Returns: true if messages share the same user id.

#### isSameDay

- Signature: `(currentMessage: any, diffMessage: any) => boolean`
- Returns: true if messages occur on the same calendar day.

Usage:

```ts
import { isSameDay, isSameUser } from '@codewithvincent/react-native-love-chat/dist/utils';
isSameDay({ createdAt: Date.now() }, { createdAt: Date.now() });
```

---

## Error Handling & Edge Cases

- Missing peer dependencies: install required peers listed in package.json; features like FlashList and RootSiblings depend on them.
- Invalid `createdAt`: ensure Date or epoch; invalid values may cause incorrect grouping or timestamps.
- Empty text with media: allowed; Bubble switches to media layout.
- Group metadata: provide `isGroup`, `participants`, and message.user fields for avatars/names to render properly.
- Reactions: supply `reactions` entries with both `userId` and `emoji`; use `onReaction` to update message state.

---

## Patterns

- Basic: Chat with text-only messages.
- Advanced:
  - Custom renderers (renderMessageImage/video/audio).
  - Theming with ThemeProvider and runtime tokens.
  - Group chats with avatars and names.
  - File messages using `fileType`, `fileUrl`, and `fileName`.

---

## Cross-References

- Chat → MessageList, InputToolbar, ThemeProvider.
- Message → Bubble, ReactionBubble, MessageStatus, media cards.
- Theme → defaultTheme, useTheme.
- Utils → appSize, Logger, isSameDay/user.
