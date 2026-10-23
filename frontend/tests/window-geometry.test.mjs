import test from 'node:test';
import assert from 'node:assert/strict';
import { fitWindow, boundWindowOffset, WINDOW_RATIO } from '../src/components/ui/windowGeometry.ts';

test('normal and maximized windows keep 16:9 and fit between the menu and dock', () => {
  for (const [w, h] of [[1920, 1080], [1571.5, 884], [1366, 768.375], [1024, 576], [768, 432], [390, 219.375]]) {
    for (const maximized of [false, true]) for (let index = 0; index < 6; index++) {
      const frame = fitWindow(w, h, index, maximized);
      assert.ok(Math.abs(frame.width / frame.height - WINDOW_RATIO) < 0.00001);
      assert.ok(frame.left >= 0 && frame.top >= frame.menu);
      assert.ok(frame.left + frame.width <= w + 0.001);
      assert.ok(frame.top + frame.height <= h - frame.dock + 0.001);
    }
  }
});

test('dragged or previously saved offsets cannot hide window controls off screen', () => {
  const frame = fitWindow(1366, 768.375);
  for (const offset of [{ x: 10000, y: -10000 }, { x: -10000, y: 10000 }, { x: NaN, y: Infinity }]) {
    const bounded = boundWindowOffset(offset, frame, 1366, 768.375);
    assert.ok(frame.left + bounded.x >= frame.margin - 0.001);
    assert.ok(frame.top + bounded.y >= frame.menu - 0.001);
    assert.ok(frame.left + bounded.x + frame.width <= 1366 - frame.margin + 0.001);
    assert.ok(frame.top + bounded.y + frame.height <= 768.375 - frame.dock + 0.001);
  }
});
