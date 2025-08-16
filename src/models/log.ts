export interface LogEntry {
    id: string;
    blockId: string;
    parentLogId: string | null;
    message: string | null;
    logType: string;
    referencedBlock: {
        id: string;
        name: string;
        createdAt: number;
        startTime: number;
        endTime: number;
        endMessage: string | null;
        cursor: string;
    } | null;
    timestamp: number;
    cursor: string;
    children: LogEntry[];
}

export interface LogQuery {
    blockId: string;
    maxDepth?: number;
    maxChildren?: number;
    cursor?: string;
}
