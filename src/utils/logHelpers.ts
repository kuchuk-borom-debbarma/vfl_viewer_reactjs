export const getLogSymbol = (logType: string): string => {
    const symbols: Record<string, string> = {
        "SUB_BLOCK_START_PRIMARY": "▶️",
        "SUB_BLOCK_START_SECONDARY_NO_JOIN": "➕",
        "SUB_BLOCK_START_SECONDARY_JOIN": "➗",
        "PUBLISH_EVENT": "📢",
        "SUB_BLOCK_CONTINUE": "⤵",
        "SUB_BLOCK_CONTINUE_COMPLETE": "✅",
        "EVENT_LISTENER": "🎧",
        "MESSAGE": "📝",
        "WARN": "⚠️",
        "ERROR": "❌"
    };
    return symbols[logType] || "📄";
};

export const getLogTypeColor = (logType: string): string => {
    const colors: Record<string, string> = {
        'SUB_BLOCK_START_PRIMARY': '#10b981',
        'SUB_BLOCK_START_SECONDARY_NO_JOIN': '#3b82f6',
        'SUB_BLOCK_START_SECONDARY_JOIN': '#6366f1',
        'PUBLISH_EVENT': '#f59e0b',
        'SUB_BLOCK_CONTINUE': '#8b5cf6',
        'SUB_BLOCK_CONTINUE_COMPLETE': '#059669',
        'EVENT_LISTENER': '#ec4899',
        'MESSAGE': '#6b7280',
        'WARN': '#f97316',
        'ERROR': '#ef4444',
    };
    return colors[logType] || '#6b7280';
};

export const getLogTypeBadge = (logType: string): { text: string; color: string } => {
    const badges: Record<string, { text: string; color: string }> = {
        'SUB_BLOCK_START_PRIMARY': {text: 'Start', color: '#10b981'},
        'SUB_BLOCK_START_SECONDARY_NO_JOIN': {text: 'Branch', color: '#3b82f6'},
        'SUB_BLOCK_START_SECONDARY_JOIN': {text: 'Join', color: '#6366f1'},
        'PUBLISH_EVENT': {text: 'Event', color: '#f59e0b'},
        'SUB_BLOCK_CONTINUE': {text: 'Continue', color: '#8b5cf6'},
        'SUB_BLOCK_CONTINUE_COMPLETE': {text: 'Complete', color: '#059669'},
        'EVENT_LISTENER': {text: 'Listen', color: '#ec4899'},
        'MESSAGE': {text: 'Info', color: '#6b7280'},
        'WARN': {text: 'Warning', color: '#f97316'},
        'ERROR': {text: 'Error', color: '#ef4444'},
    };
    return badges[logType] || {text: 'Unknown', color: '#6b7280'};
};