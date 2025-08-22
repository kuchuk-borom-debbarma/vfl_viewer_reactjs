import React, { useState } from "react";
import { Block } from "../types";
import { useBlocks } from "../hooks/useBlocks";
import { LogsViewer } from "./LogsViewer";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { LoadingButton } from "../components/UI/LoadingButton";
import { formatDuration, getTrimmedId } from "../utils";

interface OperationsProps {
    goBack: () => void;
}

export const Operations: React.FC<OperationsProps> = ({ goBack }) => {
    const { items: blocks, loading, error, loadMore } = useBlocks();
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

    const handleNavigateToBlock = (block: Block) => {
        setSelectedBlock(block);
    };

    if (selectedBlock) {
        return (
            <LogsViewer
                block={selectedBlock}
                goBack={() => setSelectedBlock(null)}
                onNavigateToBlock={handleNavigateToBlock}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={goBack} className="text-gray-600">
                            ← Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Operations</h1>
                            <div className="text-sm text-gray-500">
                                {blocks.length > 0 ? `${blocks.length} operations found` : 'Loading operations...'}
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
                            🔄
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
                                    key={block.id}
                                    block={block}
                                    onClick={() => setSelectedBlock(block)}
                                />
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <LoadingButton
                                onClick={loadMore}
                                loading={loading}
                                hasMore={true}
                                label="Load More Operations"
                                variant="outline"
                                size="md"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const BlockCard: React.FC<{ block: Block; onClick: () => void }> = ({
                                                                        block,
                                                                        onClick
                                                                    }) => {
    const isOngoing = !block.endTime;

    return (
        <Card
            interactive
            onClick={onClick}
            className="hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                        {block.name}
                    </h3>
                    <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                        {getTrimmedId(block.id)}
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ml-3 ${
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
        </Card>
    );
};
