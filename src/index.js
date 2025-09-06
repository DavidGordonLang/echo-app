import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./suiteBus.js"; // <-- Suite Bridge (localStorage)

const rootEl = document.getElementById("root");
createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
