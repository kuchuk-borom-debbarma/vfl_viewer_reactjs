export function truncate(str: string, n = 80): string {
    if (!str) return "";
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export function getTrimmedId(id: string) {
    if (!id) return "";
    const dash = id.lastIndexOf("-");
    return dash >= 0 && dash < id.length - 1 ? id.slice(dash + 1) : id.slice(-6);
}