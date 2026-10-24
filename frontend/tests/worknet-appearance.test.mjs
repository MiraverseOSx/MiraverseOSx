import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../src/styles/worknet.css',import.meta.url),'utf8').split('/* Approved earthy editorial identity.')[1];
const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
for(const mode of ['light','dark']) test(`WORKNET ${mode} appearance maintains readable body, metadata, actions and focus colors`,()=>{
 const block=mode==='light'?css.match(/\.worknet-enterprise-shell \{([^}]+)\}/)[1]:css.match(/\[data-appearance=dark\] \{([^}]+)\}/)[1];
 const tokens=Object.fromEntries([...block.matchAll(/--(wn-[a-z-]+):(#[0-9a-f]{6})/gi)].map(m=>[m[1],m[2]]));
 for(const surface of ['wn-panel','wn-bg','wn-nav']) for(const ink of ['wn-text','wn-secondary']) assert.ok(contrast(tokens[ink],tokens[surface])>=4.5,`${ink} on ${surface}`);
 assert.ok(contrast('#fff7ef',tokens['wn-action'])>=4.5,'Primary action labels');
 assert.ok(contrast(tokens['wn-accent'],tokens['wn-panel'])>=3,'Focus indicators');
});
