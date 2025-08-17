import React from 'react';
import { LogEntry } from '../api/vfl';
import { formatTime, formatId } from '../utils/formatters';
import StatusBadge from './ui/StatusBadge';
import Card from './ui/Card';
import BlockCard from './BlockCard';

export default function LogItem({ log }: { log: LogEntry }) {
    const isBlockRef = !!log.referencedBlock;

    return (
        <div className="log-item">
            <div className="log-meta">
                <StatusBadge type={log.logType as any}>
                    {log.logType}
                </StatusBadge>
                <span>•</span>
                <span className="log-timestamp">{formatTime(log.timestamp)}</span>
                <span>•</span>
                <span className="log-id" title={`Log ID: ${log.id}`}>
          {formatId(log.id)}
        </span>
            </div>

            {isBlockRef ? (
                <div className="log-ref-block">
                    <div className="ref-indicator">
                        <span>🔗 Referenced Block:</span>
                    </div>
                    <BlockCard block={log.referencedBlock} />
                </div>
            ) : (
                <div className="log-message">
                    {log.message || <em className="muted">No message</em>}
                </div>
            )}
        </div>
    );
}