import React, { useState } from "react";
import Landing from "./pages/Landing";
import Operations from "./pages/Operations";

export function App() {
    const PAGES = {
        LANDING: "landing",
        OPERATIONS: "operations",
    } as const;

    const [page, setPage] = useState<typeof PAGES[keyof typeof PAGES]>(
        PAGES.LANDING
    );

    const goToOperations = () => setPage(PAGES.OPERATIONS);
    const goToLanding = () => setPage(PAGES.LANDING);

    if (page === PAGES.OPERATIONS) {
        return <Operations goBack={goToLanding} />;
    }

    return <Landing onShowOperations={goToOperations} />;
}
