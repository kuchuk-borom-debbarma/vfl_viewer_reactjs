import React from "react";
import { Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Operations } from "./pages/Operations";
import { LogsViewer } from "./pages/LogsViewer";

export function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/logs/:blockId" element={<LogsViewer />} />
        </Routes>
    );
}
