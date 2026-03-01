declare const describe: any;
declare const test: any;
declare const expect: any;
import { aggregateGrouped } from '../components/ReactionBubble';
import { countForEmoji } from '../components/ReactionBubble';
import { usersForEmoji } from '../components/ReactionBubble';

describe('Modal integration helpers', () => {
  const reactions = [
    { userId: 'u1', emoji: '👍' },
    { userId: 'u2', emoji: '👍' },
    { userId: 'u3', emoji: '😂' },
  ] as any;
  const participants = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Chloe' },
  ] as any;

  test('aggregateGrouped sorts and counts properly', () => {
    const agg = aggregateGrouped(reactions);
    expect(agg[0].emoji).toBe('👍');
    expect(agg[0].count).toBe(2);
    expect(agg[1].emoji).toBe('😂');
    expect(agg[1].count).toBe(1);
  });

  test('countForEmoji matches modal header', () => {
    expect(countForEmoji(reactions as any, '👍')).toBe(2);
    expect(countForEmoji(reactions as any, '😂')).toBe(1);
  });

  test('usersForEmoji lists users for selected emoji', () => {
    const users = usersForEmoji(reactions as any, participants as any, '👍');
    const ids = users.map((u: any) => u.id);
    expect(ids).toContain('u1');
    expect(ids).toContain('u2');
    expect(ids).not.toContain('u3');
  });
});
