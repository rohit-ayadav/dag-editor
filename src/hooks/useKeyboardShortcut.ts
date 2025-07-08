import { useCallback, useEffect } from 'react';
import { Edge, Node } from 'reactflow';
import { applyAutoLayout } from '../utils/applyAutoLayout';

type Props = {
    addNode: () => void;
    undo: () => void;
    redo: () => void;
    handleDownloadJSON: () => void;
    setShowJson: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedElements: (elements: any[]) => void;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    selectedElements: any[];
    nodes: Node[];
    edges: Edge[];
};

const useKeyboardShortcuts = ({
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
}: Props) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // handleKeyDown(for Delete / Backspace)
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                const edgeIds = selectedElements
                    .filter((el) => 'source' in el && 'target' in el)
                    .map((el) => el.id);

                const nodeIds = selectedElements
                    .filter((el) => !('source' in el && 'target' in el))
                    .map((el) => el.id);

                setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));

                setEdges((eds) =>
                    eds.filter((e) => {
                        const isEdgeSelected = edgeIds.includes(e.id);
                        const isConnectedToDeletedNode =
                            nodeIds.includes(e.source) || nodeIds.includes(e.target);
                        return !isEdgeSelected && !isConnectedToDeletedNode;
                    })
                );

                // setSelectedElements([]);
            }

            // Escape to deselect
            else if (event.key === 'Escape') {
                setSelectedElements([]);
            }

            // Select all
            else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                setSelectedElements([...nodes, ...edges]);
            }

            // Add Node
            else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                addNode();
            }

            // Auto Layout
            else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
                event.preventDefault();
                const layouted = applyAutoLayout(nodes, edges, 'TB');
                setNodes(layouted);
            }

            // Download JSON
            else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                handleDownloadJSON();
            }

            // Toggle JSON viewer
            else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'h') {
                event.preventDefault();
                setShowJson((prev) => !prev);
            }

            // Undo / Redo
            else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                if (event.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        },
        [
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
        ]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return null;
};

export default useKeyboardShortcuts;