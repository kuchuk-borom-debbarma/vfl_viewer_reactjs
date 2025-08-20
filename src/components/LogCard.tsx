import React from "react";
import { LogEntry } from "../api/vfl";
import { getLogSymbol } from "../utils/LogUtil";
import { getTrimmedId, truncate } from "../utils/General";

const formatDuration = (start: number, end?: number | null) => {
    const ms = (end ?? Date.now()) - start;
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, h = Math.floor(ms / 3600000);
    return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
};

export function LogCard({ log, collapsed, loadingReferenced, onToggle }: {
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggle: () => void;
}) {
    const { referencedBlock: ref } = log;

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling to parent pan/zoom handlers
        if (ref && onToggle) {
            onToggle();
        }
    };

    return (
        <div
            className={`card${ref ? " clickable" : ""}`}
            onClick={handleCardClick}
            style={{
                cursor: ref ? "pointer" : "default",
                marginBottom: 'var(--space)',
                background: ref ? '#eff6ff' : 'var(--surface)',
                border: ref ? '1px solid var(--primary)' : '1px solid var(--border)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Main Log Row */}
            <div style={{ display: "flex", alignItems: "center", gap: 'var(--space)' }}>
                {ref && (
                    <span style={{
                        color: 'var(--primary)', fontSize: 12,
                        transform: !collapsed ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}>{loadingReferenced ? "⏳" : "▶"}</span>
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

            {/* Referenced Block Info - Always */}
            {ref && (
                <div style={{
                    marginTop: 'var(--space)',
                    padding: 'var(--space)',
                    background: 'var(--bg)',
                    borderRadius: 6,
                    fontSize: 13
                }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--primary)' }}>
                        🔗 Referenced Block
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', marginBottom: 6 }}>
                        <span className="muted">Name:</span>
                        <span>{truncate(ref.name || "(none)", 32)}</span>
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
                    </div>
                    {ref.endMessage && (
                        <div style={{
                            marginTop: 6,
                            padding: '6px 8px',
                            background: '#f0f4ff',
                            borderRadius: 6,
                            fontStyle: 'italic',
                            borderLeft: '3px solid var(--primary)',
                            color: 'var(--primary)'
                        }}>
                            💬 {truncate(ref.endMessage, 48)}
                        </div>
                    )}
                </div>
            )}

            {/* Referenced logs – only children not matching current log */}
            {ref && !collapsed && log.children && log.children.length > 0 && (
                <div style={{
                    marginTop: 'var(--space)',
                    paddingTop: 'var(--space)',
                    borderTop: '1px solid var(--border)'
                }}>
                    {log.children.filter(l => l.id !== log.id).map((refLog, idx) =>
                        <div key={refLog.id || idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 'var(--space)',
                            padding: '4px 0',
                            fontSize: 13
                        }}>
                            <span>{getLogSymbol(refLog)}</span>
                            <span className="muted" style={{ fontFamily: 'monospace', fontSize: 10 }}>
                                {getTrimmedId(refLog.id)}
                            </span>
                            <span style={{ flex: 1 }}>
                                {truncate(refLog.message || "(no message)", 66)}
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
