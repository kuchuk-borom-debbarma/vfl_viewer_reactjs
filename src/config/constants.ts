export const CONFIG = {
    API_HOST: "http://localhost:8080",
    API_VERSION: "v1",
    DEFAULT_PAGE_SIZE: 5,
    MAX_ZOOM: 3,
    MIN_ZOOM: 0.1,
    ZOOM_STEP: 0.001,
} as const;

export const ROUTES = {
    ROOT_BLOCKS: "/root-blocks",
    LOGS_BY_BLOCK: "/logs-by-blockid",
} as const;

export const LOG_SYMBOLS = {
    SUB_BLOCK_START_PRIMARY: "▶️",
    SUB_BLOCK_START_SECONDARY_NO_JOIN: "➕",
    SUB_BLOCK_START_SECONDARY_JOIN: "➗",
    PUBLISH_EVENT: "📢",
    SUB_BLOCK_CONTINUE: "⤵",
    SUB_BLOCK_CONTINUE_COMPLETE: "✅",
    EVENT_LISTENER: "🎧",
    MESSAGE: "📝",
    WARN: "⚠️",
    ERROR: "❌",
} as const;

export const LOG_COLORS = {
    primary: '#10b981',
    secondary: '#3b82f6',
    info: '#6b7280',
    warning: '#f59e0b',
    error: '#ef4444',
    success: '#059669',
} as const;

export const SIDEBAR_WIDTH = 300;