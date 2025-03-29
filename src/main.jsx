import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { createClientUPProvider } from "@lukso/up-provider";

const provider = createClientUPProvider(); // Create provider instance

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App provider={provider} />
    </BrowserRouter>
  </React.StrictMode>
);
