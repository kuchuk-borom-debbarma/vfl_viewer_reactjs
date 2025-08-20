export const truncate = (str: string, n = 80): string =>
    !str ? "" : str.length > n ? `${str.slice(0, n - 1)}…` : str;

export const getTrimmedId = (id: string): string => {
    if (!id) return "";
    const dash = id.lastIndexOf("-");
    return dash >= 0 && dash < id.length - 1 ? id.slice(dash + 1) : id.slice(-6);
};

export const formatDuration = (start: number, end?: number | null): string => {
    const ms = (end ?? Date.now()) - start;
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
};

export const calculateDuration = (log: { timestamp?: number }, parentTimestamp?: number): string => {
    if (!parentTimestamp || !log.timestamp) return "N/A";
    const deltaMs = log.timestamp - parentTimestamp;
    if (deltaMs < 0) return "N/A";
    if (deltaMs < 1000) return `+${deltaMs}ms`;
    const s = Math.floor(deltaMs / 1000) % 60;
    const m = Math.floor(deltaMs / 60000) % 60;
    const h = Math.floor(deltaMs / 3600000);
    return `+${[h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ")}`;
};