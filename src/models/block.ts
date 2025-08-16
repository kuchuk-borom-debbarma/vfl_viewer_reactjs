export interface RootBlock {
    id: string;
    name: string;
    createdAt: number;
    startTime: number;
    endTime: number;
    endMessage: string | null;
    cursor: string;
}

export interface RootBlocksQuery {
    limit?: number;
    cursor?: string;
}
