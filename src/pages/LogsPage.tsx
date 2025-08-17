import React, {useEffect, useState} from 'react';
import {Background, Controls, ReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import LogNode from '../components/LogNode';
import {getLogsByBlockId} from '../api/vfl';
import {createFlowFromLogEntries, FlowEdge, FlowNode} from "./helpers/LogsPageHelper";

const maxChildren = 2;
const maxDepth = 2;

export default function LogsPage({blockId, goBack}: { blockId: string; goBack: () => void }) {
    const [nodes, setNodes] = useState<FlowNode[]>([]);
    const [edges, setEdges] = useState<FlowEdge[]>([]);
    const [loading, setLoading] = useState(true);

    const nodeTypes = {logNode: LogNode};

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getLogsByBlockId(blockId, maxDepth, maxChildren);
                console.debug("Fetched logs:", data);

                if (data && data.length > 0) {
                    const {nodes: generatedNodes, edges: generatedEdges} = createFlowFromLogEntries(data);
                    setNodes(generatedNodes);
                    setEdges(generatedEdges);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [blockId]);

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

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background/>
                <Controls/>
            </ReactFlow>
        </div>
    );
}
