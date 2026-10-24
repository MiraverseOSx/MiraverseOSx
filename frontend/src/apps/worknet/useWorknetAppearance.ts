import { useEffect, useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { resolveInterfaceAppearance } from '../../store/interfacePreferences';
export type WorknetAppearance = 'light' | 'dark' | 'system';
export function useWorknetAppearance() {
  const systemAppearance = useSystemStore(state => state.interfacePreferences.appearance);
  const [appearance, setAppearance] = useState<WorknetAppearance>(() => { try { const value = localStorage.getItem('miraverse-worknet-appearance'); return ['light','dark','system'].includes(value || '') ? value as WorknetAppearance : 'system'; } catch { return 'system'; } });
  const [systemDark, setSystemDark] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => { try { localStorage.setItem('miraverse-worknet-appearance', appearance); } catch {} }, [appearance]);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const query = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return { appearance, setAppearance, resolvedAppearance: appearance === 'system' ? resolveInterfaceAppearance(systemAppearance, systemDark) : appearance };
}
