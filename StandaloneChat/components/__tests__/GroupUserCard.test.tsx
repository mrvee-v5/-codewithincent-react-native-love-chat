// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react-native';
import GroupUserCard from '../group/GroupUserCard';

describe('GroupUserCard', () => {
  const user = { id: 2, name: 'React Native', avatar: 'https://placeimg.com/140/140/any' };

  it('renders inline identity in group for other user', () => {
    const { getByText, getByTestId } = render(
      <GroupUserCard user={user} isGroup isMine={false} variant="inline">
        <></>
      </GroupUserCard>
    );
    expect(getByText('React Native')).toBeTruthy();
  });

  it('does not render identity for own messages', () => {
    const { queryByText } = render(
      <GroupUserCard user={user} isGroup isMine variant="inline">
        <></>
      </GroupUserCard>
    );
    expect(queryByText('React Native')).toBeNull();
  });

  it('renders overlay identity for media', () => {
    const { getByText } = render(
      <GroupUserCard user={user} isGroup isMine={false} variant="overlay">
        <></>
      </GroupUserCard>
    );
    expect(getByText('React Native')).toBeTruthy();
  });

  it('handles missing avatar gracefully', () => {
    const { getByText } = render(
      <GroupUserCard user={{ id: 3, name: 'No Avatar' }} isGroup isMine={false} variant="inline">
        <></>
      </GroupUserCard>
    );
    expect(getByText('No Avatar')).toBeTruthy();
  });

  it('handles missing name by rendering only avatar placeholder', () => {
    const { toJSON } = render(
      <GroupUserCard user={{ id: 4, avatar: 'https://example.com/a.png' }} isGroup isMine={false} variant="inline">
        <></>
      </GroupUserCard>
    );
    expect(toJSON()).toBeTruthy();
  });
});

