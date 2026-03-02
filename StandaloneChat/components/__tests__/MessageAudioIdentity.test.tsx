// @ts-nocheck
import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import Message from '../Message';

describe('Message audio identity inline', () => {
  const me = { id: 1, name: 'Me' } as any;
  const other = { id: 2, name: 'Other', avatar: 'https://example.com/a.png' } as any;

  it('shows user identity inline for audio in group mode', () => {
    const msg = {
      id: 100,
      createdAt: Date.now(),
      user: other,
      audio: 'https://example.com/audio.mp3',
    } as any;

    const { getByText } = render(
      <Message
        currentMessage={msg}
        user={me}
        isGroup
        renderMessageAudio={() => <Text>Audio</Text>}
      />
    );

    expect(getByText('Other')).toBeTruthy();
    expect(getByText('Audio')).toBeTruthy();
  });
});
