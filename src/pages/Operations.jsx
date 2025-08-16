import React, {useEffect, useState} from "react";
import "../styles/variable.css";
import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/typography.css";
import { getRootBlocks } from "../api/vfl";

function BlockCard({ block }) {
  return (
      <div className="card">
        <div className="card-title">{block.name}</div>
        <div className="card-desc" style={{whiteSpace: "pre-line"}}>
          ID: {block.id}
          {"\n"}
          Started: {new Date(block.startTime).toLocaleString()}
          {"\n"}
          Ended: {block.endTime ? new Date(block.endTime).toLocaleString() : "Ongoing"}
        </div>
      </div>
  );
}

export default function Operations({ goBack }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(undefined);
  const [reachedEnd, setReachedEnd] = useState(false);

  // PAGE_SIZE: use config if you want, here hardcoded for demo
  const PAGE_SIZE = 1;

  const fetchBlocks = async (cursor, append = false) => {
    setLoading(true);
    try {
      const res = await getRootBlocks(PAGE_SIZE, cursor);
      if (append) {
        setBlocks(prev => {
          const seen = new Set(prev.map(b => b.id));
          const deduped = res.filter(b => !seen.has(b.id));
          return [...prev, ...deduped];
        });
      } else {
        setBlocks(res);
      }

      if (res.length > 0) {
        setNextCursor(res[res.length - 1].cursor);
        setReachedEnd(res.length < PAGE_SIZE); // if fewer than requested, probably last page
      } else {
        setReachedEnd(true); // No results, definitely at end
      }
    } catch (err) {
      // Show a friendly message -- don't crash the app!
      setReachedEnd(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks(undefined, false);
  }, []);

  const handleLoadMore = () => {
    if (reachedEnd || loading) return;
    fetchBlocks(nextCursor, true);
  };

  return (
      <div className="container" style={{paddingTop: "48px", paddingBottom: "48px"}}>
        {goBack && (
            <button className="btn btn-outline" onClick={goBack} style={{marginBottom: "24px"}}>
              ← Back
            </button>
        )}
        <h2 className="section-title">Operations</h2>

        <div className="features-grid" style={{minHeight: "300px"}}>
          {loading && blocks.length === 0 ? (
              <div style={{gridColumn: "1/-1", textAlign: "center", color: "var(--color-text-light)"}}>
                Loading...
              </div>
          ) : blocks.length === 0 ? (
              <div style={{gridColumn: "1/-1", textAlign: "center", color: "var(--color-text-light)"}}>
                No blocks found.
              </div>
          ) : (
              blocks.map(block => <BlockCard key={block.id} block={block} />)
          )}
        </div>

        {reachedEnd ? (
            <div style={{textAlign: "center", margin: "24px 0", color: "var(--color-text-light)"}}>
              No more results.
            </div>
        ) : (
            <div style={{display: "flex", justifyContent: "center", marginTop: "24px"}}>
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
