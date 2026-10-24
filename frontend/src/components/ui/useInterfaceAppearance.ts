import { useEffect } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { resolveInterfaceAppearance, subscribeInterfacePreferences } from '../../store/interfacePreferences';

export function useInterfaceAppearance() {
  const preferences = useSystemStore(state => state.interfacePreferences);
  useEffect(() => subscribeInterfacePreferences(interfacePreferences => useSystemStore.setState({ interfacePreferences }), window), []);
  useEffect(() => {
    const query = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    const apply = () => {
      document.documentElement.dataset.miraAppearance = resolveInterfaceAppearance(preferences.appearance, !!query?.matches);
      document.documentElement.dataset.miraDensity = preferences.density;
    };
    apply();
    query?.addEventListener('change', apply);
    return () => query?.removeEventListener('change', apply);
  }, [preferences.appearance, preferences.density]);
}
