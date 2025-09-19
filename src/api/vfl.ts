import {Block, LogEntry} from "../types";
import {CONFIG, ROUTES} from "../config/constants";
import {getApiUrl} from "../utils";

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

const apiFetch = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    debugLog('REQUEST', endpoint);

    try {
        const res = await fetch(getApiUrl(endpoint), options);

        if (!res.ok) {
            const errorText = await res.text();
            debugLog('ERROR', endpoint, {
                status: res.status,
                statusText: res.statusText,
                error: errorText
            });
            throw new Error(`API error: ${res.statusText} - ${errorText}`);
        }

        // Check if response has content
        const contentLength = res.headers.get('content-length');
        const contentType = res.headers.get('content-type');

        // If no content or content length is 0, return null/undefined
        if (contentLength === '0' || !contentType?.includes('application/json')) {
            debugLog('RESPONSE', endpoint, 'No JSON content');
            return undefined as T;
        }

        // Try to get response text first
        const responseText = await res.text();

        // If empty response, return undefined
        if (!responseText.trim()) {
            debugLog('RESPONSE', endpoint, 'Empty response');
            return undefined as T;
        }

        // Parse JSON
        const data = JSON.parse(responseText);
        debugLog('RESPONSE', endpoint, data);
        return data;

    } catch (err: any) {
        // If it's a JSON parsing error but response was successful, it might be an empty response
        if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
            debugLog('RESPONSE', endpoint, 'Non-JSON response (likely empty)');
            return undefined as T;
        }

        debugLog('ERROR', endpoint, err.message);
        throw err;
    }
};

// Transform backend Block (ToFetchBlock) to frontend Block
const transformBlock = (backendBlock: any): Block => ({
    id: backendBlock.id,
    name: backendBlock.name,
    createdAt: backendBlock.createdAt,
    enteredAt: backendBlock.enteredAt,
    exitedAt: backendBlock.exitedAt,
    returnedAt: backendBlock.returnedAt,
    exitMessage: backendBlock.exitMessage,
    cursor: backendBlock.cursor,
    // Computed properties for compatibility
    startTime: backendBlock.enteredAt || backendBlock.createdAt,
    endTime: backendBlock.exitedAt,
    endMessage: backendBlock.exitMessage
});

const transformLogEntry = (backendLog: any): LogEntry => {
    console.log('Transforming log entry:', backendLog);

    return {
        id: backendLog.id,
        blockId: backendLog.blockId,
        parentLogId: backendLog.parentLogId === null ? null : backendLog.parentLogId,
        message: backendLog.message,
        referencedBlock: backendLog.referencedBlock
            ? transformBlock(backendLog.referencedBlock)
            : null,
        timestamp: backendLog.timestamp,
        logType: backendLog.logType,
        cursor: backendLog.cursor,
    };
};

export const getRootBlocks = async (
    limit = CONFIG.DEFAULT_PAGE_SIZE,
    cursor?: string
): Promise<Block[]> => {
    const params = new URLSearchParams({limit: limit.toString()});
    if (cursor) params.append("cursor", cursor);

    const data = await apiFetch<any[]>(`${ROUTES.BLOCKS}?${params}`);
    return data.map(transformBlock);
};

export const getBlockById = async (blockId: string): Promise<Block> => {
    const data = await apiFetch<any>(`/block/${blockId}`);
    return transformBlock(data);
};

export const getLogsByBlockId = async (
    blockId: string,
    limit = CONFIG.DEFAULT_PAGE_SIZE,
    cursor?: string
): Promise<{ logs: LogEntry[], nextCursor: string | null }> => {
    const params = new URLSearchParams({limit: limit.toString()});
    if (cursor) params.append("cursor", cursor);

    const data = await apiFetch<any[]>(`${ROUTES.LOGS}/${blockId}?${params}`);
    const logs = data.map(transformLogEntry);

    // Determine next cursor based on response length
    const nextCursor = logs.length > 0 ? logs[logs.length - 1].cursor : null;

    return {
        logs,
        nextCursor: logs.length >= limit ? nextCursor : null
    };
};

// Delete blocks by IDs
export const deleteBlocksById = async (blockIds: string[]): Promise<void> => {
    const idsParam = blockIds.join(',');
    await apiFetch(`/blocks/${idsParam}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// Debug/Development only function
export const purgeData = async (): Promise<void> => {
    await apiFetch('/purge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
};