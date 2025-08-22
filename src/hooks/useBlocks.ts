import {usePagination} from "./usePagination";
import {getRootBlocks} from "../api/vfl";

export const useBlocks = () => {
    return usePagination({
        fetchFn: (limit: number, cursor?: string) => getRootBlocks(limit, cursor),
        pageSize: 5,
        autoLoad: true
    });
};