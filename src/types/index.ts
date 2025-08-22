export interface Block {
    id: string;
    name: string;
    createdAt: number;
    startTime: number;
    endTime: number | null;
    endMessage: string | null;
    cursor: string;
}

export interface LogEntry {
    id: string;
    blockId: string;
    parentLogId: string | null;
    message: string;
    logType: string;
    referencedBlock: Block | null;
    timestamp: number;
    children?: LogEntry[];
}

export interface LogsResponse {
    logs: LogEntry[];
    nextCursor: string | null;
}

export interface ViewState {
    zoom: number;
    pan: { x: number; y: number };
    isDragging: boolean;
    dragStart: { x: number; y: number };
}

export type InputMode = "mouse" | "trackpad";
export type LogTypeVariant = "primary" | "secondary" | "warning" | "error" | "info";
