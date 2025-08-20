import React from "react";
import { LogEntry } from "../api/vfl";

function getLogTypeSymbol(type: string): string {
    switch(type?.toLowerCase()) {
        case 'error': return '❌';
        case 'warn':
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        case 'debug': return '🐛';
        case 'trace': return '🔍';
        case 'message': return '📝';
        default: return '📄';
    }
}

export const getTrimmedId = (id: string) => {
    // After last dash or last 6 chars fallback
    if (!id) return "";
    const dash = id.lastIndexOf("-");
    return dash >= 0 && dash < id.length - 1 ? id.slice(dash + 1) : id.slice(-6);
};

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
    return (
        <div
            className={`log-entry${hasRef ? " referenced" : ""}${hasRef ? " clickable" : ""}`}
            onClick={hasRef ? onToggle : undefined}
            style={{ userSelect: "none", cursor: hasRef ? "pointer" : undefined }}
        >
            <div className="log-content">
                {hasRef && (
                    <span className={`arrow${!collapsed ? " rotated" : ""}`}>
                        {loadingReferenced ? <span style={{ fontSize: 13 }}>⏳</span> : "▶"}
                    </span>
                )}
                <span style={{ marginRight: 8 }}>{getLogTypeSymbol(log.logType || "")}</span>
                <span className="block-id">[{getTrimmedId(log.id)}]</span>
                <span className="message" style={{ marginLeft: 8 }}>{log.message || "(no message)"}</span>
                <span className="timestamp" style={{ marginLeft: 12, fontSize: 12, opacity: 0.7 }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                </span>
                {hasRef && log.referencedBlock?.id &&
                    <span
                        className="block-id"
                        style={{
                            fontSize: "11px",
                            color: "#60a5fa",
                            marginLeft: 12
                        }}
                    >
                    [References: {getTrimmedId(log.referencedBlock.id)}]
                  </span>
                }
            </div>
        </div>
    );
}
