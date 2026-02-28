import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { defaultTheme, useTheme } from '../utils/theme';

interface Props {
  status?: 'pending' | 'sent' | 'delivered' | 'read';
  isMine?: boolean;
}

const ClockIcon = ({ color }: { color: string }) => (
  <Svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <Path d="M12 6V12L16 14" />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M20 6L9 17L4 12" />
  </Svg>
);

const DoubleCheckIcon = ({ color }: { color: string }) => (
  <Svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M7 12l5 5L22 7M2 12l5 5m5-5l5-5" />
  </Svg>
);

const MessageStatus = ({ status, isMine }: Props) => {
  const theme = useTheme();
  if (!isMine) return null;

  switch (status) {
    case 'pending':
      return <ClockIcon color={theme.colors.pendingStatus} />;
    case 'sent':
      return <CheckIcon color={theme.colors.sentStatus} />;
    case 'delivered':
      return <DoubleCheckIcon color={theme.colors.deliveredStatus} />;
    case 'read':
      return <DoubleCheckIcon color={theme.colors.readStatus} />; // Use theme color or blue
    default:
      return null;
  }
};

export default MessageStatus;
