export const WINDOW_RATIO = 16 / 9;

export function fitWindow(screenW: number, screenH: number, index = 0, maximized = false) {
  if (maximized) return { width: screenW, height: screenH, left: 0, top: 0, menu: 0, dock: 0, margin: 0 };
  const margin = screenW < 768 ? 8 : 24;
  const menu = screenH < 500 ? 60 : 72;
  const dock = screenH < 500 ? 76 : 96;
  const availableWidth = Math.max(0, screenW - margin * 2);
  const availableHeight = Math.max(0, screenH - menu - dock);
  const width = Math.min(1120, availableWidth, availableHeight * WINDOW_RATIO);
  const height = width / WINDOW_RATIO;
  const cascade = screenW < 768 ? 0 : (index % 5) * 18;
  const left = Math.max(margin, Math.min(screenW - width - margin, (screenW - width) / 2 + cascade));
  const top = Math.max(menu, Math.min(screenH - dock - height, menu + (availableHeight - height) / 2 + cascade));
  return { width, height, left, top, menu, dock, margin };
}

export function boundWindowOffset(offset: { x: number; y: number }, frame: ReturnType<typeof fitWindow>, screenW: number, screenH: number) {
  return {
    x: Math.max(frame.margin - frame.left, Math.min(screenW - frame.margin - frame.width - frame.left, Number.isFinite(offset.x) ? offset.x : 0)),
    y: Math.max(frame.menu - frame.top, Math.min(screenH - frame.dock - frame.height - frame.top, Number.isFinite(offset.y) ? offset.y : 0)),
  };
}
