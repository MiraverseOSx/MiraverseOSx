import { generateSearchBundle, searchKey, webFilesFor, countWebFolders, type SearchBundle } from '../apps/Browser/searchCatalog';
export interface VersenetActions {
  rememberVersenetSearch: (query: string) => SearchBundle | null;
  saveVersenetRecord: (id: string) => { ok: boolean; message: string };
}
export function createVersenetActions(set: any, get: any): VersenetActions {
  return {
    rememberVersenetSearch: query => {
      const state = get().versenetContent;
      const key = searchKey(query);
      if (Object.hasOwn(state.catalog, key)) return state.catalog[key];
      const bundle = generateSearchBundle(query);
      if (bundle) set((s: any) => ({ versenetContent: { ...s.versenetContent, catalog: { ...s.versenetContent.catalog, [key]: bundle } } }));
      return bundle;
    },
    saveVersenetRecord: id => {
      const content = get().versenetContent;
      const files = webFilesFor(content, id);
      if (!files.length) return { ok: false, message: 'This record is not a downloadable document or folder.' };
      const missing = files.filter(file => !Object.hasOwn(content.savedFiles, file.id));
      if (!missing.length) return { ok: true, message: 'Already saved in /downloads/versenet.' };
      set((s: any) => ({ versenetContent: { ...s.versenetContent, savedFiles: countWebFolders({ ...s.versenetContent.savedFiles, ...Object.fromEntries(missing.map(file => [file.id, file])) }) } }));
      return { ok: true, message: 'Saved to File Explorer → /downloads/versenet.' };
    },
  };
}
