// @ts-ignore
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Landing from "./pages/Landing.jsx";
import Operations from "./pages/Operations.jsx";

export function App() {
    const [page, setPage] = useState("landing");

    const goToOperations = () => setPage("operations");
    const goToLanding = () => setPage("landing");

    if (page === "operations") {
        return <Operations goBack={goToLanding} />;
    }

    // Default to landing
    return <Landing onShowOperations={goToOperations} />;
}

createRoot(document.getElementById("root")).render(<App />);
