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

function Pagination({onPrev, onNext, disablePrev, disableNext, loading}) {
  return (
      <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginTop: "32px",
            marginBottom: "32px",
          }}
      >
        <button className="btn btn-outline" disabled={disablePrev || loading} onClick={onPrev}>
          Prev
        </button>
        <button className="btn btn-outline" disabled={disableNext || loading} onClick={onNext}>
          Next
        </button>
      </div>
  );
}

export default function Operations({goBack}) {
  const [blocks, setBlocks] = useState([]);
  const [cursorStack, setCursorStack] = useState([undefined]); // track previous cursors for Prev button
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Current cursor is last in cursorStack
  const currentCursor = cursorStack[cursorStack.length - 1];

  const fetchBlocks = async (cursor) => {
    setLoading(true);
    try {
      const res = await getRootBlocks(cursor);
      setBlocks(res);
      setHasMore(res.length === 10); // assume more if got max page size
    } catch {
      setBlocks([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks(currentCursor);
  }, [currentCursor]);

  const handleNext = () => {
    if (blocks.length === 0) return;
    const lastBlock = blocks[blocks.length - 1];
    if (!lastBlock.cursor) return;
    setCursorStack((prev) => [...prev, lastBlock.cursor]);
  };

  const handlePrev = () => {
    if (cursorStack.length <= 1) return;
    setCursorStack((prev) => prev.slice(0, prev.length - 1));
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
              blocks.map((block) => <BlockCard key={block.id} block={block}/>)
          )}
        </div>

        <Pagination
            onPrev={handlePrev}
            onNext={handleNext}
            disablePrev={cursorStack.length <= 1}
            disableNext={!hasMore}
            loading={loading}
        />
      </div>
  );
}
