import React, { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, useNodesState, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { restoreEvidenceBoard, type EvidenceBoard as Board } from '../../gameplay/evidenceBoard';
import './evidence-board.css';

function SourceNode({ data }: any) {
  const appName = ({ files: 'VAULT', mail: 'AUREMAIL', browser: 'VERSENET', dgaos: 'DGAOS' } as Record<string, string>)[data.app] || data.app;
  return <article className="evidence-board-node"><Handle type="target" position={Position.Left}/><strong>{data.title}</strong><small>{appName}</small><button type="button" className="nodrag" onClick={() => data.onOpen(data.id)}>Open original source</button><Handle type="source" position={Position.Right}/></article>;
}
const nodeTypes = { source: SourceNode };
export default function EvidenceBoard({ sources, board, editable, onSave, onOpen }: { sources: { id: string; title: string; app: string }[]; board: Board; editable: boolean; onSave: (board: Board) => { message: string }; onOpen: (id: string) => void }) {
  const ids = sources.map(source => source.id).join('|');
  const makeNodes = () => sources.map((source, index) => ({ id: source.id, type: 'source', deletable: false, position: board.positions[source.id] || { x: (index % 3) * 300, y: Math.floor(index / 3) * 180 }, data: { ...source, onOpen } }));
  const [nodes, setNodes, onNodesChange] = useNodesState(makeNodes());
  const [connections, setConnections] = useState(board.connections);
  const [notice, setNotice] = useState('');
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [label, setLabel] = useState('Player hypothesis');
  useEffect(() => { setNodes(makeNodes()); setConnections(board.connections); }, [ids]);
  const save = (nextConnections = connections, nextNodes = nodes) => {
    const next = restoreEvidenceBoard({ connections: nextConnections, positions: Object.fromEntries(nextNodes.map(node => [node.id, node.position])) }, sources.map(source => source.id));
    setConnections(next.connections); setNotice(onSave(next).message);
  };
  const connect = (connection: Pick<Connection, 'source' | 'target'>) => {
    if (!editable || !connection.source || !connection.target || connection.source === connection.target) return;
    save([...connections, { id: `${connection.source}:${connection.target}`, source: connection.source, target: connection.target, label: label.trim() || 'Player hypothesis' }]);
  };
  const edges = useMemo(() => connections.map(edge => ({ ...edge, label: 'Theory', ariaLabel: edge.label, style: { stroke: '#765b73' }, labelStyle: { fill: '#302733' }, labelBgStyle: { fill: '#fffaf7' } })), [connections]);
  return <section className="evidence-board" aria-label="Broad Street evidence board">
    <h3>Evidence board</h3><p>Arrange acquired sources and connect your theories. Board links do not count as report citations or establish a verdict.</p>
    {!sources.length ? <p>Acquire a source in its original app to add it to this board.</p> : <>
      <div className="evidence-board-canvas"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onConnect={connect} nodesDraggable={editable} nodesConnectable={editable} edgesReconnectable={false} onNodeDragStop={(_event, node) => save(connections, nodes.map(item => item.id === node.id ? node : item))} onEdgesDelete={removed => editable && save(connections.filter(edge => !removed.some(item => item.id === edge.id)))} deleteKeyCode={editable ? ['Backspace', 'Delete'] : null} fitView fitViewOptions={{ maxZoom: 1, padding: 0.15 }} minZoom={0.35} maxZoom={1.5}><Background/><Controls showInteractive={false}/></ReactFlow></div>
      <fieldset disabled={!editable} className="evidence-board-controls"><legend>Connect sources — keyboard alternative</legend><label>From<select value={from} onChange={event => setFrom(event.target.value)}><option value="">Select source</option>{sources.map(source => <option key={source.id} value={source.id}>{source.title}</option>)}</select></label><label>To<select value={to} onChange={event => setTo(event.target.value)}><option value="">Select source</option>{sources.map(source => <option key={source.id} value={source.id}>{source.title}</option>)}</select></label><label>Connection note<input value={label} maxLength={120} onChange={event => setLabel(event.target.value)}/></label><button type="button" disabled={!from || !to || from === to} onClick={() => connect({ source: from, target: to })}>Connect sources</button><button type="button" onClick={() => save()}>Save board positions</button></fieldset>
      <ul className="evidence-board-links">{connections.map(edge => <li key={edge.id}>{sources.find(source => source.id === edge.source)?.title} → {sources.find(source => source.id === edge.target)?.title}: {edge.label} {editable && <button type="button" aria-label={`Remove connection ${edge.label}`} onClick={() => save(connections.filter(item => item.id !== edge.id))}>Remove</button>}</li>)}</ul>
    </>}
    <p role="status">{notice}</p>
  </section>;
}
