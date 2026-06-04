import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

// 1. Cambiamos la importación a HashRouter
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. Usamos HashRouter en lugar de BrowserRouter */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
