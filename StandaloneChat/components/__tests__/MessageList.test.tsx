// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react-native';
import MessageList from '../MessageList';
import { IMessage } from '../../types';

describe('MessageList', () => {
  const mockUser = { id: 1, name: 'User' };
  const mockMessages: IMessage[] = [
    { id: 101, text: 'Hello', createdAt: new Date(), user: mockUser },
    {
      id: 100,
      text: 'World',
      createdAt: new Date(Date.now() - 1000),
      user: { id: 2, name: 'Other' },
    },
  ];
  const mockOnSend = jest.fn();

  it('renders inverted list anchored to bottom', () => {
    const { getByTestId } = render(
      <MessageList messages={mockMessages} user={mockUser} onSend={mockOnSend} />
    );
    const list = getByTestId('message-list');
    expect(list.props.inverted).toBe(true);
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
    const list = getByTestId('message-list');
    expect(list.props.ListFooterComponent).toBeDefined();
  });

  it('uses keyExtractor to stringify ids', () => {
    const { getByTestId } = render(
      <MessageList messages={mockMessages} user={mockUser} onSend={mockOnSend} />
    );
    const list = getByTestId('message-list');
    const keyExtractor = list.props.keyExtractor;
    expect(typeof keyExtractor).toBe('function');
    const k = keyExtractor({ id: 123 } as any);
    expect(k).toBe('123');
  });
});
