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
}

export interface LogsResponse {
    logs: LogEntry[];
    nextCursor: string | null;
}

export interface PaginationHook<T> {
    items: T[];
    loading: boolean;
    error: string | null;
    loadMore: () => void;
}
