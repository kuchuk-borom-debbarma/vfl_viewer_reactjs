import React, { useState } from "react";
import Landing from "./pages/Landing";
import Operations from "./pages/Operations";

export function App() {
    const [page, setPage] = useState<"landing" | "operations">("landing");

    return page === "operations"
        ? <Operations goBack={() => setPage("landing")} />
        : <Landing onShowOperations={() => setPage("operations")} />;
}