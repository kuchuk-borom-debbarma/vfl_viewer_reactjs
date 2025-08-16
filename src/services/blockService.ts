import { getApiUrl, CONFIG } from '../config/config';
import { RootBlock, RootBlocksQuery } from '../models/block';

export class BlockService {
    static async getRootBlocks({ limit = CONFIG.DEFAULT_PAGE_SIZE, cursor }: RootBlocksQuery = {}): Promise<RootBlock[]> {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);

        const response = await fetch(getApiUrl(`/root-blocks?${params}`));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return response.json();
    }

    static formatDateTime = (timestamp: number) => new Date(timestamp).toLocaleString();

    static formatDuration = (startTime: number, endTime: number) => {
        const duration = endTime - startTime;
        return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
    };
}
