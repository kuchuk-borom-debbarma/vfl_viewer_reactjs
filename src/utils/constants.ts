export const LOG_TYPES = {
    MESSAGE: 'message',
    ERROR: 'error',
    WARNING: 'warning',
    DEBUG: 'debug',
    INFO: 'info'
} as const;

export const LOG_TYPE_COLORS = {
    [LOG_TYPES.MESSAGE]: '#059669',
    [LOG_TYPES.ERROR]: '#dc2626',
    [LOG_TYPES.WARNING]: '#d97706',
    [LOG_TYPES.DEBUG]: '#7c3aed',
    [LOG_TYPES.INFO]: '#2563eb'
} as const;

export const GRAPH_CONSTANTS = {
    NODE_WIDTH: 200,
    NODE_HEIGHT: 80,
    HORIZONTAL_SPACING: 280,
    VERTICAL_SPACING: 150,
    DRAG_BOUNDARY: 150
} as const;

export const UI_CONSTANTS = {
    DEFAULT_TRUNCATE_LENGTH: 25,
    DEFAULT_ID_LENGTH: 8,
    LOADING_DEBOUNCE: 300
} as const;