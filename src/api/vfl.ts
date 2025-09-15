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