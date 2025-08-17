import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";
import { getLogsByBlockId, LogEntry } from "../api/vfl";

interface GraphNode {
    id: string;
    log: LogEntry;
    x: number;
    y: number;
    fx?: number | null;
    fy?: number | null;
    children: GraphNode[];
    parent: GraphNode | null;
    expanded: boolean;
    loadingChildren: boolean;
    loadingSiblings: boolean;
    canLoadMoreChildren: boolean;
    canLoadMoreSiblings: boolean;
    detailsVisible: boolean;
    originalX: number; // Store original calculated position
    originalY: number;
    depth: number; // Track depth level
}

interface GraphLink {
    source: GraphNode;
    target: GraphNode;
    timeDelta: string;
}

export default function GraphLogsPage({
                                          blockId,
                                          goBack,
                                      }: {
    blockId: string;
    goBack: () => void;
}) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const simulationRef = useRef<d3.Simulation<GraphNode, undefined> | null>(null);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

    const maxDepth = 3;
    const maxChildren = 5;

    // Layout constants
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 80;
    const HORIZONTAL_SPACING = 280;
    const VERTICAL_SPACING = 150;
    const DRAG_BOUNDARY = 150; // How far nodes can be dragged from original position

    const calculateTimeDelta = (parentTime: number, childTime: number): string => {
        const delta = childTime - parentTime;
        if (delta < 0) return "undefined";
        if (delta < 1000) return `${delta}ms`;
        if (delta < 60000) return `${(delta / 1000).toFixed(1)}s`;
        return `${(delta / 60000).toFixed(1)}m`;
    };

    const createGraphNode = (log: LogEntry, parent: GraphNode | null = null): GraphNode => {
        return {
            id: log.id,
            log,
            x: 0,
            y: 0,
            fx: null,
            fy: null,
            children: [],
            parent,
            expanded: false,
            loadingChildren: false,
            loadingSiblings: false,
            canLoadMoreChildren: !!log.childrenCursor || (log.children && log.children.length > 0),
            canLoadMoreSiblings: true,
            detailsVisible: false,
            originalX: 0,
            originalY: 0,
            depth: parent ? parent.depth + 1 : 0,
        };
    };

    const calculateNodePositions = (rootNodes: GraphNode[]): void => {
        const START_Y = 100;

        // Sort root nodes by timestamp
        rootNodes.sort((a, b) => a.log.timestamp - b.log.timestamp);

        // Position root nodes horizontally
        const totalRootWidth = (rootNodes.length - 1) * HORIZONTAL_SPACING;
        const startX = -totalRootWidth / 2;

        rootNodes.forEach((node, index) => {
            node.x = node.originalX = startX + index * HORIZONTAL_SPACING;
            node.y = node.originalY = START_Y;
            node.depth = 0;

            // Position children recursively
            positionChildren(node, node.x, node.y + VERTICAL_SPACING, 1);
        });
    };

    const positionChildren = (parentNode: GraphNode, baseX: number, y: number, depth: number): void => {
        if (parentNode.children.length === 0) return;

        // Sort children by timestamp
        parentNode.children.sort((a, b) => a.log.timestamp - b.log.timestamp);

        const totalChildWidth = (parentNode.children.length - 1) * HORIZONTAL_SPACING;
        const startX = baseX - totalChildWidth / 2;

        parentNode.children.forEach((child, index) => {
            child.x = child.originalX = startX + index * HORIZONTAL_SPACING;
            child.y = child.originalY = y;
            child.depth = depth;

            // Recursively position grandchildren
            positionChildren(child, child.x, child.y + VERTICAL_SPACING, depth + 1);
        });
    };

    const buildGraphFromLogs = (logs: LogEntry[]): { nodes: GraphNode[], links: GraphLink[] } => {
        const nodeMap = new Map<string, GraphNode>();
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];

        // Create root nodes first
        const rootNodes: GraphNode[] = [];
        logs.forEach(log => {
            const node = createGraphNode(log);
            nodeMap.set(log.id, node);
            nodes.push(node);
            rootNodes.push(node);
        });

        // Build tree structure and links
        const processNode = (parentNode: GraphNode, childLogs: LogEntry[]): void => {
            childLogs.forEach(childLog => {
                let childNode = nodeMap.get(childLog.id);
                if (!childNode) {
                    childNode = createGraphNode(childLog, parentNode);
                    nodeMap.set(childLog.id, childNode);
                    nodes.push(childNode);
                }

                parentNode.children.push(childNode);
                childNode.parent = parentNode;

                // Create link with time delta
                const timeDelta = calculateTimeDelta(parentNode.log.timestamp, childNode.log.timestamp);
                links.push({
                    source: parentNode,
                    target: childNode,
                    timeDelta
                });

                // Process grandchildren if they exist
                if (childLog.children && childLog.children.length > 0) {
                    processNode(childNode, childLog.children);
                }
            });
        };

        // Process children for all nodes
        logs.forEach(log => {
            if (log.children && log.children.length > 0) {
                const parentNode = nodeMap.get(log.id)!;
                processNode(parentNode, log.children);
            }
        });

        // Calculate positions
        calculateNodePositions(rootNodes);

        return { nodes, links };
    };

    const initializeForceSimulation = useCallback((nodes: GraphNode[]) => {
        if (simulationRef.current) {
            simulationRef.current.stop();
        }

        simulationRef.current = d3.forceSimulation(nodes)
            .force("collision", d3.forceCollide<GraphNode>()
                .radius(NODE_WIDTH / 2 + 20)
                .strength(0.8)
            )
            .force("charge", d3.forceManyBody<GraphNode>()
                .strength(-300)
                .distanceMin(NODE_WIDTH)
                .distanceMax(NODE_WIDTH * 2)
            )
            .force("center", d3.forceCenter(0, 0).strength(0.1))
            .force("boundary", () => {
                // Custom force to keep nodes within boundary of their original position
                nodes.forEach(node => {
                    if (node.fx !== null && node.fy !== null) return; // Skip if being dragged

                    const dx = node.x - node.originalX;
                    const dy = node.y - node.originalY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > DRAG_BOUNDARY) {
                        const factor = DRAG_BOUNDARY / distance;
                        node.x = node.originalX + dx * factor;
                        node.y = node.originalY + dy * factor;
                    }
                });
            })
            .alphaDecay(0.02)
            .velocityDecay(0.8)
            .on("tick", () => {
                updateVisualization();
            });

        return simulationRef.current;
    }, []);

    const updateVisualization = () => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);

        // Update node positions
        svg.selectAll(".node")
            .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

        // Update link positions in real-time
        svg.selectAll(".link-line")
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y + NODE_HEIGHT / 2)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y - NODE_HEIGHT / 2);

        // Update link labels
        svg.selectAll(".link-label")
            .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
            .attr("y", (d: any) => (d.source.y + d.target.y) / 2);
    };

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const logs = await getLogsByBlockId(blockId, maxDepth, maxChildren);
            const { nodes: graphNodes, links: graphLinks } = buildGraphFromLogs(logs);
            setNodes(graphNodes);
            setLinks(graphLinks);
        } catch (err: any) {
            setError(err.message || "Failed to load logs");
        } finally {
            setLoading(false);
        }
    };

    const expandChildren = async (node: GraphNode) => {
        if (node.loadingChildren) return;

        // Update node to show loading state
        setNodes(prev => prev.map(n =>
            n.id === node.id ? { ...n, loadingChildren: true } : n
        ));

        try {
            const childLogs = await getLogsByBlockId(
                blockId,
                maxDepth,
                maxChildren,
                node.log.childrenCursor
            );

            if (childLogs.length > 0) {
                const newNodes: GraphNode[] = [];
                const newLinks: GraphLink[] = [];

                childLogs.forEach((log, index) => {
                    const childNode = createGraphNode(log, node);

                    // Position new children relative to parent
                    const siblingSpacing = HORIZONTAL_SPACING;
                    const totalWidth = (childLogs.length - 1) * siblingSpacing;
                    const startX = node.x - totalWidth / 2;

                    childNode.x = childNode.originalX = startX + index * siblingSpacing;
                    childNode.y = childNode.originalY = node.y + VERTICAL_SPACING;
                    childNode.depth = node.depth + 1;

                    newNodes.push(childNode);

                    const timeDelta = calculateTimeDelta(node.log.timestamp, log.timestamp);
                    newLinks.push({
                        source: node,
                        target: childNode,
                        timeDelta
                    });
                });

                // Update state with new nodes and links
                setNodes(prev => {
                    const updatedNodes = prev.map(n =>
                        n.id === node.id
                            ? { ...n, loadingChildren: false, expanded: true, children: [...n.children, ...newNodes] }
                            : n
                    );
                    const allNodes = [...updatedNodes, ...newNodes];

                    // Reinitialize force simulation with new nodes
                    setTimeout(() => {
                        initializeForceSimulation(allNodes);
                    }, 0);

                    return allNodes;
                });

                setLinks(prev => [...prev, ...newLinks]);
            }
        } catch (err) {
            console.error("Failed to expand children:", err);
        }

        // Remove loading state
        setNodes(prev => prev.map(n =>
            n.id === node.id ? { ...n, loadingChildren: false } : n
        ));
    };

    const expandSiblings = async (node: GraphNode) => {
        if (node.loadingSiblings) return;

        setNodes(prev => prev.map(n =>
            n.id === node.id ? { ...n, loadingSiblings: true } : n
        ));

        try {
            // Simulate loading for now
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error("Failed to expand siblings:", err);
        }

        setNodes(prev => prev.map(n =>
            n.id === node.id ? { ...n, loadingSiblings: false } : n
        ));
    };

    const initializeGraph = useCallback(() => {
        if (!svgRef.current || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        const container = d3.select(containerRef.current);
        const width = container.node()?.getBoundingClientRect().width || 800;
        const height = container.node()?.getBoundingClientRect().height || 600;

        svg.selectAll("*").remove();

        const g = svg.append("g");

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Define arrow markers
        svg.append("defs").selectAll("marker")
            .data(["end"])
            .enter().append("marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#666");

        // Create links
        const linkGroup = g.append("g").attr("class", "links");

        const link = linkGroup.selectAll("g")
            .data(links)
            .enter().append("g");

        link.append("line")
            .attr("class", "link-line")
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#end)")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y + NODE_HEIGHT / 2)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y - NODE_HEIGHT / 2);

        // Add time delta labels on links
        link.append("text")
            .attr("class", "link-label")
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "#666")
            .attr("font-size", "11px")
            .attr("font-family", "monospace")
            .attr("background", "white")
            .text(d => d.timeDelta);

        // Create nodes
        const nodeGroup = g.append("g").attr("class", "nodes");

        const node = nodeGroup.selectAll("g")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .call(d3.drag<SVGGElement, GraphNode>()
                .on("start", (event, d) => {
                    if (!event.active && simulationRef.current) {
                        simulationRef.current.alphaTarget(0.3).restart();
                    }
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    // Constrain dragging within boundary
                    const dx = event.x - d.originalX;
                    const dy = event.y - d.originalY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance <= DRAG_BOUNDARY) {
                        d.fx = event.x;
                        d.fy = event.y;
                    } else {
                        const factor = DRAG_BOUNDARY / distance;
                        d.fx = d.originalX + dx * factor;
                        d.fy = d.originalY + dy * factor;
                    }
                })
                .on("end", (event, d) => {
                    if (!event.active && simulationRef.current) {
                        simulationRef.current.alphaTarget(0);
                    }
                    // Keep the node at its dragged position
                    // Don't set fx/fy to null so it stays put
                })
            );

        // Node rectangles
        node.append("rect")
            .attr("width", NODE_WIDTH)
            .attr("height", NODE_HEIGHT)
            .attr("x", -NODE_WIDTH / 2)
            .attr("y", -NODE_HEIGHT / 2)
            .attr("rx", 8)
            .attr("fill", "#ffffff")
            .attr("stroke", d => {
                switch(d.log.logType.toLowerCase()) {
                    case 'error': return '#dc2626';
                    case 'warning': return '#d97706';
                    case 'debug': return '#7c3aed';
                    case 'info': return '#2563eb';
                    default: return '#059669';
                }
            })
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                setSelectedNode(selectedNode?.id === d.id ? null : d);
            });

        // Node content
        const nodeContent = node.append("g").attr("class", "node-content");

        // Log type
        nodeContent.append("text")
            .attr("x", 0)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("fill", d => {
                switch(d.log.logType.toLowerCase()) {
                    case 'error': return '#dc2626';
                    case 'warning': return '#d97706';
                    case 'debug': return '#7c3aed';
                    case 'info': return '#2563eb';
                    default: return '#059669';
                }
            })
            .attr("font-weight", "bold")
            .attr("font-size", "12px")
            .text(d => d.log.logType);

        // Trimmed ID
        nodeContent.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("fill", "#666")
            .attr("font-size", "10px")
            .attr("font-family", "monospace")
            .text(d => `${d.log.id.substring(0, 8)}...`);

        // Message (truncated)
        nodeContent.append("text")
            .attr("x", 0)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("fill", "#333")
            .attr("font-size", "10px")
            .text(d => {
                const msg = d.log.message || "No message";
                return msg.length > 25 ? msg.substring(0, 22) + "..." : msg;
            });

        // Timestamp
        nodeContent.append("text")
            .attr("x", 0)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("fill", "#888")
            .attr("font-size", "9px")
            .text(d => {
                const date = new Date(d.log.timestamp);
                return date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            });

        // Expand buttons
        const expandGroup = node.append("g").attr("class", "expand-controls");

        // Children expand button (bottom right)
        expandGroup.append("circle")
            .attr("cx", NODE_WIDTH / 2 - 15)
            .attr("cy", NODE_HEIGHT / 2 - 15)
            .attr("r", 12)
            .attr("fill", d => d.canLoadMoreChildren ? "#2563eb" : "#e5e7eb")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", d => d.canLoadMoreChildren ? "pointer" : "default")
            .on("click", (event, d) => {
                event.stopPropagation();
                if (d.canLoadMoreChildren && !d.loadingChildren) {
                    expandChildren(d);
                }
            });

        expandGroup.append("text")
            .attr("x", NODE_WIDTH / 2 - 15)
            .attr("y", NODE_HEIGHT / 2 - 11)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .style("pointer-events", "none")
            .text(d => d.loadingChildren ? "⏳" : "↓");

        // Siblings expand button (top right)
        expandGroup.append("circle")
            .attr("cx", NODE_WIDTH / 2 - 15)
            .attr("cy", -NODE_HEIGHT / 2 + 15)
            .attr("r", 12)
            .attr("fill", d => d.canLoadMoreSiblings ? "#16a34a" : "#e5e7eb")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", d => d.canLoadMoreSiblings ? "pointer" : "default")
            .on("click", (event, d) => {
                event.stopPropagation();
                if (d.canLoadMoreSiblings && !d.loadingSiblings) {
                    expandSiblings(d);
                }
            });

        expandGroup.append("text")
            .attr("x", NODE_WIDTH / 2 - 15)
            .attr("y", -NODE_HEIGHT / 2 + 19)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .style("pointer-events", "none")
            .text(d => d.loadingSiblings ? "⏳" : "→");

        // Initialize force simulation
        initializeForceSimulation(nodes);

        // Center the initial view
        const bbox = nodeGroup.node()?.getBBox();
        if (bbox) {
            const centerX = width / 2 - bbox.x - bbox.width / 2;
            const centerY = 50;
            const initialTransform = d3.zoomIdentity.translate(centerX, centerY).scale(0.8);
            svg.call(zoom.transform, initialTransform);
        }

    }, [nodes, links, selectedNode, initializeForceSimulation]);

    useEffect(() => {
        fetchLogs();
    }, [blockId]);

    useEffect(() => {
        initializeGraph();

        const handleResize = () => {
            initializeGraph();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, [initializeGraph]);

    // Cleanup simulation on unmount
    useEffect(() => {
        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, []);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="logs-page">
            <div className="logs-header">
                <button className="btn btn-outline" onClick={goBack}>
                    ← Back to Operations
                </button>
                <h2 className="logs-title">Graph View - Block {blockId}</h2>
            </div>

            {loading && (
                <div className="logs-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading graph...</span>
                </div>
            )}

            {error && (
                <div className="logs-error">
                    <span>⚠️ {error}</span>
                    <button className="btn btn-outline" onClick={fetchLogs}>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className="graph-container" style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
                    <div
                        ref={containerRef}
                        className="graph-viewport"
                        style={{ flex: selectedNode ? '0 0 70%' : '1', position: 'relative' }}
                    >
                        <svg
                            ref={svgRef}
                            width="100%"
                            height="100%"
                            style={{ background: '#fafafa', border: '1px solid var(--color-border)' }}
                        />
                        <div className="graph-controls" style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            background: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            color: '#666'
                        }}>
                            <div>🖱️ Drag to pan • 🔍 Scroll to zoom</div>
                            <div>Drag nodes within boundary • Click for details</div>
                        </div>
                    </div>

                    {selectedNode && (
                        <div className="node-details" style={{
                            flex: '0 0 30%',
                            background: 'white',
                            borderLeft: '1px solid var(--color-border)',
                            padding: 'var(--space-lg)',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                <h3 style={{ margin: 0 }}>Log Details</h3>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="detail-section" style={{ marginBottom: 'var(--space-md)' }}>
                                <strong>ID:</strong> {selectedNode.log.id}
                            </div>
                            <div className="detail-section" style={{ marginBottom: 'var(--space-md)' }}>
                                <strong>Type:</strong>
                                <span className={`log-type-${selectedNode.log.logType.toLowerCase()}`} style={{ marginLeft: '8px' }}>
                                    {selectedNode.log.logType}
                                </span>
                            </div>
                            <div className="detail-section" style={{ marginBottom: 'var(--space-md)' }}>
                                <strong>Timestamp:</strong> {formatTime(selectedNode.log.timestamp)}
                            </div>
                            <div className="detail-section" style={{ marginBottom: 'var(--space-md)' }}>
                                <strong>Message:</strong>
                                <div style={{
                                    marginTop: '4px',
                                    padding: '8px',
                                    background: '#f8fafc',
                                    borderRadius: '4px',
                                    wordBreak: 'break-word'
                                }}>
                                    {selectedNode.log.message || <em>No message</em>}
                                </div>
                            </div>

                            {selectedNode.log.referencedBlock && (
                                <div className="detail-section">
                                    <strong>Referenced Block:</strong>
                                    <div style={{ marginTop: '8px' }}>
                                        <div className="card" style={{ textAlign: 'left', margin: 0 }}>
                                            <div className="card-title" style={{ fontSize: '14px' }}>
                                                {selectedNode.log.referencedBlock.name}
                                            </div>
                                            <div className="card-desc">
                                                <div><strong>ID:</strong> {selectedNode.log.referencedBlock.id}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}