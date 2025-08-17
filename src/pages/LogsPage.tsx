// src/pages/LogsPage.tsx - ReactFlow Implementation with Handle Fix
// @ts-ignore
import React, { useCallback, useEffect, useState } from 'react';
import {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    Handle,
    MarkerType,
    MiniMap,
    Node,
    NodeTypes,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getLogsByBlockId, LogEntry } from "../api/vfl";

// Custom Node Component
const LogNode = ({ data }: { data: any }) => {
    const { log, onExpand, onSelect, canExpandChildren, canExpandSiblings, isLoading } = data;

    const getNodeColor = (logType: string) => {
        switch (logType.toLowerCase()) {
            case 'error':
                return '#dc2626';
            case 'warning':
                return '#d97706';
            case 'debug':
                return '#7c3aed';
            case 'info':
                return '#2563eb';
            default:
                return '#059669';
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    };

    return (
        <>
            {/* Target Handle (top) - where edges come IN */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: '#555',
                    width: 8,
                    height: 8,
                }}
            />

            <div
                className="log-node"
                style={{
                    background: 'white',
                    border: `2px solid ${getNodeColor(log.logType)}`,
                    borderRadius: '8px',
                    padding: '12px',
                    width: '200px',
                    minHeight: '80px',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                onClick={() => onSelect(log)}
            >
                {/* Log Type Badge */}
                <div
                    style={{
                        background: getNodeColor(log.logType),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        display: 'inline-block',
                    }}
                >
                    {log.logType}
                </div>

                {/* Log ID */}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px', fontFamily: 'monospace' }}>
                    {log.id.substring(0, 8)}...
                </div>

                {/* Message */}
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px', lineHeight: '1.3' }}>
                    {truncateText(log.message || 'No message', 30)}
                </div>

                {/* Timestamp */}
                <div style={{ fontSize: '9px', color: '#888' }}>
                    {formatTime(log.timestamp)}
                </div>

                {/* Expand Buttons */}
                <div style={{ position: 'absolute', top: '-8px', right: '-8px', display: 'flex', gap: '4px' }}>
                    {canExpandChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onExpand('children');
                            }}
                            disabled={isLoading}
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: 'none',
                                background: '#2563eb',
                                color: 'white',
                                fontSize: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            title="Expand children"
                        >
                            {isLoading ? '⏳' : '↓'}
                        </button>
                    )}
                    {canExpandSiblings && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onExpand('siblings');
                            }}
                            disabled={isLoading}
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: 'none',
                                background: '#16a34a',
                                color: 'white',
                                fontSize: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            title="Expand siblings"
                        >
                            {isLoading ? '⏳' : '→'}
                        </button>
                    )}
                </div>
            </div>

            {/* Source Handle (bottom) - where edges go OUT */}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: '#555',
                    width: 8,
                    height: 8,
                }}
            />
        </>
    );
};

const nodeTypes: NodeTypes = {
    logNode: LogNode,
};

interface GraphNode {
    id: string;
    log: LogEntry;
    children: GraphNode[];
    parent: GraphNode | null;
    expanded: boolean;
    canLoadMoreChildren: boolean;
    canLoadMoreSiblings: boolean;
    isLoading: boolean;
}

export default function LogsPage({
                                     blockId,
                                     goBack,
                                 }: {
    blockId: string;
    goBack: () => void;
}) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [graphNodes, setGraphNodes] = useState<Map<string, GraphNode>>(new Map());

    const maxDepth = 3;
    const maxChildren = 5;

    const calculateTimeDelta = (parentTime: number, childTime: number): string => {
        const delta = childTime - parentTime;
        if (delta < 0) return 'undefined';
        if (delta < 1000) return `${delta}ms`;
        if (delta < 60000) return `${(delta / 1000).toFixed(1)}s`;
        return `${(delta / 60000).toFixed(1)}m`;
    };

    const createGraphNode = (log: LogEntry, parent: GraphNode | null = null): GraphNode => {
        return {
            id: log.id,
            log,
            children: [],
            parent,
            expanded: false,
            canLoadMoreChildren: !!log.childrenCursor || (log.children && log.children.length > 0),
            canLoadMoreSiblings: true,
            isLoading: false,
        };
    };

    const getNodeId = (log: LogEntry): string => {
        // Use "ROOT" as ID if parentLogId is null, otherwise use the log ID
        return log.parentLogId === null ? "ROOT" : log.id;
    };

    const buildNodesAndEdges = (graphNodes: Map<string, GraphNode>) => {
        const reactFlowNodes: Node[] = [];
        const reactFlowEdges: Edge[] = [];
        const processedNodes = new Set<string>();

        // Layout constants
        const HORIZONTAL_SPACING = 300;
        const VERTICAL_SPACING = 150;

        // Find root nodes (nodes without parents or with parentLogId === null)
        const rootNodes = Array.from(graphNodes.values()).filter(node =>
            !node.parent || node.log.parentLogId === null
        );

        // Position nodes using a tree layout algorithm
        const positionNode = (node: GraphNode, x: number, y: number, depth: number) => {
            const nodeId = getNodeId(node.log);

            if (processedNodes.has(nodeId)) return;
            processedNodes.add(nodeId);

            // Create ReactFlow node
            reactFlowNodes.push({
                id: nodeId,
                type: 'logNode',
                position: { x, y },
                data: {
                    log: node.log,
                    onExpand: (type: 'children' | 'siblings') => handleExpand(node, type),
                    onSelect: (log: LogEntry) => setSelectedLog(log),
                    canExpandChildren: node.canLoadMoreChildren,
                    canExpandSiblings: node.canLoadMoreSiblings,
                    isLoading: node.isLoading,
                },
            });

            // Position children and create edges
            if (node.children.length > 0) {
                const childrenWidth = (node.children.length - 1) * HORIZONTAL_SPACING;
                const startX = x - childrenWidth / 2;

                node.children.forEach((child, index) => {
                    const childX = startX + index * HORIZONTAL_SPACING;
                    const childY = y + VERTICAL_SPACING;
                    const childNodeId = getNodeId(child.log);

                    // Create edge from parent to child
                    const timeDelta = calculateTimeDelta(node.log.timestamp, child.log.timestamp);
                    const edgeId = `edge-${nodeId}-to-${childNodeId}`;

                    reactFlowEdges.push({
                        id: edgeId,
                        source: nodeId,
                        target: childNodeId,
                        type: 'smoothstep',
                        animated: false,
                        label: timeDelta,
                        labelStyle: { fontSize: '10px', fill: '#666' },
                        style: { stroke: '#999', strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            width: 20,
                            height: 20,
                            color: '#999',
                        },
                    });

                    positionNode(child, childX, childY, depth + 1);
                });
            }
        };

        // Position root nodes
        if (rootNodes.length > 0) {
            const rootWidth = (rootNodes.length - 1) * HORIZONTAL_SPACING;
            const rootStartX = -rootWidth / 2;

            rootNodes.forEach((node, index) => {
                const x = rootStartX + index * HORIZONTAL_SPACING;
                positionNode(node, x, 50, 0);
            });
        }

        return { nodes: reactFlowNodes, edges: reactFlowEdges };
    };

    const buildGraphFromLogs = (logs: LogEntry[]): Map<string, GraphNode> => {
        const nodeMap = new Map<string, GraphNode>();
        const logById = new Map<string, LogEntry>();

        // First, create a lookup map of all logs
        const indexLogs = (logs: LogEntry[]) => {
            logs.forEach(log => {
                if (log.id) {
                    logById.set(log.id, log);
                    if (log.children && log.children.length > 0) {
                        indexLogs(log.children);
                    }
                }
            });
        };
        indexLogs(logs);

        // Create nodes and establish parent-child relationships
        const createNodesRecursively = (logs: LogEntry[], parent: GraphNode | null = null) => {
            logs.forEach(log => {
                if (!log.id) {
                    console.warn('Log entry missing ID:', log);
                    return;
                }

                const nodeId = getNodeId(log);

                if (!nodeMap.has(nodeId)) {
                    const graphNode = createGraphNode(log, parent);
                    nodeMap.set(nodeId, graphNode);

                    if (parent && parent.id !== nodeId) {
                        parent.children.push(graphNode);
                    }

                    if (log.children && log.children.length > 0) {
                        createNodesRecursively(log.children, graphNode);
                    }
                }
            });
        };

        createNodesRecursively(logs);
        return nodeMap;
    };

    const handleExpand = async (node: GraphNode, type: 'children' | 'siblings') => {
        if (node.isLoading) return;

        // Set loading state
        setGraphNodes(prev => {
            const updated = new Map(prev);
            const nodeToUpdate = updated.get(getNodeId(node.log));
            if (nodeToUpdate) {
                nodeToUpdate.isLoading = true;
            }
            return updated;
        });

        try {
            if (type === 'children') {
                const childLogs = await getLogsByBlockId(
                    blockId,
                    maxDepth,
                    maxChildren,
                    node.log.childrenCursor
                );

                if (childLogs.length > 0) {
                    // Add new children to the graph
                    setGraphNodes(prev => {
                        const updatedNodes = new Map(prev);
                        const parentNodeId = getNodeId(node.log);
                        const parentNode = updatedNodes.get(parentNodeId);

                        if (parentNode) {
                            childLogs.forEach(log => {
                                if (log.id) {
                                    const childNodeId = getNodeId(log);
                                    if (!updatedNodes.has(childNodeId)) {
                                        const childNode = createGraphNode(log, parentNode);
                                        updatedNodes.set(childNodeId, childNode);
                                        parentNode.children.push(childNode);

                                        // Recursively add grandchildren
                                        if (log.children) {
                                            const addChildrenRecursively = (children: LogEntry[], parent: GraphNode) => {
                                                children.forEach(childLog => {
                                                    if (childLog.id) {
                                                        const grandChildNodeId = getNodeId(childLog);
                                                        if (!updatedNodes.has(grandChildNodeId)) {
                                                            const grandChild = createGraphNode(childLog, parent);
                                                            updatedNodes.set(grandChildNodeId, grandChild);
                                                            parent.children.push(grandChild);

                                                            if (childLog.children) {
                                                                addChildrenRecursively(childLog.children, grandChild);
                                                            }
                                                        }
                                                    }
                                                });
                                            };
                                            addChildrenRecursively(log.children, childNode);
                                        }
                                    }
                                }
                            });

                            parentNode.expanded = true;
                            parentNode.canLoadMoreChildren = childLogs.length === maxChildren;
                            parentNode.isLoading = false;
                        }

                        return updatedNodes;
                    });
                }
            } else if (type === 'siblings') {
                // Implement sibling expansion logic here
                console.log('Expanding siblings for', node.id);

                // Remove loading state even if not implemented
                setGraphNodes(prev => {
                    const updated = new Map(prev);
                    const nodeToUpdate = updated.get(getNodeId(node.log));
                    if (nodeToUpdate) {
                        nodeToUpdate.isLoading = false;
                    }
                    return updated;
                });
            }
        } catch (err) {
            console.error(`Failed to expand ${type}:`, err);
            // Remove loading state on error
            setGraphNodes(prev => {
                const updated = new Map(prev);
                const nodeToUpdate = updated.get(getNodeId(node.log));
                if (nodeToUpdate) {
                    nodeToUpdate.isLoading = false;
                }
                return updated;
            });
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const logs = await getLogsByBlockId(blockId, maxDepth, maxChildren);
            const graphNodeMap = buildGraphFromLogs(logs);
            setGraphNodes(graphNodeMap);
        } catch (err: any) {
            setError(err.message || "Failed to load logs");
        } finally {
            setLoading(false);
        }
    };

    // Update ReactFlow nodes and edges when graphNodes change
    useEffect(() => {
        if (graphNodes.size > 0) {
            const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges(graphNodes);

            if (newNodes.length > 0) {
                console.log('Setting nodes:', newNodes.map(n => ({ id: n.id, type: n.type })));
                console.log('Setting edges:', newEdges.map(e => ({ id: e.id, source: e.source, target: e.target })));

                setNodes(newNodes);
                setEdges(newEdges);
            }
        }
    }, [graphNodes, setNodes, setEdges]);

    useEffect(() => {
        fetchLogs();
    }, [blockId]);

    const onConnect = useCallback((params: Edge | Connection) => {
        // Validate connection before adding
        if (params.source && params.target && params.source !== params.target) {
            setEdges((eds) => addEdge(params, eds));
        }
    }, [setEdges]);

    if (loading) {
        return (
            <div className="logs-page">
                <div className="logs-header"
                     style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button className="btn btn-outline" onClick={goBack}>← Back to Operations</button>
                    <h2>ReactFlow Graph - Block {blockId}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                    <div>Loading graph...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="logs-page">
                <div className="logs-header"
                     style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button className="btn btn-outline" onClick={goBack}>← Back to Operations</button>
                    <h2>ReactFlow Graph - Block {blockId}</h2>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '400px',
                    gap: '16px'
                }}>
                    <span>⚠️ {error}</span>
                    <button className="btn btn-outline" onClick={fetchLogs}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="logs-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="logs-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border)',
                background: 'white'
            }}>
                <button className="btn btn-outline" onClick={goBack}>← Back to Operations</button>
                <h2 style={{ margin: 0 }}>ReactFlow Graph - Block {blockId}</h2>
            </div>

            <div style={{ display: 'flex', flex: 1 }}>
                <div style={{ flex: selectedLog ? '0 0 70%' : '1', height: '100%' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant="dots" gap={12} size={1} />
                    </ReactFlow>
                </div>

                {selectedLog && (
                    <div style={{
                        flex: '0 0 30%',
                        background: 'white',
                        borderLeft: '1px solid var(--color-border)',
                        padding: '24px',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ margin: 0 }}>Log Details</h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="detail-section" style={{ marginBottom: '16px' }}>
                            <strong>ID:</strong> {selectedLog.id}
                        </div>
                        <div className="detail-section" style={{ marginBottom: '16px' }}>
                            <strong>Parent ID:</strong> {selectedLog.parentLogId || 'ROOT'}
                        </div>
                        <div className="detail-section" style={{ marginBottom: '16px' }}>
                            <strong>Type:</strong>
                            <span style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: 'white',
                                background: (() => {
                                    switch (selectedLog.logType.toLowerCase()) {
                                        case 'error':
                                            return '#dc2626';
                                        case 'warning':
                                            return '#d97706';
                                        case 'debug':
                                            return '#7c3aed';
                                        case 'info':
                                            return '#2563eb';
                                        default:
                                            return '#059669';
                                    }
                                })()
                            }}>
                                {selectedLog.logType}
                            </span>
                        </div>
                        <div className="detail-section" style={{ marginBottom: '16px' }}>
                            <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
                        </div>
                        <div className="detail-section" style={{ marginBottom: '16px' }}>
                            <strong>Message:</strong>
                            <div style={{
                                marginTop: '4px',
                                padding: '8px',
                                background: '#f8fafc',
                                borderRadius: '4px',
                                wordBreak: 'break-word'
                            }}>
                                {selectedLog.message || <em>No message</em>}
                            </div>
                        </div>

                        {selectedLog.referencedBlock && (
                            <div className="detail-section">
                                <strong>Referenced Block:</strong>
                                <div style={{ marginTop: '8px' }}>
                                    <div style={{
                                        background: 'white',
                                        border: '1px solid var(--color-border)',
                                        padding: '16px',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                                            {selectedLog.referencedBlock.name}
                                        </div>
                                        <div>
                                            <strong>ID:</strong> {selectedLog.referencedBlock.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}