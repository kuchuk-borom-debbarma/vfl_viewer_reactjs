import React, { useEffect, useState } from "react";
import { CONFIG } from "../config/config";
import { getRootBlocks, Block } from "../api/vfl";
import BlockCard from "../components/BlockCard";  // ✅ new import

export default function Operations({ goBack }: { goBack: () => void }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = CONFIG.DEFAULT_PAGE_SIZE;

  const fetchBlocks = async (cursor?: string, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRootBlocks(PAGE_SIZE, cursor);
      setBlocks((prev) => {
        if (append) {
          const seen = new Set(prev.map((b) => b.id));
          const deduped = res.filter((b) => !seen.has(b.id));
          return [...prev, ...deduped];
        }
        return res;
      });

      if (res.length > 0) {
        setNextCursor(res[res.length - 1].cursor);
        setReachedEnd(res.length < PAGE_SIZE);
      } else {
        setReachedEnd(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load blocks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleLoadMore = () => {
    if (!reachedEnd && !loading) {
      fetchBlocks(nextCursor, true);
    }
  };

  return (
      <div className="container section-padding">
        {goBack && (
            <button className="btn btn-outline mb-lg" onClick={goBack}>
              ← Back
            </button>
        )}
        <h2 className="section-title">Operations</h2>

        <div className="features-grid min-height-300">
          {loading && blocks.length === 0 ? (
              <div className="grid-full text-center muted">Loading...</div>
          ) : error ? (
              <div className="grid-full text-center error">{error}</div>
          ) : blocks.length === 0 ? (
              <div className="grid-full text-center muted">No blocks found.</div>
          ) : (
              blocks.map((block) => <BlockCard key={block.id} block={block} />)
          )}
        </div>

        {reachedEnd ? (
            <div className="text-center muted mt-lg">No more results.</div>
        ) : (
            <div className="flex-center mt-lg">
              <button
                  className="btn btn-outline"
                  onClick={handleLoadMore}
                  disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
        )}
      </div>
  );
}
