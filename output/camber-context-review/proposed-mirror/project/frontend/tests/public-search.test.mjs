import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { createPublicSearch } from '../src/apps/Browser/publicSearch.ts';
registerHooks({ resolve(s,c,next) { try { return next(s,c); } catch(error) { if(error.code !== 'ERR_MODULE_NOT_FOUND' || !s.startsWith('.')) throw error; return next(`${s}.ts`,c); } } });
const { publicCaseSearch } = await import('../src/apps/investigation/publication.ts');
test('public search handles prefixes, swapped query order and minor typos offline', () => {
  const records=[{id:'public',title:'First Federal maintenance',summary:'Published facilities policy',publisher:'First Federal'}];
  const search=createPublicSearch(records);
  for(const query of ['maintenanc','federal first','First Federla maintenance']) assert.equal(search(query)[0]?.id,'public',query);
  assert.deepEqual(search(''),[]);
  assert.deepEqual(search('DNA profile'),[]);
  assert.equal(records.length,1);
});
test('case public index exposes its fixed publication without private evidence or solution material',()=>{
  assert.equal(publicCaseSearch('First Federla maintenance')[0]?.url,'https://firstfederal.aure/maintenance');
  for(const query of ['EV-0010','EV-0011','Silas Drake','DNA','credential replay']) assert.deepEqual(publicCaseSearch(query),[],query);
  assert.ok(publicCaseSearch('maintenance').every(record=>!Object.hasOwn(record,'body')&&!Object.hasOwn(record,'expected')));
});
