import React, { useState, memo } from "react";
import { Block, LogEntry } from "../types";
import { formatDuration, getTrimmedId, truncate, calculateDuration } from "../utils/formatters";
import { getLogSymbol, getLogTypeColor, getLogTypeBadge } from "../utils/logHelpers";

interface LogCardProps {
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggleExpand?: () => void;
    onNavigateToBlock?: (block: Block) => void;
    parentTimestamp?: number;
}

const LogCard = memo(({ log, collapsed, loadingReferenced, onToggleExpand, onNavigateToBlock, parentTimestamp }: LogCardProps) => {
    const [showDetails, setShowDetails] = useState(false);
    const { referencedBlock: ref } = log;
    const logTypeBadge = getLogTypeBadge(log.logType);

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        ref && onToggleExpand?.();
    };

    const handleBlockCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        ref && onNavigateToBlock?.(ref);
    };

    const toggleDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDetails(!showDetails);
    };

    return (
        <div style={{ marginBottom: 'var(--space)' }}>
            {/* Main Log Row */}
            <div className="card" style={{ cursor: 'pointer' }} onClick={toggleDetails}>
                <div style={{ display: "flex", alignItems: "center", gap: 'var(--space)' }}>
                    {ref && (
                        <button
                            onClick={handleExpandClick}
                            style={{
                                background: 'none', border: 'none', color: 'var(--primary)',
                                fontSize: 12, cursor: 'pointer', padding: '4px', borderRadius: '4px',
                                transform: !collapsed ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {loadingReferenced ? "⏳" : (collapsed ? "▶" : "▼")}
                        </button>
                    )}

                    <span style={{ fontSize: 16 }}>{getLogSymbol(log.logType)}</span>

                    <span style={{
                        background: logTypeBadge.color, color: 'white', padding: '2px 6px',
                        borderRadius: '4px', fontSize: '10px', fontWeight: '600',
                        textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                        {logTypeBadge.text}
                    </span>

                    <span className="muted" style={{ fontSize: 11, fontFamily: "monospace" }}>
                        {getTrimmedId(log.id)}
                    </span>

                    <span style={{ fontWeight: 500, flex: 1 }}>
                        {truncate(log.message || "(no message)", showDetails ? 120 : 60)}
                    </span>

                    <span className="muted" style={{ fontSize: 12 }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                    </span>

                    <button onClick={toggleDetails} style={{
                        background: 'none', border: 'none', color: 'var(--text-light)',
                        fontSize: 12, cursor: 'pointer', padding: '4px'
                    }}>
                        {showDetails ? "🔼" : "🔽"}
                    </button>
                </div>

                {/* Expanded Details */}
                {showDetails && (
                    <div style={{
                        marginTop: 'var(--space)', paddingTop: 'var(--space)',
                        borderTop: '1px solid var(--border)', fontSize: '13px'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr',
                            gap: '6px 16px', alignItems: 'center'
                        }}>
                            <span className="muted">🆔 ID:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{getTrimmedId(log.id)}</span>

                            <span className="muted">🏃 Type:</span>
                            <span style={{ color: getLogTypeColor(log.logType), fontWeight: '500', fontSize: '12px' }}>
                                {log.logType.replace(/_/g, ' ')}
                            </span>

                            <span className="muted">🕐 Time:</span>
                            <span style={{ fontSize: '11px' }}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                            </span>

                            <span className="muted">⏱️ Duration:</span>
                            <span style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '11px' }}>
                                {calculateDuration(log, parentTimestamp)}
                            </span>
                        </div>

                        {log.message && log.message.length > 60 && (
                            <div style={{
                                marginTop: '8px', padding: '8px 12px', background: 'var(--bg)',
                                borderRadius: '6px', borderLeft: '3px solid var(--primary)',
                                fontSize: '12px', lineHeight: '1.4'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary)' }}>
                                    💬 Full Message:
                                </div>
                                <div style={{ fontStyle: 'italic' }}>{log.message}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Referenced Block Card - NOW INSIDE LogCard */}
                {ref && (
                    <div
                        className="card clickable"
                        onClick={handleBlockCardClick}
                        style={{
                            marginTop: 'var(--space)',
                            background: '#eff6ff',
                            border: '2px solid var(--primary)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space)'
                        }}>
                            <div style={{
                                fontWeight: 600,
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🔗 Referenced Block
                                <span style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '500'
                                }}>
                                    Click to view
                                </span>
                            </div>
                            <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>→</span>
                        </div>

                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                            {ref.name}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            gap: '4px 12px',
                            fontSize: '13px',
                            marginBottom: '8px'
                        }}>
                            <span className="muted">ID:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                                {getTrimmedId(ref.id)}
                            </span>

                            <span className="muted">Created:</span>
                            <span>
                                {ref.createdAt ? new Date(ref.createdAt).toLocaleString() : "(unknown)"}
                            </span>

                            <span className="muted">Duration:</span>
                            <span>{formatDuration(ref.startTime, ref.endTime)}</span>

                            <span className="muted">Status:</span>
                            <span style={{
                                color: ref.endTime ? '#059669' : '#d97706',
                                fontWeight: '500'
                            }}>
                                {ref.endTime ? '✅ Completed' : '⏳ Running'}
                            </span>
                        </div>

                        {ref.endMessage && (
                            <div style={{
                                padding: '6px 8px',
                                background: '#f0f4ff',
                                borderRadius: '6px',
                                fontStyle: 'italic',
                                borderLeft: '3px solid var(--primary)',
                                color: 'var(--primary)',
                                fontSize: '12px'
                            }}>
                                💬 {truncate(ref.endMessage, 80)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

LogCard.displayName = 'LogCard';
export { LogCard };
