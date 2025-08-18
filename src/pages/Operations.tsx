import React from "react";
import { Button } from "../components/UI";
import BlockCard from "../components/BlockCard";
import { useBlocks } from "../hooks/useBlocks";

export default function Operations({ goBack }: { goBack: () => void }) {
    const { items: blocks, loading, error, loadMore } = useBlocks();

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
                    blocks.map(block => <BlockCard key={block.id} block={block} />)
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