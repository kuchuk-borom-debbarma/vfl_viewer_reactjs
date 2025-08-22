import { Block, LogsResponse } from "../types";
import { CONFIG, ROUTES } from "../config/constants";
import { getApiUrl } from "../utils";

const debugLog = (type: 'REQUEST' | 'RESPONSE' | 'ERROR', endpoint: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const styles = {
        REQUEST: 'color: blue; font-weight: bold;',
        RESPONSE: 'color: green; font-weight: bold;',
        ERROR: 'color: red; font-weight: bold;'
    };

    console.log(`%c[${timestamp}] ${type}: ${endpoint}`, styles[type]);
    if (data) console.log('Data:', data);
};

const apiFetch = async <T>(endpoint: string): Promise<T> => {
    debugLog('REQUEST', endpoint);

    try {
        const res = await fetch(getApiUrl(endpoint));

        if (!res.ok) {
            const errorText = await res.text();
            debugLog('ERROR', endpoint, {
                status: res.status,
                statusText: res.statusText,
                error: errorText
            });
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

export const getRootBlocks = (
    limit = CONFIG.DEFAULT_PAGE_SIZE,
    cursor?: string
): Promise<Block[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);
    return apiFetch<Block[]>(`${ROUTES.ROOT_BLOCKS}?${params}`);
};

export const getLogsByBlockId = (
    blockId: string,
    limit = CONFIG.DEFAULT_PAGE_SIZE,
    cursor?: string
): Promise<LogsResponse> => {
    const params = new URLSearchParams({
        blockId,
        limit: limit.toString(),
    });
    if (cursor) params.append("cursor", cursor);
    return apiFetch<LogsResponse>(`${ROUTES.LOGS_BY_BLOCK}?${params}`);
};