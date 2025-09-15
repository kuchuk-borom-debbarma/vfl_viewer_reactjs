import { CONFIG, LOG_SYMBOLS, LOG_COLORS } from '../config/constants';
import { LogEntry, LogType } from '../types';

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

// Log utilities - Updated for new LogType enum
export const getLogSymbol = (logType: LogType): string =>
    LOG_SYMBOLS[logType] || "📝";

export const getLogTypeColor = (logType: LogType): string =>
    LOG_COLORS[logType] || LOG_COLORS.INFO;

export const getLogTypeBadge = (logType: LogType) => {
    const badges: Record<LogType, { text: string; color: string }> = {
        [LogType.INFO]: { text: 'Info', color: LOG_COLORS.INFO },
        [LogType.WARN]: { text: 'Warning', color: LOG_COLORS.WARN },
        [LogType.ERROR]: { text: 'Error', color: LOG_COLORS.ERROR },
        [LogType.TRACE_PRIMARY]: { text: 'Start', color: LOG_COLORS.TRACE_PRIMARY },
        [LogType.TRACE_PARALLEL_JOIN]: { text: 'Join', color: LOG_COLORS.TRACE_PARALLEL_JOIN },
        [LogType.TRACE_PARALLEL]: { text: 'Parallel', color: LOG_COLORS.TRACE_PARALLEL },
        [LogType.TRACE_REMOTE]: { text: 'Remote', color: LOG_COLORS.TRACE_REMOTE },
        [LogType.PUBLISH_EVENT]: { text: 'Publish', color: LOG_COLORS.PUBLISH_EVENT },
        [LogType.LISTEN_EVENT]: { text: 'Listen', color: LOG_COLORS.LISTEN_EVENT }
    };
    return badges[logType] || { text: 'Unknown', color: LOG_COLORS.INFO };
};