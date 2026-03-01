declare const describe: any;
declare const test: any;
declare const expect: any;
import { aggregateGrouped } from '../components/ReactionBubble';

describe('Grouped reactions', () => {
  test('aggregates identical emojis', () => {
    const input = [
      { userId: 'u1', emoji: '🙏' },
      { userId: 'u2', emoji: '🙏' },
      { userId: 'u3', emoji: '👍' },
      { userId: 'u4', emoji: '🙏' },
    ];
    const res = aggregateGrouped(input);
    const pray = res.find((r) => r.emoji === '🙏')!;
    const like = res.find((r) => r.emoji === '👍')!;
    expect(pray.count).toBe(3);
    expect(like.count).toBe(1);
  });

  test('sorts by count desc then emoji', () => {
    const input = [
      { userId: 'u1', emoji: '👍' },
      { userId: 'u2', emoji: '👍' },
      { userId: 'u3', emoji: '🙏' },
      { userId: 'u4', emoji: '🙏' },
      { userId: 'u5', emoji: '😂' },
    ];
    const res = aggregateGrouped(input);
    expect(res[0].emoji === '👍' || res[0].emoji === '🙏').toBe(true);
    expect(res[0].count).toBe(2);
    expect(res[2].emoji).toBe('😂');
    expect(res[2].count).toBe(1);
  });
});
