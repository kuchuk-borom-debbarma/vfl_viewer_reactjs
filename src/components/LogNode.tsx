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

    // Check if we should show pagination arrows
    const showChildrenArrow = logEntry.childrenCursor !== null;
    const showSiblingArrow = logEntry.siblingCursor !== null;

    const handleChildrenPagination = () => {
        // Handle children pagination logic here
        console.log('Load more children for:', logEntry.id, 'cursor:', logEntry.childrenCursor);
    };

    const handleSiblingPagination = () => {
        // Handle sibling pagination logic here
        console.log('Load more siblings for:', logEntry.id, 'cursor:', logEntry.siblingCursor);
    };

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
            position: 'relative'
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

            {/* Pagination arrows */}
            {showChildrenArrow && (
                <button
                    onClick={handleChildrenPagination}
                    style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid #666',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#666',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 10
                    }}
                    title="Load more children"
                >
                    ↓
                </button>
            )}

            {showSiblingArrow && (
                <button
                    onClick={handleSiblingPagination}
                    style={{
                        position: 'absolute',
                        right: '-20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid #666',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#666',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 10
                    }}
                    title="Load more siblings"
                >
                    →
                </button>
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