import { Edge, Node } from 'reactflow';

export type ValidationResult = {
    isValid: boolean;
    message: string;
    invalidEdges: string[];  // list of edge IDs
};

export function validateDAG(nodes: Node[], edges: Edge[]): ValidationResult {
    if (nodes.length === 0) {
        return { isValid: false, message: 'Add a node to the graph.', invalidEdges: [] };
    }

    if (nodes.length < 2) {
        return { isValid: false, message: 'Graph must have at least 2 nodes.', invalidEdges: [] };
    }

    const graph: Record<string, string[]> = {};
    const invalidEdges: string[] = [];

    nodes.forEach((node) => {
        graph[node.id] = [];
    });

    // Check self-loops and build graph
    for (const edge of edges) {
        if (edge.source === edge.target) {
            invalidEdges.push(edge.id);
        } else {
            graph[edge.source]?.push(edge.target);
        }
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycleEdges = new Set<string>();

    function dfs(nodeId: string): boolean {
        if (!visited.has(nodeId)) {
            visited.add(nodeId);
            recStack.add(nodeId);

            for (const neighbor of graph[nodeId]) {
                if (!visited.has(neighbor) && dfs(neighbor)) {
                    const cycleEdge = edges.find(e => e.source === nodeId && e.target === neighbor);
                    if (cycleEdge) cycleEdges.add(cycleEdge.id);
                    return true;
                }
                if (recStack.has(neighbor)) {
                    const cycleEdge = edges.find(e => e.source === nodeId && e.target === neighbor);
                    if (cycleEdge) cycleEdges.add(cycleEdge.id);
                    return true;
                }
            }
        }
        recStack.delete(nodeId);
        return false;
    }

    for (const node of nodes) {
        if (dfs(node.id)) {
            break; // cycle detected
        }
    }

    invalidEdges.push(...Array.from(cycleEdges));

    const connectedNodes = new Set<string>();
    for (const edge of edges) {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    }

    if (connectedNodes.size < nodes.length) {
        return {
            isValid: false,
            message: 'All nodes must be connected by at least one edge.',
            invalidEdges,
        };
    }

    const isValid = invalidEdges.length === 0;
    return {
        isValid,
        message: isValid ? 'The graph is a valid Directed Acyclic Graph (DAG).' : 'Graph contains invalid edges.',
        invalidEdges,
    };
}
