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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container py-12">
                <Button variant="outline" className="mb-6" onClick={goBack}>
                    ← Back
                </Button>

                <h2 className="text-3xl font-semibold text-center mb-8">Operations</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
                    {error ? (
                        <div className="col-span-full text-center text-red-500">{error}</div>
                    ) : blocks.length === 0 && loading ? (
                        <div className="col-span-full text-center text-gray-500">Loading...</div>
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

                <div className="text-center mt-8">
                    <LoadingButton
                        onClick={loadMore}
                        loading={loading}
                        hasMore={true}
                        label="Load More"
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
        <Card interactive onClick={onClick} className="text-left">
            <div className="text-lg font-semibold mb-3">{block.name}</div>

            <div className="text-gray-600 text-sm space-y-1">
                <div><strong>ID:</strong> {getTrimmedId(block.id)}</div>
                <div><strong>Started:</strong> {new Date(block.startTime).toLocaleString()}</div>
                <div><strong>Ended:</strong> {isOngoing ? "⏳ Ongoing" : new Date(block.endTime!).toLocaleString()}</div>
                <div><strong>Duration:</strong> {formatDuration(block.startTime, block.endTime)}</div>

                {block.endMessage && (
                    <div className="mt-3 p-2 bg-gray-50 border-l-3 border-primary rounded italic text-xs">
                        "{block.endMessage}"
                    </div>
                )}
            </div>
        </Card>
    );
};