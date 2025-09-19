// In App.tsx, add a key prop to force remounting:

import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Operations } from "./pages/Operations";
import { LogsViewer } from "./pages/LogsViewer";

// Wrapper component to access params for the key
const LogsViewerWrapper = () => {
    const { blockId } = useParams();
    return <LogsViewer key={blockId} />;
};

export function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/logs/:blockId" element={<LogsViewerWrapper />} />
        </Routes>
    );
}