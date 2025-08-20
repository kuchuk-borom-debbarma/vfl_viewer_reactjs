import React from "react";
import { LogEntry } from "../api/vfl";
import {getLogSymbol} from "../utils/LogUtil";
import {getTrimmedId, truncate} from "../utils/General";

// ... [keeping all existing functions: getLogSymbol, truncate, getTrimmedId] ...

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

            {/* Referenced block info - minimal styling */}
            {hasRef && refBlock && (collapsed || !log.children || log.children.length === 0) && (
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px' }}>
                        <span className="muted">Name:</span>
                        <span>{truncate(refBlock.name || "(none)", 32)}</span>
                        <span className="muted">ID:</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {getTrimmedId(refBlock.id)}
                        </span>
                        {refBlock.endMessage && (
                            <>
                                <span className="muted">Result:</span>
                                <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>
                                    "{truncate(refBlock.endMessage, 48)}"
                                </span>
                            </>
                        )}
                    </div>
                    <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                        Click to {collapsed ? "expand" : "collapse"}
                    </div>
                </div>
            )}

            {/* Referenced logs in minimal style */}
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
