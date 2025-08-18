import React from "react";
import { Button, LoadingState, ErrorState } from "../components/UI";
import BlockCard from "../components/BlockCard";
import { useBlocks } from "../hooks/useBlocks";

export default function Operations({ goBack }: { goBack: () => void }) {
    const { blocks, loading, error, reachedEnd, loadMore } = useBlocks();

    return (
        <div className="container section">
            <Button variant="outline" className="mb" onClick={goBack}>
                ← Back
            </Button>

            <h2 className="section-title">Operations</h2>

            <div className="grid" style={{ minHeight: 300 }}>
                {loading && !blocks.length ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !blocks.length ? (
                    <LoadingState message="No blocks found." />
                ) : (
                    blocks.map(block => <BlockCard key={block.id} block={block} />)
                )}
            </div>

            <div className="text-center mt">
                {reachedEnd ? (
                    <div className="muted">No more results.</div>
                ) : (
                    <Button variant="outline" onClick={loadMore} disabled={loading}>
                        {loading ? "Loading..." : "Load More"}
                    </Button>
                )}
            </div>
        </div>
    );
}