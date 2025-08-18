import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {Background, Controls, ReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import LogNode from '../components/LogNode';
import {getLogsByBlockId, LogEntry} from '../api/vfl';
import {createFlowFromLogEntries, FlowEdge, FlowNode} from "./helpers/LogsPageHelper";

const maxChildren = 2;
const maxDepth = 2;

// Simple tree layout algorithm
const applyTreeLayout = (nodes: FlowNode[], edges: FlowEdge[]) => {
    if (nodes.length === 0) return { nodes, edges };

    const nodeWidth = 350;
    const nodeHeight = 180;
    const horizontalSpacing = 50;
    const verticalSpacing = 50;

    // Build adjacency list to find children
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>();

    edges.forEach(edge => {
        if (!childrenMap.has(edge.source)) {
            childrenMap.set(edge.source, []);
        }
        childrenMap.get(edge.source)!.push(edge.target);
        parentMap.set(edge.target, edge.source);
    });

    // Find root nodes (nodes with no parents)
    const rootNodes = nodes.filter(node => !parentMap.has(node.id));

    // If no clear root, take the first node
    if (rootNodes.length === 0 && nodes.length > 0) {
        rootNodes.push(nodes[0]);
    }

    // Calculate node levels (depth from root)
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    const calculateLevels = (nodeId: string, level: number) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        levels.set(nodeId, level);

        const children = childrenMap.get(nodeId) || [];
        children.forEach(childId => calculateLevels(childId, level + 1));
    };

    // Start level calculation from all roots
    rootNodes.forEach(root => calculateLevels(root.id, 0));

    // Ensure all nodes have a level (handle disconnected nodes)
    nodes.forEach(node => {
        if (!levels.has(node.id)) {
            levels.set(node.id, 0);
        }
    });

    // Group nodes by level
    const nodesByLevel = new Map<number, FlowNode[]>();
    nodes.forEach(node => {
        const level = levels.get(node.id) || 0;
        if (!nodesByLevel.has(level)) {
            nodesByLevel.set(level, []);
        }
        nodesByLevel.get(level)!.push(node);
    });

    // Calculate subtree widths for better spacing
    const subtreeWidths = new Map<string, number>();

    const calculateSubtreeWidth = (nodeId: string): number => {
        if (subtreeWidths.has(nodeId)) {
            return subtreeWidths.get(nodeId)!;
        }

        const children = childrenMap.get(nodeId) || [];
        if (children.length === 0) {
            subtreeWidths.set(nodeId, nodeWidth);
            return nodeWidth;
        }

        const childrenWidth = children.reduce((sum, childId) => {
            return sum + calculateSubtreeWidth(childId) + horizontalSpacing;
        }, 0) - horizontalSpacing; // Remove last spacing

        const width = Math.max(nodeWidth, childrenWidth);
        subtreeWidths.set(nodeId, width);
        return width;
    };

    // Calculate subtree widths for all nodes
    nodes.forEach(node => calculateSubtreeWidth(node.id));

    // Position nodes level by level
    const positionedNodes = new Map<string, {x: number, y: number}>();
    const maxLevel = Math.max(...Array.from(levels.values()));

    // Position root nodes first
    let currentX = 0;
    rootNodes.forEach((root, index) => {
        if (index > 0) {
            currentX += subtreeWidths.get(rootNodes[index - 1].id) || nodeWidth;
            currentX += horizontalSpacing * 2; // Extra spacing between root trees
        }

        positionedNodes.set(root.id, {
            x: currentX + (subtreeWidths.get(root.id) || nodeWidth) / 2 - nodeWidth / 2,
            y: 0
        });
    });

    // Position children recursively
    const positionChildren = (parentId: string, parentX: number, parentY: number) => {
        const children = childrenMap.get(parentId) || [];
        if (children.length === 0) return;

        const childY = parentY + nodeHeight + verticalSpacing;

        // Calculate total width needed for all children
        const totalChildrenWidth = children.reduce((sum, childId, index) => {
            const childWidth = subtreeWidths.get(childId) || nodeWidth;
            return sum + childWidth + (index > 0 ? horizontalSpacing : 0);
        }, 0);

        // Start position for children (centered under parent)
        let childX = parentX + nodeWidth / 2 - totalChildrenWidth / 2;

        children.forEach((childId, index) => {
            const childWidth = subtreeWidths.get(childId) || nodeWidth;
            const childCenterX = childX + childWidth / 2;

            positionedNodes.set(childId, {
                x: childCenterX - nodeWidth / 2,
                y: childY
            });

            // Recursively position this child's children
            positionChildren(childId, childCenterX - nodeWidth / 2, childY);

            // Move to next child position
            childX += childWidth + horizontalSpacing;
        });
    };

    // Position all children starting from roots
    rootNodes.forEach(root => {
        const rootPos = positionedNodes.get(root.id)!;
        positionChildren(root.id, rootPos.x, rootPos.y);
    });

    // Apply positions to nodes
    const layoutedNodes = nodes.map(node => ({
        ...node,
        position: positionedNodes.get(node.id) || { x: 0, y: 0 }
    }));

    return { nodes: layoutedNodes, edges };
};

export default function LogsPage({blockId, goBack}: { blockId: string; goBack: () => void }) {
    const [nodes, setNodes] = useState<FlowNode[]>([]);
    const [edges, setEdges] = useState<FlowEdge[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper function to apply layout to current nodes and edges
    const applyLayout = (currentNodes: FlowNode[], currentEdges: FlowEdge[]) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = applyTreeLayout(currentNodes, currentEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    };

    const onLoadMoreChildren = useCallback(async (logEntry: LogEntry) => {
        try {
            const logs = await getLogsByBlockId(logEntry.blockId, maxDepth, maxChildren, logEntry.childrenCursor);
            if (!logs || logs.length === 0) {
                return;
            }

            // Create new flow elements from the fetched logs
            const created = createFlowFromLogEntries(logs);

            // Update nodes and edges
            setNodes(currentNodes => {
                const updatedNodes = currentNodes.map(node =>
                    node.id === logEntry.id
                        ? { ...node, data: { ...node.data, childrenCursor: null } }
                        : node
                );
                const newNodes = [...updatedNodes, ...created.nodes];
                return newNodes;
            });

            setEdges(currentEdges => {
                const newEdges = [...currentEdges, ...created.edges];
                return newEdges;
            });

            // Apply auto-layout after state updates
            setTimeout(() => {
                setNodes(currentNodes => {
                    setEdges(currentEdges => {
                        const { nodes: layoutedNodes, edges: layoutedEdges } = applyTreeLayout(currentNodes, currentEdges);
                        setEdges(layoutedEdges);
                        return layoutedNodes;
                    });
                    return currentNodes;
                });
            }, 0);
        } catch (error) {
            console.error("Error loading more children:", error);
        }
    }, []);

    const onLoadMoreSiblings = useCallback(async (logEntry: LogEntry) => {
        try {
            const logs = await getLogsByBlockId(logEntry.blockId, maxDepth, maxChildren, logEntry.siblingCursor);
            if (!logs || logs.length === 0) {
                return;
            }

            // Create new flow elements from the fetched logs
            const created = createFlowFromLogEntries(logs);

            // Update nodes and edges
            setNodes(currentNodes => {
                const updatedNodes = currentNodes.map(node =>
                    node.id === logEntry.id
                        ? { ...node, data: { ...node.data, siblingCursor: null } }
                        : node
                );
                const newNodes = [...updatedNodes, ...created.nodes];
                return newNodes;
            });

            setEdges(currentEdges => {
                const newEdges = [...currentEdges, ...created.edges];
                return newEdges;
            });

            // Apply auto-layout after state updates
            setTimeout(() => {
                setNodes(currentNodes => {
                    setEdges(currentEdges => {
                        const { nodes: layoutedNodes, edges: layoutedEdges } = applyTreeLayout(currentNodes, currentEdges);
                        setEdges(layoutedEdges);
                        return layoutedNodes;
                    });
                    return currentNodes;
                });
            }, 0);
        } catch (error) {
            console.error("Error loading more siblings:", error);
        }
    }, []);

    // Memoize nodeTypes to prevent unnecessary re-renders
    const nodeTypes = useMemo(() => ({
        logNode: (props) => (
            <LogNode
                {...props}
                onLoadMoreChildren={onLoadMoreChildren}
                onLoadMoreSiblings={onLoadMoreSiblings}
            />
        )
    }), [onLoadMoreChildren, onLoadMoreSiblings]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getLogsByBlockId(blockId, maxDepth, maxChildren);
                console.debug("Fetched logs:", data);

                if (data && data.length > 0) {
                    const {nodes: generatedNodes, edges: generatedEdges} = createFlowFromLogEntries(data);
                    // Apply auto-layout to initial data
                    applyLayout(generatedNodes, generatedEdges);
                } else {
                    setNodes([]);
                    setEdges([]);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
                setNodes([]);
                setEdges([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [blockId]);

    // Manual re-layout button (optional)
    const handleReLayout = useCallback(() => {
        applyLayout(nodes, edges);
    }, [nodes, edges, applyLayout]);

    if (loading) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
            }}>
                Loading logs...
            </div>
        );
    }

    return (
        <div style={{width: '100vw', height: '100vh'}}>
            <button
                onClick={goBack}
                style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    zIndex: 10,
                    padding: '8px 16px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                ← Back
            </button>

            <button
                onClick={handleReLayout}
                style={{
                    position: 'absolute',
                    top: '16px',
                    left: '90px',
                    zIndex: 10,
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Re-layout
            </button>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
            >
                <Background/>
                <Controls/>
            </ReactFlow>
        </div>
    );
}