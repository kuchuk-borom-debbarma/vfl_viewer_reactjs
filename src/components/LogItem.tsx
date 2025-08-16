import React from "react";
import { LogEntry } from "../api/vfl";
import BlockCard from "./BlockCard";

export default function LogItem({ log }: { log: LogEntry }) {
    const isBlockRef = !!log.referencedBlock;

    return (
        <div className="log-item" style={{ marginLeft: log.parentLogId ? 16 : 0 }}>
            <div className="log-meta muted" style={{ marginBottom: 4, fontSize: "12px" }}>
                <strong>{log.logType}</strong> • {new Date(log.timestamp).toLocaleTimeString()}
            </div>

            {isBlockRef ? (
                <div className="log-ref-block">
                    <div className="muted" style={{ fontStyle: "italic", marginBottom: 4 }}>
                        ↳ Referenced Block:
                    </div>
                    <BlockCard block={log.referencedBlock} />
                </div>
            ) : (
                <div className="log-message">{log.message || "—"}</div>
            )}
        </div>
    );
}
