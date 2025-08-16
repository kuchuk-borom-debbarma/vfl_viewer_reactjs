// src/App.tsx
// @ts-ignore
import React, { useState } from "react";
import Landing from "./pages/Landing";
import Operations from "./pages/Operations";
import LogsPage from "./pages/LogsPage"; // ✅ new import

export function App() {
    const PAGES = {
        LANDING: "landing",
        OPERATIONS: "operations",
        LOGS: "logs", // ✅ new page
    } as const;

    const [page, setPage] = useState<typeof PAGES[keyof typeof PAGES]>(
        PAGES.LANDING
    );
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const goToOperations = () => setPage(PAGES.OPERATIONS);
    const goToLanding = () => setPage(PAGES.LANDING);
    const goToLogs = (blockId: string) => {
        setSelectedBlockId(blockId);
        setPage(PAGES.LOGS);
    };

    if (page === PAGES.OPERATIONS) {
        return <Operations goBack={goToLanding} onViewLogs={goToLogs} />;
    }

    if (page === PAGES.LOGS && selectedBlockId) {
        return <LogsPage blockId={selectedBlockId} goBack={goToOperations} />;
    }

    return <Landing onShowOperations={goToOperations} />;
}
