import React from "react";
import { Block } from "../api/vfl";

function formatDuration(start: number, end?: number | null): string {
    const endTime = end ?? Date.now(); // if still running, measure until now
    const durationMs = endTime - start;

    if (durationMs < 1000) return `${durationMs} ms`;

    const secs = Math.floor(durationMs / 1000) % 60;
    const mins = Math.floor(durationMs / 60000) % 60;
    const hrs = Math.floor(durationMs / 3600000);

    let parts: string[] = [];
    if (hrs) parts.push(`${hrs}h`);
    if (mins) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return parts.join(" ");
}

export default function BlockCard({ block }: { block: Block }) {
    const isOngoing = block.endTime === null;

    return (
        <div className="card" style={{ textAlign: "left" }}>
            {/* Name */}
            <div
                className="card-title"
                style={{ fontSize: "18px", marginBottom: "8px" }}
            >
                {block.name}
            </div>

            {/* Metadata */}
            <div className="card-desc" style={{ lineHeight: 1.6 }}>
                <div>
                    <strong>ID:</strong> {block.id}
                </div>
                <div>
                    <strong>Started:</strong>{" "}
                    {new Date(block.startTime).toLocaleString()}
                </div>
                <div>
                    <strong>Ended:</strong>{" "}
                    {isOngoing ? "⏳ Ongoing" : new Date(block.endTime!).toLocaleString()}
                </div>
                <div>
                    <strong>Duration:</strong>{" "}
                    {formatDuration(block.startTime, block.endTime)}
                </div>

                {block.endMessage && (
                    <div
                        style={{
                            marginTop: 6,
                            padding: "6px 8px",
                            background: "#f9fafb",
                            borderRadius: "6px",
                            fontStyle: "italic",
                            color: "var(--color-text-light)",
                            borderLeft: "3px solid var(--color-primary)",
                        }}
                    >
                        “{block.endMessage}”
                    </div>
                )}
            </div>
        </div>
    );
}
