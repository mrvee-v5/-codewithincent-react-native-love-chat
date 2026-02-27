// @ts-nocheck
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import MessageList from '../MessageList';
import { IMessage } from '../../types';

// Mock FlashList
const mockScrollToEnd = jest.fn();

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FlashList: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        scrollToEnd: mockScrollToEnd,
        scrollToIndex: jest.fn(),
      }));
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

  beforeEach(() => {
    mockScrollToEnd.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('scrolls to bottom on initial mount', () => {
    render(<MessageList messages={mockMessages} user={mockUser} onSend={mockOnSend} />);
    
    // Initial mount uses setTimeout
    act(() => {
      jest.runAllTimers();
    });

    expect(mockScrollToEnd).toHaveBeenCalledWith({ animated: false });
  });

  it('scrolls to bottom when new message is added', () => {
    const { rerender } = render(<MessageList messages={mockMessages} user={mockUser} onSend={mockOnSend} />);
    
    // Clear initial mount call
    act(() => {
      jest.runAllTimers();
    });
    mockScrollToEnd.mockClear();

    const newMessages = [
      { _id: 102, text: 'New Message', createdAt: new Date(), user: mockUser },
      ...mockMessages,
    ];

    rerender(<MessageList messages={newMessages} user={mockUser} onSend={mockOnSend} />);

    act(() => {
      jest.runAllTimers();
    });

    expect(mockScrollToEnd).toHaveBeenCalledWith({ animated: true });
  });

  it('does not scroll if list is empty', () => {
    render(<MessageList messages={[]} user={mockUser} onSend={mockOnSend} />);
    
    act(() => {
      jest.runAllTimers();
    });

    expect(mockScrollToEnd).not.toHaveBeenCalled();
  });
});
