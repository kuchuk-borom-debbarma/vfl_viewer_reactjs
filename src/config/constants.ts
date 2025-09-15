export const CONFIG = {
    API_HOST: "http://localhost:8080",
    API_VERSION: "v1",
    DEFAULT_PAGE_SIZE: 10, // Match backend default
    MAX_ZOOM: 3,
    MIN_ZOOM: 0.1,
    ZOOM_STEP: 0.001,
} as const;

export const ROUTES = {
    BLOCKS: "/blocks",
    LOGS: "/logs",
    BLOCK: "/block", // New endpoint for individual block details
} as const;

export const LOG_SYMBOLS = {
    INFO: "ℹ️",
    WARN: "⚠️",
    ERROR: "❌",
    TRACE_PRIMARY: "▶️",
    TRACE_PARALLEL_JOIN: "➗",
    TRACE_PARALLEL: "➕",
    TRACE_REMOTE: "🌐",
    PUBLISH_EVENT: "📢",
    LISTEN_EVENT: "🎧"
} as const;

export const LOG_COLORS = {
    INFO: '#6b7280',
    WARN: '#f59e0b',
    ERROR: '#ef4444',
    TRACE_PRIMARY: '#10b981',
    TRACE_PARALLEL_JOIN: '#8b5cf6',
    TRACE_PARALLEL: '#3b82f6',
    TRACE_REMOTE: '#06b6d4',
    PUBLISH_EVENT: '#f59e0b',
    LISTEN_EVENT: '#ec4899'
} as const;

export const SIDEBAR_WIDTH = 300;