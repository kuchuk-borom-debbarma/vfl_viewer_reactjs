import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {RootBlock} from '../models/block';
import {BlockService} from '../services/blockService';
import {LoadingSpinner} from '../components/ui/LoadingSpinner';
import {EmptyState} from "../components/ui/EmptyState";
import {PageHeader} from "../components/ui/PageHeader";
import {Button} from "../components/ui/Button";

const BlocksPage: React.FC = () => {
    const navigate = useNavigate();
    const [state, setState] = useState({
        blocks: [] as RootBlock[],
        loading: true,
        error: null as string | null,
        cursor: null as string | null,
        hasMore: true,
    });

    const updateState = (updates: Partial<typeof state>) => setState(prev => ({...prev, ...updates}));

    const fetchBlocks = async (nextCursor?: string, append = false) => {
        try {
            updateState({loading: !append, error: null});
            const blocks = await BlockService.getRootBlocks({cursor: nextCursor, limit: 10});
            updateState({
                blocks: append ? [...state.blocks, ...blocks] : blocks,
                cursor: blocks.length > 0 ? blocks[blocks.length - 1].cursor : null,
                hasMore: blocks.length === 10,
                loading: false,
            });
        } catch (err) {
            updateState({error: err instanceof Error ? err.message : 'An error occurred', loading: false});
        }
    };

    useEffect(() => {
        fetchBlocks();
    }, []);

    const BlockCard: React.FC<{ block: RootBlock }> = ({block}) => (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold flex-1">{block.name}</h3>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">
          #{block.id.slice(0, 8)}
        </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
                {[
                    ['Duration', BlockService.formatDuration(block.startTime, block.endTime)],
                    ['Started', BlockService.formatDateTime(block.startTime)],
                ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                        <span className="text-gray-600">{label}:</span>
                        <span className="font-mono">{value}</span>
                    </div>
                ))}
            </div>

            {block.endMessage && (
                <div className="bg-gray-50 p-3 rounded mb-4 border">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">End Message:</span>
                    <p className="text-sm mt-1">{block.endMessage}</p>
                </div>
            )}

            <div className="flex gap-2">
                <Button
                    variant="primary"
                    onClick={() => navigate(`/logs?blockId=${block.id}`)}
                    className="flex-1 text-sm"
                >
                    View Logs 📋
                </Button>
            </div>
        </div>
    );

    if (state.loading && !state.blocks.length) return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader title="Visual Flow Blocks" backTo={{path: '/', label: 'Back to Home'}}/>
            <LoadingSpinner text="Loading blocks..."/>
        </div>
    );

    if (state.error && !state.blocks.length) return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader title="Visual Flow Blocks" backTo={{path: '/', label: 'Back to Home'}}/>
            <EmptyState
                icon="⚠️"
                title="Failed to Load Blocks"
                message={state.error}
                action={<Button variant="danger" onClick={() => fetchBlocks()}>Try Again</Button>}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="Visual Flow Blocks"
                backTo={{path: '/', label: 'Back to Home'}}
                actions={<Button onClick={() => fetchBlocks()} disabled={state.loading}>🔄 Refresh</Button>}
            />

            {!state.blocks.length ? (
                <EmptyState
                    icon="📭"
                    title="No Blocks Found"
                    message="No flow blocks have been created yet. Start logging with VFL to see them here."
                />
            ) : (
                <>
                    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {state.blocks.map(block => <BlockCard key={block.id} block={block}/>)}
                    </div>

                    {state.hasMore && (
                        <div className="flex justify-center p-6">
                            <Button onClick={() => state.cursor && fetchBlocks(state.cursor, true)}>
                                Load More Blocks
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BlocksPage;