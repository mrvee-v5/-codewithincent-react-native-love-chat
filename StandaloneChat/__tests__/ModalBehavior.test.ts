declare const describe: any;
declare const test: any;
declare const expect: any;
import { shouldCloseOnBackdropPress } from '../components/ReactionBubble';

describe('Modal overlay close behavior', () => {
  test('does not close by default when prop is undefined', () => {
    expect(shouldCloseOnBackdropPress(undefined)).toBe(false);
  });

  test('closes when opt-in prop is true', () => {
    expect(shouldCloseOnBackdropPress(true)).toBe(true);
  });

  test('does not close when prop is false', () => {
    expect(shouldCloseOnBackdropPress(false)).toBe(false);
  });
});
