import React from "react";
import App from "./app";
import "./index.scss";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(document.querySelector("#root"), <App />);
