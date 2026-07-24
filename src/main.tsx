import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ExperienceEngineProvider } from "./experience-engine/ExperienceEngineProvider";
import "./styles/globals.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ExperienceEngineProvider>
      <App />
    </ExperienceEngineProvider>
  </React.StrictMode>
);