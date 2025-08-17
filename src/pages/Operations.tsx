import React, { useEffect } from 'react';
import { getRootBlocks } from '../api/vfl';
import { usePagination } from '../hooks/usePagination';
import { CONFIG } from '../config/config';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import BlockCard from '../components/BlockCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface OperationsProps {
    goBack: () => void;
    onViewLogs: (blockId: string) => void;
}

export default function Operations({ goBack, onViewLogs }: OperationsProps) {
    const {
        items: blocks,
        loading,
        error,
        hasMore,
        loadMore,
        reset,
        initialize
    } = usePagination(
        (cursor) => getRootBlocks(CONFIG.DEFAULT_PAGE_SIZE, cursor),
        CONFIG.DEFAULT_PAGE_SIZE
    );

    // Initialize data on mount
    useEffect(() => {
        initialize();
    }, []); // Empty dependency array is safe now

    const handleReset = () => {
        reset();
        // Manually load initial data after reset
        setTimeout(() => initialize(), 0);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <Button variant="outline" onClick={goBack}>
                    ← Back
                </Button>
                <h2 className="page-title">Operations</h2>
            </div>

            <div className="grid-container">
                {loading && blocks.length === 0 ? (
                    <div className="grid-full center">
                        <LoadingSpinner message="Loading blocks..." />
                    </div>
                ) : error ? (
                    <div className="grid-full center error-message">
                        {error}
                        <Button variant="outline" onClick={handleReset}>
                            Retry
                        </Button>
                    </div>
                ) : blocks.length === 0 && !loading ? (
                    <div className="grid-full center muted">No blocks found.</div>
                ) : (
                    blocks.map(block => (
                        <Card key={block.id} onClick={() => onViewLogs(block.id)}>
                            <BlockCard block={block} />
                        </Card>
                    ))
                )}
            </div>

            {blocks.length > 0 && (
                <div className="pagination-controls">
                    {hasMore ? (
                        <Button variant="outline" onClick={() => loadMore()} loading={loading}>
                            Load More
                        </Button>
                    ) : (
                        <span className="muted">No more results.</span>
                    )}
                </div>
            )}
        </div>
    );
}