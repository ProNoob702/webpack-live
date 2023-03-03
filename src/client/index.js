import React from "react";
import App from "./app";
import { loadableReady } from "@loadable/component";
import { hydrateRoot } from "react-dom/client";
import "./index.scss";

const initial = window.__INITIAL__DATA__;

const render = () => {
  hydrateRoot(
    document.querySelector("#root"),
    <App username={initial.username} title={initial.title} description={initial.description} />
  );
};

loadableReady(render);
