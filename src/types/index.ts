export interface Block {
    id: string;
    name: string;
    createdAt: number;
    enteredAt: number | null;
    exitedAt: number | null;
    returnedAt: number | null;
    exitMessage: string | null;
    cursor: string;
    // Computed properties for compatibility
    startTime: number;
    endTime: number | null;
    endMessage: string | null;
}

export interface LogEntry {
    id: string;
    blockId: string;
    parentLogId?: string | null;
    message: string | null;
    referencedBlock: Block | null;
    timestamp: number;
    logType: LogType;
    cursor: string;
    // For tree building
    children?: LogEntry[];
}

export enum LogType {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    TRACE_PRIMARY = "TRACE_PRIMARY",
    TRACE_PARALLEL_JOIN = "TRACE_PARALLEL_JOIN",
    TRACE_PARALLEL = "TRACE_PARALLEL",
    TRACE_REMOTE = "TRACE_REMOTE",
    PUBLISH_EVENT = "PUBLISH_EVENT",
    LISTEN_EVENT = "LISTEN_EVENT"
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
