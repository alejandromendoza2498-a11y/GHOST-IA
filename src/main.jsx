import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GhostAI from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GhostAI />
  </StrictMode>
);
