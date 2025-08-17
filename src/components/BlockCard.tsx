import React from 'react';
import { Block } from '../api/vfl';
import { formatDuration, formatDateTime } from '../utils/formatters';

export default function BlockCard({ block }: { block: Block }) {
    const isOngoing = block.endTime === null;

    return (
        <div className="block-card">
            <div className="block-card-header">
                <h3 className="block-card-title">{block.name}</h3>
            </div>

            <div className="block-card-content">
                <div className="block-card-field">
                    <strong>ID:</strong> {block.id}
                </div>

                <div className="block-card-field">
                    <strong>Started:</strong> {formatDateTime(block.startTime)}
                </div>

                <div className="block-card-field">
                    <strong>Ended:</strong>
                    {isOngoing ? (
                        <span className="status-ongoing">⏳ Ongoing</span>
                    ) : (
                        formatDateTime(block.endTime!)
                    )}
                </div>

                <div className="block-card-field">
                    <strong>Duration:</strong> {formatDuration(block.startTime, block.endTime)}
                </div>

                {block.endMessage && (
                    <div className="block-card-message">
                        "{block.endMessage}"
                    </div>
                )}
            </div>
        </div>
    );
}