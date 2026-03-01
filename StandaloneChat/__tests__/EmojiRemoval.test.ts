declare const describe: any;
declare const test: any;
declare const expect: any;
import { hasUserEmoji, canRemoveOwn } from '../components/ReactionBubble';

describe('hasUserEmoji', () => {
  test('returns true when user reacted with emoji', () => {
    const reactions = [
      { userId: 'u1', emoji: '👍' },
      { userId: 'u2', emoji: '😂' },
    ];
    expect(hasUserEmoji(reactions as any, 'u1', '👍')).toBe(true);
    expect(hasUserEmoji(reactions as any, 'u2', '😂')).toBe(true);
  });

  test('returns false on invalid inputs or when user did not react', () => {
    const reactions = [{ userId: 'u1', emoji: '👍' }];
    expect(hasUserEmoji(reactions as any, 'u1', '😂')).toBe(false);
    expect(hasUserEmoji(undefined as any, 'u1', '👍')).toBe(false);
    expect(hasUserEmoji(reactions as any, undefined as any, '👍')).toBe(false);
    expect(hasUserEmoji(reactions as any, 'u1', undefined as any)).toBe(false);
  });

  test('canRemoveOwn only allows current user to remove their row', () => {
    expect(canRemoveOwn('u1', 'u1')).toBe(true);
    expect(canRemoveOwn('u2', 'u1')).toBe(false);
    expect(canRemoveOwn(undefined as any, 'u1')).toBe(false);
    expect(canRemoveOwn('u1', undefined as any)).toBe(false);
  });
});
