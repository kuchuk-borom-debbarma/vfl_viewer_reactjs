import {LogEntry} from "../api/vfl";

export function getLogSymbol(log: LogEntry): string {
    switch (log.logType) {
        case "SUB_BLOCK_START_PRIMARY":           return "▶️";
        case "SUB_BLOCK_START_SECONDARY_NO_JOIN": return "➕";
        case "SUB_BLOCK_START_SECONDARY_JOIN":    return "➗";
        case "PUBLISH_EVENT":                     return "📢";
        case "SUB_BLOCK_CONTINUE":                return "⏩";
        case "SUB_BLOCK_CONTINUE_COMPLETE":       return "✅";
        case "EVENT_LISTENER":                    return "🎧";
        case "MESSAGE":     return "📝";
        case "WARN":        return "⚠️";
        case "ERROR":       return "❌";
        default:            return "📄";
    }
}