import React, { useState } from "react";
import {Landing} from "./pages/Landing";
import {Operations} from "./pages/Operations";

type Page = "landing" | "operations";

export function App() {
    const [page, setPage] = useState<Page>("landing");

    return page === "operations"
        ? <Operations goBack={() => setPage("landing")} />
        : <Landing onShowOperations={() => setPage("operations")} />;
}