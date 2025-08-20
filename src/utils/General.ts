export function truncate(str: string, n = 80): string {
    if (!str) return "";
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export function getTrimmedId(id: string) {
    if (!id) return "";
    const dash = id.lastIndexOf("-");
    return dash >= 0 && dash < id.length - 1 ? id.slice(dash + 1) : id.slice(-6);
}

export const formatDuration = (start: number, end?: number | null) => {
    const ms = (end ?? Date.now()) - start;
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, h = Math.floor(ms / 3600000);
    return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
};
