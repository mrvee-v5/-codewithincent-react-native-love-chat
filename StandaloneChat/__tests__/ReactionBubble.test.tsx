declare const describe: any;
declare const test: any;
declare const expect: any;
import { computePositions } from '../components/ReactionBubble';

describe('ReactionBubble positioning', () => {
  const screenW = 360;
  const screenH = 640;
  const menuWidth = 200;
  const popupItemWidth = 42;
  const popupHeight = 60;
  const verticalGap = 12;
  const horizontalMargin = 8;

  const baseArgs = {
    reactionsCount: 6,
    isMine: false,
    screenW,
    screenH,
    popupItemWidth,
    popupHeight,
    menuWidth,
    menuItemCount: 3,
    menuItemHeight: 44,
    verticalGap,
    horizontalMargin,
    reactionCoreWidth: 28,
    reactionHorizontalPadding: 8,
    popupHorizontalPadding: 12,
  };

  test('normal scenario centers within bounds', () => {
    const pos = { x: 80, y: 200, width: 160, height: 40 };
    const res = computePositions({ ...baseArgs, pos });
    expect(res.emojiPanel.left).toBeGreaterThanOrEqual(horizontalMargin);
    expect(res.emojiPanel.left + res.emojiPanel.width).toBeLessThanOrEqual(screenW - horizontalMargin);
    expect(res.menu.above).toBe(false);
    expect(res.menu.left).toBeGreaterThanOrEqual(horizontalMargin);
  });

  test('left-edge scenario keeps 8px margin', () => {
    const pos = { x: 0, y: 220, width: 120, height: 40 };
    const res = computePositions({ ...baseArgs, pos });
    expect(res.emojiPanel.left).toBe(horizontalMargin);
  });

  test('right-edge scenario keeps 8px margin', () => {
    const pos = { x: screenW - 50, y: 220, width: 40, height: 40 };
    const res = computePositions({ ...baseArgs, pos });
    expect(res.emojiPanel.left + res.emojiPanel.width).toBe(screenW - horizontalMargin);
  });

  test('bottom-overflow places menu above', () => {
    const pos = { x: 100, y: screenH - 60, width: 140, height: 60 };
    const res = computePositions({ ...baseArgs, pos });
    expect(res.menu.above).toBe(true);
    expect(res.menu.top).toBeLessThan(pos.y - verticalGap);
  });

  test('top-overflow places emoji panel below', () => {
    const pos = { x: 50, y: 10, width: 140, height: 40 };
    const res = computePositions({ ...baseArgs, pos });
    const expectedBelowTop = pos.y + pos.height + verticalGap;
    expect(res.emojiPanel.top).toBe(expectedBelowTop);
    expect(res.menu.above).toBe(false);
    expect(res.menu.top).toBeGreaterThan(res.emojiPanel.top);
  });

  test('visual style snapshot', () => {
    const pos = { x: 90, y: 210, width: 150, height: 40 };
    const res = computePositions({ ...baseArgs, pos });
    expect(res).toMatchSnapshot();
  });
});
