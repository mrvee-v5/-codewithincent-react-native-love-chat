declare const describe: any;
declare const test: any;
declare const expect: any;
import { aggregateGrouped } from '../components/ReactionBubble';

const totalFromAgg = (arr: Array<{ emoji: string; count: number }>) =>
  arr.reduce((s, x) => s + x.count, 0);

describe('Aggregated total count', () => {
  test('sums unique user usages across emojis', () => {
    const input = [
      { userId: 'u1', emoji: '👍' },
      { userId: 'u2', emoji: '👍' },
      { userId: 'u3', emoji: '😂' },
      { userId: 'u3', emoji: '😂' }, // duplicate by same user should be deduped
      { userId: 'u4', emoji: '🙏' },
    ] as any;
    const agg = aggregateGrouped(input);
    const total = totalFromAgg(agg);
    expect(total).toBe(4);
  });
});
