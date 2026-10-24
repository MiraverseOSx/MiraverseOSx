import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreEvidenceBoard } from '../src/gameplay/evidenceBoard.ts';
test('board migration preserves acquired nodes while rejecting hidden, malformed and duplicate links',()=>{
  assert.deepEqual(restoreEvidenceBoard(undefined,[]),{positions:{},connections:[]});
  const raw={positions:{audit:{x:99,y:12},hidden:{x:1,y:1},bad:{x:Infinity,y:1}},connections:[
    {source:'audit',target:'statement',label:'My theory'},
    {source:'audit',target:'statement',label:'Duplicate'},
    {source:'audit',target:'audit'},
    {source:'audit',target:'hidden'},null,
  ]};
  const result=restoreEvidenceBoard(raw,['audit','statement','bad']);
  assert.deepEqual(result.positions,{audit:{x:99,y:12}});
  assert.deepEqual(result.connections,[{id:'audit:statement',source:'audit',target:'statement',label:'My theory'}]);
  assert.deepEqual(restoreEvidenceBoard(JSON.parse(JSON.stringify(result)),['audit','statement']),result);
});
test('board input is bounded and connections disappear when access to an acquired source is removed',()=>{
  const result=restoreEvidenceBoard({positions:{a:{x:-99999,y:99999}},connections:[{source:'a',target:'b',label:'x'.repeat(1000)}]},['a','b']);
  assert.deepEqual(result.positions.a,{x:-2000,y:4000});
  assert.equal(result.connections[0].label.length,120);
  assert.deepEqual(restoreEvidenceBoard(result,['a']).connections,[]);
});
