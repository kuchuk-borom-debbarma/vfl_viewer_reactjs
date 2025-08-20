import {Block, LogEntry} from "../types";

const API_BASE = "http://localhost:8080/api/v1";
const DEFAULT_LIMIT = 5;

const apiFetch = async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    return res.json();
};

export const getRootBlocks = (limit = DEFAULT_LIMIT, cursor?: string): Promise<Block[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);
    return apiFetch<Block[]>(`/root-blocks?${params}`);
};

export const getLogsByBlockId = (
    blockId: string,
    maxDepth: number,
    maxChildren: number,
    cursor?: string
): Promise<LogEntry[]> => {
    const params = new URLSearchParams({
        blockId,
        maxDepth: maxDepth.toString(),
        maxChildren: maxChildren.toString(),
    });
    if (cursor) params.append("cursor", cursor);
    return apiFetch<LogEntry[]>(`/logs-by-blockid?${params}`);
};