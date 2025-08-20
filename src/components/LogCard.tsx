import React from "react";
import { LogEntry, Block } from "../api/vfl";
import { getLogSymbol } from "../utils/LogUtil";
import { getTrimmedId, truncate } from "../utils/General";

const formatDuration = (start: number, end?: number | null) => {
    const ms = (end ?? Date.now()) - start;
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, h = Math.floor(ms / 3600000);
    return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
};

export function LogCard({
                            log,
                            collapsed,
                            loadingReferenced,
                            onToggleExpand,
                            onNavigateToBlock
                        }: {
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggleExpand?: () => void;
    onNavigateToBlock?: (block: Block) => void;
}) {
    const { referencedBlock: ref } = log;

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ref && onToggleExpand) {
            onToggleExpand();
        }
    };

    const handleBlockCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ref && onNavigateToBlock) {
            onNavigateToBlock(ref);
        }
    };

    return (
        <div style={{ marginBottom: 'var(--space)' }}>
            {/* Main Log Row */}
            <div
                className="card"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 'var(--space)' }}>
                    {ref && (
                        <button
                            onClick={handleExpandClick}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: 12,
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                transform: !collapsed ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                            title={collapsed ? "Expand referenced block logs" : "Collapse referenced block logs"}
                        >
                            {loadingReferenced ? "⏳" : "▶"}
                        </button>
                    )}
                    <span style={{ fontSize: 16 }}>{getLogSymbol(log)}</span>
                    <span className="muted" style={{ fontSize: 11, fontFamily: "monospace" }}>
                        {getTrimmedId(log.id)}
                    </span>
                    <span style={{ fontWeight: 500, flex: 1 }}>
                        {truncate(log.message || "(no message)", 60)}
                    </span>
                    <span className="muted" style={{ fontSize: 12 }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                    </span>
                </div>
            </div>

            {/* Referenced Block Card - Clickable to Navigate */}
            {ref && (
                <div
                    className="card clickable"
                    onClick={handleBlockCardClick}
                    style={{
                        marginTop: 'var(--space)',
                        background: '#eff6ff',
                        border: '2px solid var(--primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
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
                            Referenced Block
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
                        <span style={{
                            color: 'var(--text-light)',
                            fontSize: '12px'
                        }}>
                            →
                        </span>
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
                            💬 {truncate(ref.endMessage, 60)}
                        </div>
                    )}
                </div>
            )}

            {/* Referenced block logs - only children not matching current log */}
            {ref && !collapsed && log.children && log.children.length > 0 && (
                <div style={{
                    marginTop: 'var(--space)',
                    marginLeft: 'calc(var(--space) * 2)',
                    paddingLeft: 'var(--space)',
                    borderLeft: '2px solid var(--primary)',
                    background: 'rgba(37, 99, 235, 0.02)',
                    borderRadius: '0 8px 8px 0'
                }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--primary)',
                        marginBottom: 'var(--space)',
                        padding: '4px 0'
                    }}>
                        📋 Referenced Block Execution Logs
                    </div>
                    {log.children.filter(l => l.id !== log.id).map((refLog, idx) =>
                        <div key={refLog.id || idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 'var(--space)',
                            padding: '6px 8px',
                            margin: '4px 0',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            fontSize: 13
                        }}>
                            <span>{getLogSymbol(refLog)}</span>
                            <span className="muted" style={{ fontFamily: 'monospace', fontSize: 10 }}>
                                {getTrimmedId(refLog.id)}
                            </span>
                            <span style={{ flex: 1 }}>
                                {truncate(refLog.message || "(no message)", 50)}
                            </span>
                            <span className="muted" style={{ fontSize: 11 }}>
                                {refLog.timestamp ? new Date(refLog.timestamp).toLocaleTimeString() : ""}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}