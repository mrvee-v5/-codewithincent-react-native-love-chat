// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react-native';
import MessageList from '../MessageList';
import { IMessage } from '../../types';

// Mock FlashList to expose passed props
const capturedProps = { current: null as any };

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FlashList: React.forwardRef((props: any, ref: any) => {
      capturedProps.current = props;
      return <View testID="flash-list" {...props} />;
    }),
  };
});

describe('MessageList', () => {
  const mockUser = { _id: 1, name: 'User' };
  const mockMessages: IMessage[] = [
    { _id: 101, text: 'Hello', createdAt: new Date(), user: mockUser },
    { _id: 100, text: 'World', createdAt: new Date(Date.now() - 1000), user: { _id: 2, name: 'Other' } },
  ];
  const mockOnSend = jest.fn();

  it('renders inverted list anchored to bottom', () => {
    const { getByTestId } = render(
      <MessageList messages={mockMessages} user={mockUser} onSend={mockOnSend} />
    );
    const list = getByTestId('flash-list');
    expect(list.props.inverted).toBe(true);
    expect(list.props.maintainVisibleContentPosition?.startRenderingFromBottom).toBe(true);
    expect(list.props.maintainVisibleContentPosition?.minIndexForVisible).toBe(0);
  });

  it('renders load earlier footer when enabled', () => {
    const { getByTestId } = render(
      <MessageList
        messages={mockMessages}
        user={mockUser}
        onSend={mockOnSend}
        loadEarlier
        onLoadEarlier={jest.fn()}
      />
    );
    const list = getByTestId('flash-list');
    expect(list.props.ListFooterComponent).toBeDefined();
  });

  it('uses keyExtractor to stringify ids', () => {
    render(<MessageList messages={mockMessages} user={mockUser} onSend={mockOnSend} />);
    const keyExtractor = capturedProps.current?.keyExtractor;
    expect(typeof keyExtractor).toBe('function');
    const k = keyExtractor({ _id: 123 } as any);
    expect(k).toBe('123');
  });
});
