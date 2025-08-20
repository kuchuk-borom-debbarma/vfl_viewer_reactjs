import React from "react";
import { Block } from "../api/vfl";
import { Card } from "./UI";
import { getTrimmedId } from "../utils/General";

const formatDuration = (start: number, end?: number | null): string => {
    const duration = (end ?? Date.now()) - start;
    if (duration < 1000) return `${duration}ms`;

    const s = Math.floor(duration / 1000) % 60;
    const m = Math.floor(duration / 60000) % 60;
    const h = Math.floor(duration / 3600000);

    return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
};

interface BlockSidebarProps {
    block: Block;
    isOpen: boolean;
    onToggle: () => void;
}

export default function BlockSidebar({ block, isOpen, onToggle }: BlockSidebarProps) {
    const isOngoing = !block.endTime;

    return (
        <>
            {/* Sidebar Toggle Button */}
            <button
                onClick={onToggle}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: isOpen ? '320px' : '20px',
                    zIndex: 1001,
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--primary)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                }}
                title={isOpen ? "Hide block info" : "Show block info"}
            >
                {isOpen ? '❮' : 'ℹ️'}
            </button>

            {/* Sidebar */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: isOpen ? 0 : '-300px',
                    width: '300px',
                    height: '100vh',
                    background: 'var(--surface)',
                    borderRight: '1px solid var(--border)',
                    zIndex: 1000,
                    transition: 'left 0.3s ease',
                    overflowY: 'auto',
                    boxShadow: isOpen ? '4px 0 12px rgba(0,0,0,0.1)' : 'none'
                }}
            >
                <div style={{ padding: 'calc(var(--space) * 3)' }}>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        marginBottom: 'calc(var(--space) * 2)',
                        paddingBottom: 'var(--space)',
                        borderBottom: '2px solid var(--primary)',
                        color: 'var(--primary)'
                    }}>
                        📦 Block Information
                    </div>

                    <Card>
                        <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--space)", color: 'var(--primary)' }}>
                            {block.name}
                        </div>

                        <div style={{ lineHeight: 1.6, fontSize: "14px" }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                gap: '8px 12px',
                                marginBottom: 'var(--space)'
                            }}>
                                <span className="muted">🆔 ID:</span>
                                <span style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
                                    {getTrimmedId(block.id)}
                                </span>

                                <span className="muted">🚀 Started:</span>
                                <span>{new Date(block.startTime).toLocaleString()}</span>

                                <span className="muted">🏁 Ended:</span>
                                <span>{isOngoing ? "⏳ Ongoing" : new Date(block.endTime!).toLocaleString()}</span>

                                <span className="muted">⏱️ Duration:</span>
                                <span>{formatDuration(block.startTime, block.endTime)}</span>

                                <span className="muted">📅 Created:</span>
                                <span>{new Date(block.createdAt).toLocaleString()}</span>
                            </div>

                            {block.endMessage && (
                                <div style={{
                                    marginTop: 'var(--space)',
                                    padding: "8px 12px",
                                    background: "var(--bg)",
                                    borderRadius: 8,
                                    fontStyle: "italic",
                                    borderLeft: "3px solid var(--primary)",
                                    fontSize: 13
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--primary)' }}>
                                        💬 End Message:
                                    </div>
                                    "{block.endMessage}"
                                </div>
                            )}

                            <div style={{
                                marginTop: 'var(--space)',
                                padding: '8px 12px',
                                background: isOngoing ? '#fff7ed' : '#f0f9ff',
                                borderRadius: 8,
                                border: `1px solid ${isOngoing ? '#fed7aa' : '#bfdbfe'}`,
                                textAlign: 'center',
                                fontWeight: 500
                            }}>
                                {isOngoing ? '🔄 Currently Running' : '✅ Completed'}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.1)',
                        zIndex: 999
                    }}
                    onClick={onToggle}
                />
            )}
        </>
    );
}
