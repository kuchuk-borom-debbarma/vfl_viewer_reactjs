import { getApiUrl, CONFIG } from "../config/config";

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

/**
 * Fetch a list of root blocks, with optional pagination cursor.
 */
export async function getRootBlocks(
    limit: number = CONFIG.DEFAULT_PAGE_SIZE,
    cursor?: string
): Promise<Block[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) {
        params.append("cursor", cursor);
    }

    const res = await fetch(getApiUrl(`/root-blocks?${params.toString()}`));
    if (!res.ok) {
        throw new Error(`Failed to fetch blocks: ${res.statusText}`);
    }

    return res.json();
}

/**
 * Fetch logs of a block from root (no cursor) or sibling logs using cursor.
 * - If cursor is not provided, starts from the root logs of the block.
 * - If cursor is provided, fetches the next sibling logs of the same depth.
 */
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

    if (cursor) {
        params.append("cursor", cursor);
    }

    const res = await fetch(getApiUrl(`/logs-by-blockid?${params.toString()}`));
    if (!res.ok) {
        throw new Error(`Failed to fetch logs: ${res.statusText}`);
    }

    return res.json();
}
