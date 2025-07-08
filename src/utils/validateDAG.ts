import { Edge, Node } from 'reactflow';

export type ValidationResult = {
    isValid: boolean;
    message: string;
};

export function validateDAG(nodes: Node[], edges: Edge[]): ValidationResult {
    if (nodes.length === 0) {
        return { isValid: false, message: 'Add a node to the graph.' };
    }
    if (nodes.length < 2) {
        return { isValid: false, message: 'Graph must have at least 2 nodes.' };
    }

    const graph: Record<string, string[]> = {};

    nodes.forEach((node) => {
        graph[node.id] = [];
    });

    for (const edge of edges) {
        if (edge.source === edge.target) {
            return { isValid: false, message: 'Self-loops are not allowed.' };
        }
        if (graph[edge.source]) {
            graph[edge.source].push(edge.target);
        }
    }

    // Track visited nodes to detect cycles
    const visited = new Set<string>();
    const recStack = new Set<string>();

    function hasCycle(nodeId: string): boolean {
        if (!visited.has(nodeId)) {
            visited.add(nodeId);
            recStack.add(nodeId);

            for (const neighbor of graph[nodeId]) {
                if (!visited.has(neighbor) && hasCycle(neighbor)) return true;
                if (recStack.has(neighbor)) return true;
            }
        }
        recStack.delete(nodeId);
        return false;
    }

    for (const node of nodes) {
        if (hasCycle(node.id)) {
            return { isValid: false, message: 'Cycle detected in the graph.' };
        }
    }

    // Check connectivity
    const connectedNodes = new Set<string>();
    for (const edge of edges) {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    }
    if (connectedNodes.size < nodes.length) {
        return { isValid: false, message: 'All nodes must be connected by at least one edge.' };
    }

    return { isValid: true, message: 'The graph is a valid Directed Acyclic Graph (DAG).' };
}
