import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './component/CustomNode';
import { validateDAG } from './utils/validateDAG';
import { applyAutoLayout } from './utils/applyAutoLayout';

const nodeTypes = {
  custom: CustomNode,
};

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [dagStatus, setDagStatus] = useState<{
    message: string;
    valid: boolean;
  }>({ message: 'Validating DAG...', valid: false });

  const [showJson, setShowJson] = useState(false);

  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const futureRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);

  // Track undo/redo stack
  useEffect(() => {
    historyRef.current.push({ nodes, edges });
    futureRef.current = []; // clear redo stack
  }, [nodes, edges]);

  // Handle keyboard events for Undo/Redo
  useEffect(() => {
    const handleUndoRedo = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          // Redo
          if (futureRef.current.length) {
            const next = futureRef.current.pop();
            if (next) {
              historyRef.current.push({ nodes, edges });
              setNodes(next.nodes);
              setEdges(next.edges);
            }
          }
        } else {
          // Undo
          if (historyRef.current.length > 1) {
            const current = historyRef.current.pop(); // remove current
            const prev = historyRef.current[historyRef.current.length - 1];
            if (current && prev) {
              futureRef.current.push(current);
              setNodes(prev.nodes);
              setEdges(prev.edges);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleUndoRedo);
    return () => window.removeEventListener('keydown', handleUndoRedo);
  }, [nodes, edges]);

  const idRef = useRef(0);
  const getId = () => `node_${idRef.current++}`;

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.Arrow } }, eds)
      ),
    [setEdges]
  );

  const addNode = () => {
    const name = prompt('Enter node name:', `Node ${idRef.current}`);
    if (!name) return;

    const newNode: Node = {
      id: getId(),
      data: { label: name },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: 'custom',
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // Delete selected elements
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const nodeIds = selectedElements
          .filter((el) => el.type !== 'edge')
          .map((el) => el.id);
        const edgeIds = selectedElements
          .filter((el) => el.type === 'edge')
          .map((el) => el.id);

        setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
        setEdges((eds) =>
          eds.filter((e) => !edgeIds.includes(e.id) &&
            !nodeIds.includes(e.source) &&
            !nodeIds.includes(e.target))
        );
        setSelectedElements([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElements, setNodes, setEdges]);

  // Validate DAG
  useEffect(() => {
    let result: { message: string; valid: boolean };
    const dagValidation = validateDAG(nodes, edges);
    result = {
      message: dagValidation.message,
      valid: dagValidation.isValid,
    };
    if (!result.valid) {
      result.message = `❌ ${result.message}`;
    } else {
      result.message = `✅ ${result.message}`;
    }

    setDagStatus(result);
  }, [nodes, edges]);

  const handleDownloadJSON = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dag_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        padding: '10px 20px',
        backgroundColor: '#222',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 100,
      }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>🧩 DAG Editor</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button title="Add a new node" onClick={addNode}>➕ Add Node</button>
          <button title="Auto layout nodes vertically" onClick={() => {
            const layoutedNodes = applyAutoLayout(nodes, edges, 'TB');
            setNodes(layoutedNodes);
          }}>📐 Auto Layout</button>
          <button title="Undo last action" onClick={() => {
            if (historyRef.current.length > 1) {
              const current = historyRef.current.pop();
              const prev = historyRef.current[historyRef.current.length - 1];
              if (current && prev) {
                futureRef.current.push(current);
                setNodes(prev.nodes);
                setEdges(prev.edges);
              }
            }
          }}>↩️</button>
          <button title="Redo undone action" onClick={() => {
            if (futureRef.current.length) {
              const next = futureRef.current.pop();
              if (next) {
                historyRef.current.push({ nodes, edges });
                setNodes(next.nodes);
                setEdges(next.edges);
              }
            }
          }}>↪️</button>
          <button title="Toggle JSON preview panel" onClick={() => setShowJson(!showJson)}>
            {showJson ? '❌ Hide JSON' : '📄 Show JSON'}
          </button>
          <button title="Download current DAG as JSON" onClick={handleDownloadJSON}>💾 Download JSON</button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Canvas Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={({ nodes, edges }) => {
              setSelectedElements([...nodes, ...edges]);
            }}
            nodeTypes={nodeTypes}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        {/* JSON Preview Panel */}
        {showJson && (
          <div style={{
            width: '400px',
            borderLeft: '1px solid #ccc',
            background: '#1e1e1e',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflowY: 'auto',
            padding: '10px',
          }}>
            <h3 style={{ marginBottom: '6px', fontWeight: 'bold' }}>🔍 Live JSON Preview</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify({ nodes, edges }, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <footer style={{
        padding: '8px 16px',
        backgroundColor: '#222',
        color: dagStatus.valid ? '#4caf50' : '#f44336',
        fontSize: '13px',
        borderTop: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>{dagStatus.message}</span>
        <span>
          {dagStatus.valid ? '✅ Valid DAG' : '❌ Invalid DAG'}
        </span>
      </footer>
    </div>
  );
};

const AppWrapper = () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);

export default AppWrapper;