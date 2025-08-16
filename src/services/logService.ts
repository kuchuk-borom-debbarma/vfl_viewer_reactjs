import { getApiUrl, CONFIG } from '../config/config';
import { LogEntry, LogQuery } from '../models/log';

export class LogService {
    static async getLogsByBlockId({
                                      blockId,
                                      maxDepth = 5,
                                      maxChildren = 50,
                                      cursor
                                  }: LogQuery): Promise<LogEntry[]> {
        const params = new URLSearchParams({
            blockId,
            maxDepth: maxDepth.toString(),
            maxChildren: maxChildren.toString()
        });

        if (cursor) {
            params.append('cursor', cursor);
        }

        const response = await fetch(getApiUrl(`/logs-by-blockid?${params}`));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    static formatTimestamp(timestamp: number): string {
        return new Date(timestamp).toLocaleString();
    }

    static formatDuration(startTime: number, endTime: number): string {
        const duration = endTime - startTime;
        if (duration < 1000) {
            return `${duration}ms`;
        } else if (duration < 60000) {
            return `${(duration / 1000).toFixed(2)}s`;
        } else {
            const minutes = Math.floor(duration / 60000);
            const seconds = ((duration % 60000) / 1000).toFixed(1);
            return `${minutes}m ${seconds}s`;
        }
    }

    static getLogTypeIcon(logType: string): string {
        const iconMap: { [key: string]: string } = {
            'MESSAGE': '💬',
            'SUB_BLOCK_START': '🚀',
            'SUB_BLOCK_START_SECONDARY_JOIN': '🔗',
            'SUB_BLOCK_END': '✅',
            'ERROR': '❌',
            'WARNING': '⚠️',
            'INFO': 'ℹ️',
            'DEBUG': '🔍'
        };
        return iconMap[logType] || '📝';
    }

    static getLogTypeColor(logType: string): string {
        const colorMap: { [key: string]: string } = {
            'MESSAGE': '#2196F3',
            'SUB_BLOCK_START': '#4CAF50',
            'SUB_BLOCK_START_SECONDARY_JOIN': '#FF9800',
            'SUB_BLOCK_END': '#4CAF50',
            'ERROR': '#F44336',
            'WARNING': '#FF9800',
            'INFO': '#2196F3',
            'DEBUG': '#9E9E9E'
        };
        return colorMap[logType] || '#757575';
    }
}
