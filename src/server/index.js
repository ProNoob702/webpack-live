import express from "express";
import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../client/app";
import { ChunkExtractor } from "@loadable/server";

const app = express();

app.get("/", (_req, res) => {
  const initialData = {
    username: "shit",
    title: "React SSR Quickstart",
    description: "Starter template for server-side and client-side rendering of a React app",
  };

  const statsFile = path.resolve(process.cwd(), "dist/public/stats.json");
  const extractor = new ChunkExtractor({ statsFile });
  const node = <App username={initialData.username} title={initialData.title} description={initialData.description} />;
  const jsx = extractor.collectChunks(node);
  const nodeAsHtmlStr = ReactDOMServer.renderToString(jsx);
  const finalHtml = handleRender(nodeAsHtmlStr, extractor, initialData);
  res.set("content-type", "text/html");
  res.send(finalHtml);
});

function handleRender(nodeAsHtmlStr, extractor, initialData) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Houma</title>
      <link rel="stylesheet" href="main.css" />
    </head>
    <body>
      <div id="root">${nodeAsHtmlStr}</div>
      <script>
        window.__INITIAL__DATA__ = ${JSON.stringify(initialData)};
      </script>
      <!-- Insert bundled scripts into <script> tag -->
      ${extractor.getScriptTags()}
    </body>
  </html>
  `;
}

// serve public as static files
app.use(express.static(path.join(__dirname, "../../dist/public")));

const port = process.env.SERVER_PORT || 8080;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
