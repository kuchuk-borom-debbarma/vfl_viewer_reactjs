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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Button variant="outline" className="mb-6" onClick={goBack}>
                    ← Back
                </Button>

                <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Active Operations
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]">
                    {error ? (
                        <div className="col-span-full text-center text-red-500 p-8 bg-red-50 rounded-xl border border-red-200">
                            <div className="text-lg font-semibold mb-2">⚠️ Error Loading Operations</div>
                            <div>{error}</div>
                        </div>
                    ) : blocks.length === 0 && loading ? (
                        <div className="col-span-full text-center text-gray-500 p-12">
                            <div className="text-2xl mb-4">🔄</div>
                            <div className="text-lg">Loading operations...</div>
                        </div>
                    ) : (
                        blocks.map(block => (
                            <BlockCard
                                key={block.id}
                                block={block}
                                onClick={() => setSelectedBlock(block)}
                            />
                        ))
                    )}
                </div>

                <div className="text-center mt-12">
                    <LoadingButton
                        onClick={loadMore}
                        loading={loading}
                        hasMore={true}
                        label="Load More Operations"
                        variant="outline"
                    />
                </div>
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
            className="hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {block.name}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isOngoing
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                    {isOngoing ? '🔄 Running' : '✅ Complete'}
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
                    <span className="text-gray-500 font-medium">🆔 ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {getTrimmedId(block.id)}
                    </span>

                    <span className="text-gray-500 font-medium">🚀 Started:</span>
                    <span className="text-gray-700">{new Date(block.startTime).toLocaleString()}</span>

                    <span className="text-gray-500 font-medium">🏁 Ended:</span>
                    <span className={isOngoing ? 'text-orange-600 font-semibold' : 'text-gray-700'}>
                        {isOngoing ? "⏳ Ongoing" : new Date(block.endTime!).toLocaleString()}
                    </span>

                    <span className="text-gray-500 font-medium">⏱️ Duration:</span>
                    <span className="text-blue-600 font-semibold">
                        {formatDuration(block.startTime, block.endTime)}
                    </span>

                    <span className="text-gray-500 font-medium">📅 Created:</span>
                    <span className="text-gray-700">{new Date(block.createdAt).toLocaleString()}</span>
                </div>

                {block.endMessage && (
                    <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                        <div className="font-semibold mb-1 text-blue-700 text-xs">
                            💬 End Message:
                        </div>
                        <div className="italic text-xs text-blue-800">"{block.endMessage}"</div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    Click to explore execution flow
                </div>
                <div className="text-blue-500 group-hover:text-blue-700 transition-colors">
                    →
                </div>
            </div>
        </Card>
    );
};