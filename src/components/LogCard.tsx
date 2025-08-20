import React from "react";
import { LogEntry } from "../api/vfl";

function getLogSymbol(log: LogEntry): string {
    switch (log.logType) {
        case "SUB_BLOCK_START_PRIMARY":           return "▶️";
        case "SUB_BLOCK_START_SECONDARY_NO_JOIN": return "➕";
        case "SUB_BLOCK_START_SECONDARY_JOIN":    return "➗";
        case "PUBLISH_EVENT":                     return "📢";
        case "SUB_BLOCK_CONTINUE":                return "⏩";
        case "SUB_BLOCK_CONTINUE_COMPLETE":       return "✅";
        case "EVENT_LISTENER":                    return "🎧";
        case "MESSAGE":     return "📝";
        case "WARN":        return "⚠️";
        case "ERROR":       return "❌";
        default:            return "📄";
    }
}

function truncate(str: string, n = 80): string {
    if (!str) return "";
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function getTrimmedId(id: string) {
    if (!id) return "";
    const dash = id.lastIndexOf("-");
    return dash >= 0 && dash < id.length - 1 ? id.slice(dash + 1) : id.slice(-6);
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
            className={`log-entry${hasRef ? " referenced clickable" : ""}`}
            onClick={hasRef ? onToggle : undefined}
            style={{
                userSelect: "none",
                cursor: hasRef ? "pointer" : undefined,
                padding: "16px",
                marginBottom: 18,
                background: hasRef ? "rgba(59, 130, 246, 0.05)" : undefined,
                border: hasRef ? "1px solid rgba(59, 130, 246, 0.2)" : undefined,
                borderRadius: 9,
            }}
        >
            {/* Main log row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {hasRef && (
                    <span className={`arrow${!collapsed ? " rotated" : ""}`}>
                        {loadingReferenced ? <span style={{ fontSize: 13 }}>⏳</span> : "▶"}
                    </span>
                )}
                <span>{getLogSymbol(log)}</span>
                <span style={{ color: "#9fb5d1", fontSize: 11 }}>
                    <strong>ID:</strong> {getTrimmedId(log.id)}
                </span>
                <span style={{ fontWeight: 500, fontSize: 14, color: "white" }}>
                    {truncate(log.message || "(no message)", 60)}
                </span>
                <span className="timestamp" style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                </span>
            </div>

            {/* Referenced block info */}
            {hasRef && refBlock && (
                <div style={{
                    marginTop: 15,
                    background: "rgba(30,58,138,0.06)",
                    padding: "12px 18px",
                    borderRadius: 7,
                    border: "1px solid rgba(59,130,246,0.08)",
                }}>
                    <div style={{
                        fontSize: 13, fontWeight: 600, color: "#60a5fa",
                        marginBottom: 6, letterSpacing: 0.2
                    }}>
                        Referenced Block
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", rowGap: 4, columnGap: 14, fontSize: 13 }}>
                        <div style={{ color: "#8ca7c8" }}>Block Name:</div>
                        <div>{truncate(refBlock.name || "(none)", 32)}</div>
                        <div style={{ color: "#8ca7c8" }}>Block ID:</div>
                        <div style={{ fontFamily: "SF Mono, monospace", fontSize: 12, color: "#bad0f8" }}>
                            {getTrimmedId(refBlock.id)}
                        </div>
                        {refBlock.endMessage && (
                            <>
                                <div style={{ color: "#8ca7c8" }}>End Message:</div>
                                <div style={{ color: "#62afd4", fontStyle: "italic" }}>
                                    "{truncate(refBlock.endMessage, 48)}"
                                </div>
                            </>
                        )}
                    </div>
                    <div style={{ marginTop: 7, color: "#999", fontSize: 11 }}>
                        Click to {collapsed ? "expand" : "collapse"} block logs
                    </div>

                    {/* Referenced logs */}
                    {!collapsed && log.children && log.children.length > 0 && (
                        <div style={{
                            marginTop: 14,
                            borderTop: "1px solid #222a34",
                            paddingTop: 8,
                        }}>
                            {log.children.map((refLog, idx) => (
                                <div key={refLog.id || idx}
                                     style={{
                                         display: "flex",
                                         alignItems: "center",
                                         gap: 10,
                                         padding: "5px 0",
                                         fontSize: 13,
                                     }}>
                                    <span>{getLogSymbol(refLog)}</span>
                                    <span style={{ color: "#9fb5d1", fontSize: 11 }}>
                                        <strong>ID:</strong> {getTrimmedId(refLog.id)}
                                    </span>
                                    <span style={{ color: "#fff" }}>
                                        {truncate(refLog.message || "(no message)", 66)}
                                    </span>
                                    <span style={{
                                        marginLeft: "auto", fontSize: 11, opacity: 0.6
                                    }}>
                                        {refLog.timestamp ? new Date(refLog.timestamp).toLocaleTimeString() : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
