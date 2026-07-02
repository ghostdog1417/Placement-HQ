import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { RootWithAuth } from "./routes/__root";
import "./styles.css";

const router = getRouter();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootWithAuth>
      <RouterProvider router={router} />
    </RootWithAuth>
  </React.StrictMode>,
);
