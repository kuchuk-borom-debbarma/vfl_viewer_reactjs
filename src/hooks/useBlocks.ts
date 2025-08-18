import { getRootBlocks } from "../api/vfl";
import { usePagination } from "./usePagination";

export const useBlocks = () => usePagination(getRootBlocks);