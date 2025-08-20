import {formatDuration, getTrimmedId, truncate} from "../utils/General";
import {Block, LogEntry} from "../api/vfl";
import {useState} from "react";
import {getLogSymbol} from "../utils/LogUtil";

const getLogTypeColor = (logType: string): string => {
    const typeColors: Record<string, string> = {
        'SUB_BLOCK_START_PRIMARY': '#10b981',
        'SUB_BLOCK_START_SECONDARY_NO_JOIN': '#3b82f6',
        'SUB_BLOCK_START_SECONDARY_JOIN': '#6366f1',
        'PUBLISH_EVENT': '#f59e0b',
        'SUB_BLOCK_CONTINUE': '#8b5cf6',
        'SUB_BLOCK_CONTINUE_COMPLETE': '#059669',
        'EVENT_LISTENER': '#ec4899',
        'MESSAGE': '#6b7280',
        'WARN': '#f97316',
        'ERROR': '#ef4444',
    };
    return typeColors[logType] || '#6b7280';
};

const getLogTypeBadge = (logType: string): { text: string; color: string } => {
    const badges: Record<string, { text: string; color: string }> = {
        'SUB_BLOCK_START_PRIMARY': {text: 'Start', color: '#10b981'},
        'SUB_BLOCK_START_SECONDARY_NO_JOIN': {text: 'Branch', color: '#3b82f6'},
        'SUB_BLOCK_START_SECONDARY_JOIN': {text: 'Join', color: '#6366f1'},
        'PUBLISH_EVENT': {text: 'Event', color: '#f59e0b'},
        'SUB_BLOCK_CONTINUE': {text: 'Continue', color: '#8b5cf6'},
        'SUB_BLOCK_CONTINUE_COMPLETE': {text: 'Complete', color: '#059669'},
        'EVENT_LISTENER': {text: 'Listen', color: '#ec4899'},
        'MESSAGE': {text: 'Info', color: '#6b7280'},
        'WARN': {text: 'Warning', color: '#f97316'},
        'ERROR': {text: 'Error', color: '#ef4444'},
    };
    return badges[logType] || {text: 'Unknown', color: '#6b7280'};
};

// Calculate duration from parent timestamp
const calculateDuration = (log: LogEntry, parentTimestamp?: number): string => {
    if (!parentTimestamp || !log.timestamp) return "N/A";
    const deltaMs = log.timestamp - parentTimestamp;
    if (deltaMs < 0) return "N/A"; // Invalid case
    if (deltaMs < 1000) return `+${deltaMs}ms`;

    const s = Math.floor(deltaMs / 1000) % 60;
    const m = Math.floor(deltaMs / 60000) % 60;
    const h = Math.floor(deltaMs / 3600000);

    return `+${[h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ")}`;
};

export function LogCard({
                            log,
                            collapsed,
                            loadingReferenced,
                            onToggleExpand,
                            onNavigateToBlock,
                            parentTimestamp
                        }: {
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggleExpand?: () => void;
    onNavigateToBlock?: (block: Block) => void;
    parentTimestamp?: number; // New prop for duration calculation
}) {
    const [showDetails, setShowDetails] = useState(false);
    const {referencedBlock: ref} = log;
    const logTypeBadge = getLogTypeBadge(log.logType);

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

    const handleDetailsToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDetails(!showDetails);
    };

    return (
        <div style={{marginBottom: 'var(--space)'}}>
            {/* Main Log Row */}
            <div
                className="card"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                }}
                onClick={handleDetailsToggle}
            >
                {/* Primary Log Information */}
                <div style={{display: "flex", alignItems: "center", gap: 'var(--space)'}}>
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

                    <span style={{fontSize: 16}}>{getLogSymbol(log)}</span>

                    {/* Log Type Badge */}
                    <span
                        style={{
                            background: logTypeBadge.color,
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {logTypeBadge.text}
                    </span>

                    <span className="muted" style={{fontSize: 11, fontFamily: "monospace"}}>
                        {getTrimmedId(log.id)}
                    </span>

                    <span style={{fontWeight: 500, flex: 1}}>
                        {truncate(log.message || "(no message)", showDetails ? 120 : 60)}
                    </span>

                    {/* Timestamp */}
                    <span className="muted" style={{fontSize: 12}}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                    </span>

                    {/* Details Toggle */}
                    <button
                        onClick={handleDetailsToggle}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-light)',
                            fontSize: 12,
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease',
                        }}
                        title={showDetails ? "Hide details" : "Show details"}
                    >
                        {showDetails ? "🔼" : "🔽"}
                    </button>
                </div>

                {/* Simplified Expanded Details */}
                {showDetails && (
                    <div
                        style={{
                            marginTop: 'var(--space)',
                            paddingTop: 'var(--space)',
                            borderTop: '1px solid var(--border)',
                            fontSize: '13px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr auto 1fr',
                                gap: '6px 16px',
                                alignItems: 'center'
                            }}
                        >
                            {/* ID */}
                            <span className="muted" style={{fontWeight: '500'}}>🆔 ID:</span>
                            <span style={{fontFamily: 'monospace', fontSize: '11px'}}>
                                {getTrimmedId(log.id)}
                            </span>

                            {/* Type */}
                            <span className="muted" style={{fontWeight: '500'}}>🏃 Type:</span>
                            <span style={{
                                color: getLogTypeColor(log.logType),
                                fontWeight: '500',
                                fontSize: '12px'
                            }}>
                                {log.logType.replace(/_/g, ' ')}
                            </span>

                            {/* Timestamp */}
                            <span className="muted" style={{fontWeight: '500'}}>🕐 Time:</span>
                            <span style={{fontSize: '11px'}}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                            </span>

                            {/* Duration from parent */}
                            <span className="muted" style={{fontWeight: '500'}}>⏱️ Duration:</span>
                            <span style={{
                                color: 'var(--primary)',
                                fontWeight: '500',
                                fontSize: '11px'
                            }}>
                                {calculateDuration(log, parentTimestamp)}
                            </span>
                        </div>

                        {/* Full Message if Truncated */}
                        {log.message && log.message.length > 60 && (
                            <div
                                style={{
                                    marginTop: '8px',
                                    padding: '8px 12px',
                                    background: 'var(--bg)',
                                    borderRadius: '6px',
                                    borderLeft: '3px solid var(--primary)',
                                    fontSize: '12px',
                                    lineHeight: '1.4'
                                }}
                            >
                                <div style={{fontWeight: '600', marginBottom: '4px', color: 'var(--primary)'}}>
                                    💬 Full Message:
                                </div>
                                <div style={{fontStyle: 'italic'}}>
                                    {log.message}
                                </div>
                            </div>
                        )}
                    </div>
                )}
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
                        <span style={{
                            color: 'var(--text-light)',
                            fontSize: '12px'
                        }}>
                            →
                        </span>
                    </div>

                    <div style={{fontSize: '16px', fontWeight: 600, marginBottom: '8px'}}>
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
                        <span style={{fontFamily: 'monospace', fontSize: 12}}>
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
    );
}