import React, { useEffect } from 'react';
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
function Frame({ Story, appearance, density }: any) {
  useEffect(() => {
    document.documentElement.dataset.miraAppearance = appearance;
    document.documentElement.dataset.miraDensity = density;
  }, [appearance, density]);
  return <div style={{ minHeight: '100vh', padding: 20, background: 'var(--os-canvas)', color: 'var(--os-text)', fontFamily: 'var(--font-body)' }}><Story/></div>;
}
const preview: Preview = {
  globalTypes: {
    appearance: { toolbar: { icon: 'circlehollow', items: ['light', 'dark'], dynamicTitle: true } },
    density: { toolbar: { icon: 'component', items: ['compact', 'comfortable'], dynamicTitle: true } },
  },
  initialGlobals: { appearance: 'light', density: 'compact' },
  decorators: [(Story, context) => <Frame Story={Story} appearance={context.globals.appearance} density={context.globals.density}/>],
  parameters: { layout: 'fullscreen', a11y: { test: 'todo' } },
};
export default preview;
