import React from "react";
import { LogEntry } from "../api/vfl";
import BlockCard from "./BlockCard";

export default function LogItem({ log }: { log: LogEntry }) {
    const isBlockRef = !!log.referencedBlock;

    // Format timestamp to be more readable
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    };

    // Get log type styling class
    const getLogTypeClass = (logType: string) => {
        return `log-type-${logType.toLowerCase()}`;
    };

    return (
        <div className="log-item">
            <div className="log-meta">
                <span className={`log-type ${getLogTypeClass(log.logType)}`}>
                    <strong>{log.logType}</strong>
                </span>
                <span>•</span>
                <span className="log-timestamp">{formatTime(log.timestamp)}</span>
                <span>•</span>
                <span className="log-id" title={`Log ID: ${log.id}`}>
                    {log.id.substring(0, 8)}...
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