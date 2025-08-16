// src/pages/Operations.jsx

import React, {useEffect, useState} from "react";
import "../styles/variable.css";
import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/typography.css";
import {getRootBlocks} from "../api/vfl";

function BlockCard({block}) {
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

export default function Operations({goBack}) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Safely pick the next cursor (latest createdAt, tie-break by id)
  const getNextCursor = () => {
    if (blocks.length === 0) return undefined;
    const lastBlock = blocks.reduce((a, b) => {
      if (a.createdAt !== b.createdAt) {
        return a.createdAt > b.createdAt ? a : b;
      }
      return a.id > b.id ? a : b;
    });
    return lastBlock.cursor;
  };

  // Fetch blocks from API
  const fetchBlocks = async (cursor, append = false) => {
    setLoading(true);
    try {
      const res = await getRootBlocks(2, cursor);  // pass page size + optional cursor
      if (append) {
        setBlocks(prev => {
          const seen = new Set(prev.map(b => b.id));
          const deduped = res.filter(b => !seen.has(b.id));
          return [...prev, ...deduped];
        });
      } else {
        setBlocks(res);
      }
      setHasMore(res.length === 10);
    } catch (err) {
      console.error(err);
      if (!append) setBlocks([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load initial page
    fetchBlocks(undefined, false);
  }, []);

  const handleLoadMore = () => {
    const cursor = getNextCursor();
    if (!cursor) return;
    fetchBlocks(cursor, true);
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

        {hasMore && (
            <div style={{display: "flex", justifyContent: "center", marginTop: "24px"}}>
              <button className="btn btn-outline" onClick={handleLoadMore} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
        )}
      </div>
  );
}
