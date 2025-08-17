export const formatDuration = (start: number, end?: number | null): string => {
    const endTime = end ?? Date.now();
    const durationMs = endTime - start;

    if (durationMs < 1000) return `${durationMs}ms`;

    const secs = Math.floor(durationMs / 1000) % 60;
    const mins = Math.floor(durationMs / 60000) % 60;
    const hrs = Math.floor(durationMs / 3600000);

    const parts: string[] = [];
    if (hrs) parts.push(`${hrs}h`);
    if (mins) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
};

export const formatTime = (timestamp: number, options?: Intl.DateTimeFormatOptions): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        ...options
    });
};

export const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
};

export const formatId = (id: string, length = 8): string => {
    return `${id.substring(0, length)}...`;
};

export const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
};

export const calculateTimeDelta = (parentTime: number, childTime: number): string => {
    const delta = childTime - parentTime;
    if (delta < 0) return 'undefined';
    if (delta < 1000) return `${delta}ms`;
    if (delta < 60000) return `${(delta / 1000).toFixed(1)}s`;
    return `${(delta / 60000).toFixed(1)}m`;
};