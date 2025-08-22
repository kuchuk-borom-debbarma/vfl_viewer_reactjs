import { Block, LogEntry, LogsResponse } from "../types";
import { CONFIG } from "../config/config";

const API_BASE = "http://localhost:8080/api/v1";

const debugLog = (type: 'REQUEST' | 'RESPONSE' | 'ERROR', endpoint: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const style = type === 'REQUEST' ? 'color: blue; font-weight: bold;' :
        type === 'RESPONSE' ? 'color: green; font-weight: bold;' :
            'color: red; font-weight: bold;';

    console.log(`%c[${timestamp}] ${type}: ${endpoint}`, style);
    if (data) {
        console.log('Data:', data);
    }
};

const apiFetch = async <T>(endpoint: string): Promise<T> => {
    debugLog('REQUEST', endpoint);

    try {
        const res = await fetch(`${API_BASE}${endpoint}`);

        if (!res.ok) {
            const errorText = await res.text();
            debugLog('ERROR', endpoint, { status: res.status, statusText: res.statusText, error: errorText });
            throw new Error(`API error: ${res.statusText} - ${errorText}`);
        }

        const data = await res.json();
        debugLog('RESPONSE', endpoint, data);
        return data;
    } catch (err: any) {
        debugLog('ERROR', endpoint, err.message);
        throw err;
    }
};

export const getRootBlocks = (limit = CONFIG.DEFAULT_PAGE_SIZE, cursor?: string): Promise<Block[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);
    const endpoint = `/root-blocks?${params}`;
    return apiFetch<Block[]>(endpoint);
};

export const getLogsByBlockId = (
    blockId: string,
    limit?: number,
    cursor?: string
): Promise<LogsResponse> => {
    const params = new URLSearchParams({
        blockId,
        limit: (limit || CONFIG.DEFAULT_PAGE_SIZE).toString(),
    });
    if (cursor) params.append("cursor", cursor);
    const endpoint = `/logs-by-blockid?${params}`;
    return apiFetch<LogsResponse>(endpoint);
};
