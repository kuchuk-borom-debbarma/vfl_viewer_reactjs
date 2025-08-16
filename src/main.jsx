import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Global styles
import "./styles/variable.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/typography.css";

const container = document.getElementById("root");
createRoot(container).render(<App />);
