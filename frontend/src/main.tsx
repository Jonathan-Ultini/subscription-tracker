import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./App";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);
