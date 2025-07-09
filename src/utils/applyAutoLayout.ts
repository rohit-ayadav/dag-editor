import dagre from 'dagre';
import { Node as RFNode, Edge, Position } from 'reactflow';

// Extend Node type to include optional measured property
type Node = RFNode & {
    measured?: {
        width?: number;
        height?: number;
    };
};

/**
 * Applies automatic layout to nodes using the Dagre library.
 *
 * @param nodes - React Flow nodes array
 * @param edges - React Flow edges array
 * @param direction - Layout direction: 'LR' (Left to Right) or 'TB' (Top to Bottom)
 * @returns Updated nodes with calculated positions
 */
export const applyAutoLayout = (nodes: Node[], edges: Edge[], direction: 'LR' | 'TB' = 'TB'): Node[] => {
    if (!nodes.length) return [];

    // Initialize Dagre graph
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configure layout options
    const isHorizontal = direction === 'LR';
    const defaultNodeWidth = 120;
    const defaultNodeHeight = 60;

    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 50,     // Horizontal spacing between nodes
        ranksep: 70,     // Vertical spacing between ranks
        marginx: 30,     // Left/right margin
        marginy: 30,     // Top/bottom margin
    });

    // Add nodes to the graph with size info
    nodes.forEach((node) => {
        const width = node.measured?.width ?? defaultNodeWidth;
        const height = node.measured?.height ?? defaultNodeHeight;
        dagreGraph.setNode(node.id, { width, height });
    });

    // Add edges to the graph
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run the layout engine
    try {
        dagre.layout(dagreGraph);
    } catch (error) {
        console.warn('Dagre layout failed:', error);
        return nodes; // Fallback to original positions
    }

    // Update node positions based on Dagre layout
    return nodes.map((node) => {
        const { x, y } = dagreGraph.node(node.id);

        return {
            ...node,
            position: {
                x: x - (node.measured?.width ?? defaultNodeWidth) / 2, 
                y: y - (node.measured?.height ?? defaultNodeHeight) / 2,
            },
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
        };
    });
};