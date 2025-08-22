import { CONFIG, LOG_SYMBOLS, LOG_COLORS } from '../config/constants';
import { LogEntry } from '../types';

// API utilities
export const getApiUrl = (endpoint: string) =>
    `${CONFIG.API_HOST}/api/${CONFIG.API_VERSION}${endpoint}`;

// String utilities
export const truncate = (str: string, n = 80): string =>
    !str ? "" : str.length > n ? `${str.slice(0, n - 1)}…` : str;

export const getTrimmedId = (id: string): string => {
    if (!id) return "";
    const dash = id.lastIndexOf("-");
    return dash >= 0 && dash < id.length - 1 ? id.slice(dash + 1) : id.slice(-6);
};

// Time utilities
export const formatDuration = (start: number, end?: number | null): string => {
    const ms = (end ?? Date.now()) - start;
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
};

export const calculateDuration = (
    log: { timestamp?: number },
    parentTimestamp?: number
): string => {
    if (!parentTimestamp || !log.timestamp) return "N/A";
    const deltaMs = log.timestamp - parentTimestamp;
    if (deltaMs < 0) return "N/A";
    if (deltaMs < 1000) return `+${deltaMs}ms`;
    const s = Math.floor(deltaMs / 1000) % 60;
    const m = Math.floor(deltaMs / 60000) % 60;
    const h = Math.floor(deltaMs / 3600000);
    return `+${[h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ")}`;
};

// Log utilities
export const getLogSymbol = (logType: string): string =>
    LOG_SYMBOLS[logType as keyof typeof LOG_SYMBOLS] || "🔥";

export const getLogTypeColor = (logType: string): string => {
    const colorMap: Record<string, string> = {
        'SUB_BLOCK_START_PRIMARY': LOG_COLORS.primary,
        'SUB_BLOCK_START_SECONDARY_NO_JOIN': LOG_COLORS.secondary,
        'PUBLISH_EVENT': LOG_COLORS.warning,
        'MESSAGE': LOG_COLORS.info,
        'WARN': LOG_COLORS.warning,
        'ERROR': LOG_COLORS.error,
    };
    return colorMap[logType] || LOG_COLORS.info;
};

export const getLogTypeBadge = (logType: string) => {
    const badges: Record<string, { text: string; color: string }> = {
        'SUB_BLOCK_START_PRIMARY': { text: 'Start', color: LOG_COLORS.primary },
        'PUBLISH_EVENT': { text: 'Event', color: LOG_COLORS.warning },
        'MESSAGE': { text: 'Info', color: LOG_COLORS.info },
        'WARN': { text: 'Warning', color: LOG_COLORS.warning },
        'ERROR': { text: 'Error', color: LOG_COLORS.error },
    };
    return badges[logType] || { text: 'Unknown', color: LOG_COLORS.info };
};

// Tree utilities
export const buildLogTree = (logs: LogEntry[]): LogEntry[] => {
    const sortedLogs = [...logs].sort((a, b) => {
        if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
        return a.id.localeCompare(b.id);
    });

    const childrenMap = new Map<string, LogEntry[]>();
    const rootLogs: LogEntry[] = [];

    sortedLogs.forEach(log => {
        if (log.parentLogId === null) {
            rootLogs.push(log);
        } else {
            if (!childrenMap.has(log.parentLogId)) {
                childrenMap.set(log.parentLogId, []);
            }
            childrenMap.get(log.parentLogId)!.push(log);
        }
    });

    const attachChildren = (log: LogEntry): LogEntry => {
        const children = childrenMap.get(log.id) || [];
        return { ...log, children: children.map(attachChildren) };
    };

    return rootLogs.map(attachChildren);
};