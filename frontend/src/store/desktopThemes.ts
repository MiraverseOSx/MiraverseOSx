export const DESKTOP_THEMES = [
  { id: 'cherry-mist', name: 'Cherry Mist', detail: 'Charcoal, mauve & berry blush', colors: ['#858185','#6C6B6F','#9D959B','#4E5155','#C5ADBC','#E6D0DD','#B98292'], accent: '#6C6B6F', soft: '#E6D0DD', paper: '#FAF6F9', ink: '#303236', muted: '#4E5155', line: '#C5ADBC', start: '#4E5155', end: '#6C6B6F', glow: '#B98292' },
  { id: 'heather', name: 'Mountain Heather', detail: 'Blush, plum & moonstone', colors: ['#16131f', '#f0d9e4', '#c1a0ac', '#4a3f4b', '#806c79'], accent: '#654b60', soft: '#f0d9e4', paper: '#fcf8fa', ink: '#302733', muted: '#746573', line: '#e2d5de', start: '#16131f', end: '#4a3f4b', glow: '#c1a0ac' },
  { id: 'pine', name: 'Stillwater Pine', detail: 'Pine, moss & forest', colors: ['#1c2d2a', '#0e1719', '#baba9e', '#3b4a38', '#6b765c'], accent: '#3b5548', soft: '#e2e7d8', paper: '#f8faf5', ink: '#22352e', muted: '#617064', line: '#d4ddd0', start: '#0e1719', end: '#1c2d2a', glow: '#6b765c' },
  { id: 'sienna', name: 'Velvet Sienna', detail: 'Burgundy, dove & cocoa', colors: ['#c0bab3', '#52423d', '#887d77', '#391214', '#160f0c'], accent: '#713d43', soft: '#eddfdd', paper: '#fcf8f5', ink: '#382b2b', muted: '#796764', line: '#e1d4ce', start: '#160f0c', end: '#391214', glow: '#887d77' },
  { id: 'autumn', name: 'Autumn Study', detail: 'Warm oak, caramel & linen', colors: ['#22150c', '#432c1a', '#816550', '#a98c75', '#d3cbc1'], accent: '#765337', soft: '#eee3d6', paper: '#fcf9f3', ink: '#382c23', muted: '#796956', line: '#e3d8c9', start: '#22150c', end: '#432c1a', glow: '#a98c75' },
  { id: 'mist', name: 'Morning Mist', detail: 'Sage, powder blue & rose', colors: ['#5e8b7e', '#a7c7e7', '#2f3e46', '#f1f5f4', '#ebaeb7'], accent: '#426e62', soft: '#dfebe7', paper: '#f6faf9', ink: '#2f3e46', muted: '#5e7378', line: '#d2e0df', start: '#2f3e46', end: '#527b82', glow: '#a7c7e7' },
] as const;
export type DesktopThemeId = typeof DESKTOP_THEMES[number]['id'];
export const getDesktopTheme = (id: unknown) => DESKTOP_THEMES.find(theme => theme.id === id) || DESKTOP_THEMES.find(theme => theme.id === 'heather')!;
export function desktopThemeStyle(id: unknown): Record<string, string> {
  const theme = getDesktopTheme(id);
  const tokens = ['accent', 'soft', 'paper', 'ink', 'muted', 'line', 'start', 'end', 'glow'] as const;
  return Object.fromEntries(tokens.map(key => [`--studio-${key}`, theme[key]]));
}
