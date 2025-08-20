import React, { useState } from "react";
import { Button } from "../components/UI";
import BlockCard from "../components/BlockCard";
import { useBlocks } from "../hooks/useBlocks";
import LogsViewer from "./LogsViewer";
import { Block } from "../api/vfl";

export default function Operations({ goBack }: { goBack: () => void }) {
    const { items: blocks, loading, error, loadMore } = useBlocks();
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

    // Handler for navigating to a referenced block
    const handleNavigateToBlock = (block: Block) => {
        setSelectedBlock(block);
    };

    if (selectedBlock) {
        return (
            <LogsViewer
                block={selectedBlock}
                goBack={() => setSelectedBlock(null)}
                onNavigateToBlock={handleNavigateToBlock} // Pass navigation handler
            />
        );
    }

    return (
        <div className="container section">
            <Button variant="outline" className="mb" onClick={goBack}>← Back</Button>
            <h2 className="section-title">Operations</h2>

            <div className="grid" style={{ minHeight: 300 }}>
                {error ? (
                    <div className="text-center error" style={{ gridColumn: "1/-1" }}>{error}</div>
                ) : blocks.length === 0 && loading ? (
                    <div className="text-center muted" style={{ gridColumn: "1/-1" }}>Loading...</div>
                ) : (
                    blocks.map(block => (
                        <div
                            key={block.id}
                            onClick={() => setSelectedBlock(block)}
                            style={{ cursor: "pointer" }}
                        >
                            <BlockCard block={block} />
                        </div>
                    ))
                )}
            </div>

            <div className="text-center mt">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                    {loading ? "Loading..." : "Load More"}
                </Button>
            </div>
        </div>
    );
}