import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
import useKeyboardShortcuts from './hooks/useKeyboardShortcut';
import isEqual from 'lodash.isequal';


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
    invalidEdges: string[];
  }>({
    message: 'Validating DAG...',
    valid: false,
    invalidEdges: []
  });
  const [showJson, setShowJson] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const futureRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const lastSelectionRef = useRef<any[]>([]);

  // Track undo/redo stack
  useEffect(() => {
    historyRef.current.push({ nodes, edges });
    futureRef.current = []; // clear redo stack
  }, [nodes, edges]);

  // Handle Undo
  const undo = useCallback(() => {
    if (historyRef.current.length > 1) {
      const current = historyRef.current.pop(); // remove current
      const prev = historyRef.current[historyRef.current.length - 1];
      if (current && prev) {
        futureRef.current.push(current);
        setNodes(prev.nodes);
        setEdges(prev.edges);
      }
    }
  }, [setNodes, setEdges]);

  // Handle Redo
  const redo = useCallback(() => {
    if (futureRef.current.length) {
      const next = futureRef.current.pop();
      if (next) {
        historyRef.current.push({ nodes, edges });
        setNodes(next.nodes);
        setEdges(next.edges);
      }
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Generate unique ID
  const idRef = useRef(0);
  const getId = useCallback(() => `node_${idRef.current++}`, []);

  // Handle connections
  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.Arrow } }, eds)
      ),
    [setEdges]
  );

  // Add new node
  const addNode = useCallback(() => {
    const name = prompt('Enter node name:', `Node ${idRef.current}`);
    if (!name) return;
    const newNode: Node = {
      id: getId(),
      data: { label: name },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: 'custom',
    };
    setNodes((nds) => [...nds, newNode]);
  }, [getId, setNodes]);

  // Copy JSON to clipboard
  const copyToClipboard = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    navigator.clipboard.writeText(data).then(
      () => alert('Copied to clipboard!'),
      () => alert('Failed to copy to clipboard')
    );
  }, [nodes, edges]);

  // Download JSON
  const handleDownloadJSON = useCallback(() => {
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
  }, [nodes, edges]);

  // Validate DAG
  useEffect(() => {
    const dagValidation = validateDAG(nodes, edges);
    setDagStatus({
      message: dagValidation.message,
      valid: dagValidation.isValid,
      invalidEdges: dagValidation.invalidEdges || []
    });
  }, [nodes, edges]);

  // Apply auto layout
  const applyLayout = useCallback(() => {
    const layoutedNodes = applyAutoLayout(nodes, edges, 'LR');
    // const layoutedNodes = applyAutoLayout(nodes, edges, 'TB');
    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes]);

  useKeyboardShortcuts({
    addNode,
    undo,
    redo,
    handleDownloadJSON,
    setShowJson,
    setSelectedElements,
    setNodes,
    setEdges,
    selectedElements,
    nodes,
    edges,
  });
  

  // Get highlighted edges
  const getHighlightedEdges = useCallback(() => {
    return edges.map(edge => ({
      ...edge,
      className: dagStatus.invalidEdges.includes(edge.id) ? 'invalid-edge' : '',
      style: dagStatus.invalidEdges.includes(edge.id)
        ? { stroke: '#ff4d4d', strokeWidth: 2 }
        : undefined
    }));
  }, [edges, dagStatus.invalidEdges]);

  // Memoized highlighted edges
  const highlightedEdges = useMemo(() => getHighlightedEdges(), [getHighlightedEdges]);

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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button title="Add a new node (Ctrl + Enter)" onClick={addNode}>➕ Add Node</button>
          <button title="Auto layout nodes vertically (Ctrl + L)" onClick={applyLayout}>📐 Auto Layout</button>
          <button title="Undo last action (Ctrl + Z)" onClick={undo}>↩️</button>
          <button title="Redo undone action (Ctrl + Shift + Z)" onClick={redo}>↪️</button>
          <button title="Copy DAG JSON to clipboard (Ctrl + C)" onClick={copyToClipboard}>📋 Copy JSON</button>
          <button title="Toggle JSON preview panel (Ctrl + H)" onClick={() => setShowJson(!showJson)}>
            {showJson ? '❌ Hide JSON' : '📄 Show JSON'}
          </button>
          <button title="Download current DAG as JSON" onClick={handleDownloadJSON}>💾 Download JSON</button>
          <button
            title="Show keyboard shortcuts"
            onClick={() => setShowHelp(!showHelp)}
            style={{ marginLeft: 'auto' }}
          >
            ❓ Help
          </button>
        </div>
      </header>

      {/* Shortcuts Help Panel */}
      {showHelp && (
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#333',
          color: '#fff',
          fontSize: '13px',
          borderTop: '1px solid #444',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div><strong>Ctrl+A:</strong> Select all</div>
          <div><strong>Ctrl+Z:</strong> Undo</div>
          <div><strong>Shift+Ctrl+Z:</strong> Redo</div>
          <div><strong>Ctrl+L:</strong> Auto layout</div>
          <div><strong>Ctrl+S:</strong> Save JSON</div>
          <div><strong>Ctrl+H:</strong> Toggle JSON view</div>
          <div><strong>Ctrl+Enter:</strong> Add node</div>
          <div><strong>Delete:</strong> Remove selection</div>
          <div><strong>Esc:</strong> Deselect all</div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Canvas Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={highlightedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            // onSelectionChange={({ nodes, edges }) => {
            //   setSelectedElements([...nodes, ...edges]);
            // }}
            onSelectionChange={({ nodes: selectedNodes, edges: selectedEdges }) => {
              const currentSelection = [...selectedNodes, ...selectedEdges];

              if (!isEqual(lastSelectionRef.current, currentSelection)) {
                lastSelectionRef.current = currentSelection;
                setSelectedElements(currentSelection);
              }
            }} // because we are using isEqual from lodash to compare the current selection with the last selection
            onPaneClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedElements([]);
                lastSelectionRef.current = [];
              }
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