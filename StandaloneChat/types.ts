import { PartialTheme } from './utils/theme';

export interface IUser {
  _id: string | number;
  name?: string;
  avatar?: string | number;
}

export interface IMessage {
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
  quickReplies?: any;
  
  // Custom props
  caption?: string;
  fileName?: string;
  fileType?: string;
  fileUrl?: string; // Unified file URL
  replyTo?: IMessage;
  reactions?: any[];
  status?: 'pending' | 'sent' | 'delivered' | 'read';
  isMine?: boolean; 
}

export interface ChatProps {
  messages: IMessage[];
  user: IUser;
  onSend: (messages: IMessage[]) => void;
  
  // Customization
  placeholder?: string;
  text?: string;
  onInputTextChanged?: (text: string) => void;
  dateFormat?: string;
  timeFormat?: string;
  
  // Rendering overrides
  renderBubble?: (props: any) => React.ReactNode;
  renderInputToolbar?: (props: any) => React.ReactNode;
  renderComposer?: (props: any) => React.ReactNode;
  renderSend?: (props: any) => React.ReactNode;
  renderAvatar?: (props: any) => React.ReactNode;
  renderMessage?: (props: any) => React.ReactNode;
  renderMessageText?: (props: any) => React.ReactNode;
  renderMessageImage?: (props: any) => React.ReactNode;
  renderMessageVideo?: (props: any) => React.ReactNode;
  renderMessageAudio?: (props: any) => React.ReactNode;
  renderFooter?: () => React.ReactNode; 
  renderChatFooter?: () => React.ReactNode; 
  renderUploadFooter?: (props: any) => React.ReactNode;
  
  // List props
  loadEarlier?: boolean;
  onLoadEarlier?: () => void;
  isLoadingEarlier?: boolean;
  inverted?: boolean;
  listViewProps?: any;
  
  // Input props
  onPressActionButton?: () => void;
  renderActions?: (props: any) => React.ReactNode;
  textInputProps?: any;
  minInputToolbarHeight?: number;
  
  // Actions
  onPressAttachment?: (type: string) => void;
  onReply?: (message: IMessage) => void;
  onClearReply?: () => void;
  onReaction?: (message: IMessage, reaction: string) => void;
  onDeleteMessage?: (message: IMessage) => void;
  onDownloadFile?: (message: IMessage) => void;

  // Behavior
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  isTyping?: boolean;
  
  // Style overrides
  theme?: PartialTheme;
  containerStyle?: any;
  messagesContainerStyle?: any;
}
