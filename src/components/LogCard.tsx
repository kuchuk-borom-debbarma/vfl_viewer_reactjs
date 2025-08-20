import React from "react";
import { LogEntry } from "../api/vfl";
import { getLogSymbol } from "../utils/LogUtil";
import { getTrimmedId, truncate } from "../utils/General";

function formatDuration(start: number, end?: number | null): string {
    const duration = (end ?? Date.now()) - start;
    if (duration < 1000) return `${duration}ms`;
    const s = Math.floor(duration / 1000) % 60;
    const m = Math.floor(duration / 60000) % 60;
    const h = Math.floor(duration / 3600000);
    return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
}

export function LogCard({
                            log,
                            collapsed,
                            loadingReferenced,
                            onToggle
                        }: {
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggle: () => void;
}) {
    const hasRef = !!log.referencedBlock;
    const refBlock = log.referencedBlock;

    return (
        <div
            className={`card${hasRef ? " clickable" : ""}`}
            onClick={hasRef ? onToggle : undefined}
            style={{
                cursor: hasRef ? "pointer" : undefined,
                marginBottom: 'var(--space)',
                background: hasRef ? '#eff6ff' : 'var(--surface)',
                border: hasRef ? '1px solid var(--primary)' : '1px solid var(--border)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Main log row */}
            <div style={{ display: "flex", alignItems: "center", gap: 'var(--space)' }}>
                {hasRef && (
                    <span style={{
                        color: 'var(--primary)',
                        fontSize: '12px',
                        transform: !collapsed ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                    }}>
                        {loadingReferenced ? "⏳" : "▶"}
                    </span>
                )}
                <span style={{ fontSize: '16px' }}>{getLogSymbol(log)}</span>
                <span className="muted" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                    {getTrimmedId(log.id)}
                </span>
                <span style={{ fontWeight: '500', flex: 1 }}>
                    {truncate(log.message || "(no message)", 60)}
                </span>
                <span className="muted" style={{ fontSize: '12px' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                </span>
            </div>

            {/* Always show referenced block info if exists */}
            {hasRef && refBlock && (
                <div style={{
                    marginTop: 'var(--space)',
                    padding: 'var(--space)',
                    background: 'var(--bg)',
                    borderRadius: '6px',
                    fontSize: '13px'
                }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary)' }}>
                        Referenced Block
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', marginBottom: 6 }}>
                        <span className="muted">Name:</span>
                        <span>{truncate(refBlock.name || "(none)", 32)}</span>
                        <span className="muted">ID:</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {getTrimmedId(refBlock.id)}
                        </span>
                        <span className="muted">Created at:</span>
                        <span>{refBlock.createdAt ? new Date(refBlock.createdAt).toLocaleString() : "(unknown)"}</span>
                        <span className="muted">Duration:</span>
                        <span>
                            {formatDuration(refBlock.startTime, refBlock.endTime)}
                        </span>
                        <span className="muted">Starting message:</span>
                        <span>{truncate(log.message || "(no message)", 66)}</span>
                    </div>
                    {/* Ending message, if available */}
                    {refBlock.endMessage && (
                        <div style={{
                            marginTop: 6,
                            padding: '6px 8px',
                            background: '#f0f4ff',
                            borderRadius: 6,
                            fontStyle: 'italic',
                            borderLeft: '3px solid var(--primary)',
                            color: 'var(--primary)'
                        }}>
                            {truncate(refBlock.endMessage, 48)}
                        </div>
                    )}
                </div>
            )}

            {/* Referenced logs in minimal style (expanded view) */}
            {hasRef && !collapsed && log.children && log.children.length > 0 && (
                <div style={{
                    marginTop: 'var(--space)',
                    paddingTop: 'var(--space)',
                    borderTop: '1px solid var(--border)'
                }}>
                    {log.children.map((refLog, idx) => (
                        <div key={refLog.id || idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 'var(--space)',
                            padding: '4px 0',
                            fontSize: '13px'
                        }}>
                            <span>{getLogSymbol(refLog)}</span>
                            <span className="muted" style={{ fontFamily: 'monospace', fontSize: '10px' }}>
                                {getTrimmedId(refLog.id)}
                            </span>
                            <span style={{ flex: 1 }}>
                                {truncate(refLog.message || "(no message)", 66)}
                            </span>
                            <span className="muted" style={{ fontSize: '11px' }}>
                                {refLog.timestamp ? new Date(refLog.timestamp).toLocaleTimeString() : ""}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
