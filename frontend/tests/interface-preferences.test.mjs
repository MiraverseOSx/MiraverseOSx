import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INTERFACE_STORAGE_KEY, normalizeInterfacePreferences, readInterfacePreferences, saveInterfacePreferences, resolveInterfaceAppearance } from '../src/store/interfacePreferences.ts';

test('interface defaults are compact and system; invalid or older records are safely normalized', () => {
  for (const value of [null, undefined, [], 'light', {appearance:'broken',density:'tiny'}])
    assert.deepEqual(normalizeInterfacePreferences(value), {appearance:'system',density:'compact'});
  assert.deepEqual(normalizeInterfacePreferences({appearance:'dark',density:'comfortable',player:{credits:100}}), {appearance:'dark',density:'comfortable'});
});
test('appearance and density survive storage reload without touching gameplay records', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const entries = new Map([['player-save', '{"credits":321}']]);
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)}});
  try {
    saveInterfacePreferences({appearance:'dark',density:'comfortable'});
    assert.deepEqual(readInterfacePreferences(),{appearance:'dark',density:'comfortable'});
    assert.equal(entries.get('player-save'),'{"credits":321}');
    entries.set(INTERFACE_STORAGE_KEY,'bad json');
    assert.deepEqual(readInterfacePreferences(),{appearance:'system',density:'compact'});
    Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('Unavailable');}});
    assert.deepEqual(readInterfacePreferences(),{appearance:'system',density:'compact'});
    assert.doesNotThrow(()=>saveInterfacePreferences({appearance:'light',density:'compact'}));
  } finally { if(original) Object.defineProperty(globalThis,'localStorage',original); else delete globalThis.localStorage; }
});
test('explicit appearance overrides the device while system follows it', () => {
  assert.equal(resolveInterfaceAppearance('system',true),'dark');
  assert.equal(resolveInterfaceAppearance('system',false),'light');
  assert.equal(resolveInterfaceAppearance('light',true),'light');
  assert.equal(resolveInterfaceAppearance('dark',false),'dark');
});
const css = readFileSync(new URL('../src/styles/universal-system.css', import.meta.url),'utf8');
const luminance = hex => hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrast = (a,b) => { const x=luminance(a),y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
for(const mode of ['light','dark']) test(`universal ${mode} colors keep labels, metadata and primary actions readable`,()=>{
  const block=mode==='light'?css.match(/:root \{([^}]+)\}/)[1]:css.match(/html\[data-mira-appearance=dark\] \{([^}]+)\}/)[1];
  const colors=Object.fromEntries([...block.matchAll(/--os-([a-z-]+): (#[0-9a-f]{6})/g)].map(m=>[m[1],m[2]]));
  for(const background of ['canvas','surface','raised']) for(const text of ['text','secondary']) assert.ok(contrast(colors[text],colors[background])>=4.5,`${text} on ${background}`);
  assert.ok(contrast(colors['accent-text'],colors.accent)>=4.5);
  assert.ok(contrast(colors.focus,colors.surface)>=3);
});
