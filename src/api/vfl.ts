import { CONFIG, getApiUrl } from "../config/config";

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
    referencedBlock: any | null;
    timestamp: number;
    cursor: string;
    children: LogEntry[];
}

async function apiFetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(getApiUrl(endpoint));
    if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
    }
    return res.json();
}

export async function getRootBlocks(
    limit: number = CONFIG.DEFAULT_PAGE_SIZE,
    cursor?: string
): Promise<Block[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);
    return apiFetch<Block[]>(`/root-blocks?${params.toString()}`);
}

export async function getLogsByBlockId(
    blockId: string,
    maxDepth: number,
    maxChildren: number,
    cursor?: string
): Promise<LogEntry[]> {
    const params = new URLSearchParams({
        blockId,
        maxDepth: maxDepth.toString(),
        maxChildren: maxChildren.toString(),
    });
    if (cursor) params.append("cursor", cursor);
    return apiFetch<LogEntry[]>(`/logs-by-blockid?${params.toString()}`);
}
