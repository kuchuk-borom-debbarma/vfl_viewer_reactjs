import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// Simple log type colors
const LOG_TYPE_COLORS = {
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
    default: '#6b7280'
};

// Format timestamp
const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
};

const LogNode = ({ data, isConnectable = true }) => {
    const logEntry = data.logEntry || data;

    if (!logEntry) {
        return (
            <div style={{
                border: '2px solid #ef4444',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: '#fff',
                minWidth: '250px'
            }}>
                Error: No log data
            </div>
        );
    }

    const color = LOG_TYPE_COLORS[logEntry.logType?.toLowerCase()] || LOG_TYPE_COLORS.default;

    return (
        <div style={{
            border: `2px solid ${color}`,
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: '#fff',
            minWidth: '250px',
            maxWidth: '350px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
            />

            {/* Log type header */}
            <div style={{
                marginBottom: '8px',
                fontWeight: 'bold',
                color: color,
                fontSize: '12px',
                textTransform: 'uppercase'
            }}>
                {logEntry.logType || 'LOG'}
            </div>

            {/* Message */}
            <div style={{
                marginBottom: '8px',
                lineHeight: '1.4',
                wordWrap: 'break-word'
            }}>
                {logEntry.message}
            </div>

            {/* Timestamp */}
            <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '6px'
            }}>
                {formatTime(logEntry.timestamp)}
            </div>

            {/* ID (shortened) */}
            <div style={{
                fontSize: '11px',
                color: '#999',
                fontFamily: 'monospace'
            }}>
                ID: {logEntry.id?.substring(0, 8)}...
            </div>

            {/* Referenced block */}
            {logEntry.referencedBlock && (
                <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #eee',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    Block: {logEntry.referencedBlock.id?.substring(0, 8)}...
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
            />
        </div>
    );
};

export default memo(LogNode);