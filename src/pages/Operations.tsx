import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Block } from "../types";
import { useBlocks } from "../hooks/useBlocks";
import { deleteBlocksById } from "../api/vfl";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { DebugPanel } from "../components/debug/DebugPanelComponent";
import { formatDuration, getTrimmedId } from "../utils";

export const Operations: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cursor = searchParams.get('cursor') || undefined;
    const [refreshKey, setRefreshKey] = useState(0);
    const [deletingBlocks, setDeletingBlocks] = useState<Set<string>>(new Set());

    const { items: blocks, loading, error, hasMore, nextCursor } = useBlocks(cursor);

    const handleNavigateToBlock = (block: Block) => {
        navigate(`/logs/${block.id}`);
    };

    const handleNext = () => {
        if (nextCursor) {
            navigate(`/operations?cursor=${encodeURIComponent(nextCursor)}`);
        }
    };

    const handlePrevious = () => {
        navigate(-1);
    };

    const handleGoBack = () => {
        navigate('/');
    };

    const handleDeleteBlock = async (blockId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent navigation when clicking delete

        if (!confirm("Are you sure you want to delete this operation? This action cannot be undone.")) {
            return;
        }

        setDeletingBlocks(prev => new Set([...prev, blockId]));

        try {
            await deleteBlocksById([blockId]);
            // Force refresh by incrementing refresh key
            setRefreshKey(prev => prev + 1);
        } catch (error: any) {
            console.error('Failed to delete block:', error);
            alert(`Failed to delete operation: ${error.message}`);
        } finally {
            setDeletingBlocks(prev => {
                const newSet = new Set(prev);
                newSet.delete(blockId);
                return newSet;
            });
        }
    };

    const handleDataPurged = () => {
        setRefreshKey(prev => prev + 1);
        navigate('/operations');
    };

    const canGoBack = cursor && window.history.length > 1;

    useEffect(() => {
        // This effect will run when refreshKey changes, causing useBlocks to re-fetch
    }, [refreshKey]);

    return (
        <div className="min-h-screen bg-gray-50 relative">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={handleGoBack} className="text-gray-600">
                            ← Back to Home
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Operations</h1>
                            <div className="text-sm text-gray-500">
                                {blocks.length > 0 ? `${blocks.length} operations found` : 'Loading operations...'}
                                {cursor && <span className="ml-2 text-blue-600">• Page {cursor.slice(-8)}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {error ? (
                    <div className="text-center py-20">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-xl mx-auto mb-4">
                                ⚠
                            </div>
                            <div className="text-lg font-semibold text-red-700 mb-2">Error Loading Operations</div>
                            <div className="text-red-600 text-sm">{error}</div>
                        </div>
                    </div>
                ) : blocks.length === 0 && loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center text-xl mx-auto mb-4 animate-pulse">
                            📄
                        </div>
                        <div className="text-lg font-medium text-gray-700 mb-2">Loading operations...</div>
                        <div className="text-sm text-gray-500">Fetching execution blocks</div>
                    </div>
                ) : blocks.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center text-xl mx-auto mb-4">
                            📋
                        </div>
                        <div className="text-lg font-medium text-gray-700 mb-2">No operations found</div>
                        <div className="text-sm text-gray-500">No execution blocks are available yet</div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {blocks.map(block => (
                                <BlockCard
                                    key={`${refreshKey}-${block.id}`} // Include refreshKey to force re-render after delete
                                    block={block}
                                    isDeleting={deletingBlocks.has(block.id)}
                                    onClick={() => handleNavigateToBlock(block)}
                                    onDelete={(e) => handleDeleteBlock(block.id, e)}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-4 mt-12">
                            {canGoBack && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    className="flex items-center gap-2"
                                >
                                    ← Previous
                                </Button>
                            )}

                            {hasMore && (
                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    {loading ? 'Loading...' : 'Next →'}
                                </Button>
                            )}

                            {cursor && (
                                <div className="text-xs text-gray-500 ml-4">
                                    Use browser back/forward to navigate between pages
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Debug Panel - Only appears in development */}
            <DebugPanel onDataPurged={handleDataPurged} />
        </div>
    );
};

const BlockCard: React.FC<{
    block: Block;
    isDeleting: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}> = ({ block, isDeleting, onClick, onDelete }) => {
    const isOngoing = !block.endTime;

    return (
        <Card
            interactive
            onClick={onClick}
            className="hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full relative group"
        >
            {/* Delete Button - appears on hover */}
            <button
                onClick={onDelete}
                disabled={isDeleting}
                className="absolute top-3 right-3 w-8 h-8 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed z-10"
                title="Delete operation"
            >
                {isDeleting ? '⋯' : '×'}
            </button>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 pr-10">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                        {block.name}
                    </h3>
                    <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                        {getTrimmedId(block.id)}
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                    isOngoing
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                    {isOngoing ? 'Running' : 'Complete'}
                </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Started</span>
                    <span className="text-gray-800 text-xs">
                        {new Date(block.startTime).toLocaleString()}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Duration</span>
                    <span className="text-gray-800 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {formatDuration(block.startTime, block.endTime)}
                    </span>
                </div>

                {block.endTime && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Ended</span>
                        <span className="text-gray-800 text-xs">
                            {new Date(block.endTime).toLocaleString()}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Created</span>
                    <span className="text-gray-800 text-xs">
                        {new Date(block.createdAt).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* End Message */}
            {block.endMessage && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-medium text-blue-700 mb-1">End Message</div>
                    <div className="text-xs text-blue-800 leading-relaxed">
                        {block.endMessage.length > 100
                            ? `${block.endMessage.slice(0, 100)}...`
                            : block.endMessage
                        }
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    Click to explore execution flow
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    →
                </div>
            </div>

            {/* Deleting overlay */}
            {isDeleting && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg mb-2">⋯</div>
                        <div className="text-sm text-gray-600">Deleting...</div>
                    </div>
                </div>
            )}
        </Card>
    );
};