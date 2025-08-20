import React from "react";
import { Card } from "./UI";
import {formatDuration} from "../utils/formatters";
import {Block} from "../types";

export default function BlockCard({ block }: { block: Block }) {
    const isOngoing = !block.endTime;

    return (
        <Card style={{ textAlign: "left" }}>
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "var(--space)" }}>
                {block.name}
            </div>

            <div className="muted" style={{ lineHeight: 1.6, fontSize: "14px" }}>
                <div><strong>ID:</strong> {block.id}</div>
                <div><strong>Started:</strong> {new Date(block.startTime).toLocaleString()}</div>
                <div><strong>Ended:</strong> {isOngoing ? "⏳ Ongoing" : new Date(block.endTime!).toLocaleString()}</div>
                <div><strong>Duration:</strong> {formatDuration(block.startTime, block.endTime)}</div>

                {block.endMessage && (
                    <div style={{
                        marginTop: 6,
                        padding: "6px 8px",
                        background: "var(--bg)",
                        borderRadius: 6,
                        fontStyle: "italic",
                        borderLeft: "3px solid var(--primary)"
                    }}>
                        "{block.endMessage}"
                    </div>
                )}
            </div>
        </Card>
    );
}