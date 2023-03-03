import express from "express";
import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../client/app";

/**
 * Render an HTML page as a string.
 *
 * Don't add whitespace around component in the mountpoint, otherwise a warning
 * appears about a mismatch of content.
 */
function handleRender(nodeAsHtmlStr) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Houma</title>
      <link rel="stylesheet" href="main.css">
    </head>

    <body>
      <div id="root">${nodeAsHtmlStr}</div>
    </body>
  </html>
  `;
}

const app = express();

app.get("/", (_req, res) => {
  const initialData = {
    username: "shit",
    title: "React SSR Quickstart",
    description: "Starter template for server-side and client-side rendering of a React app",
  };

  const nodeAsHtmlStr = ReactDOMServer.renderToString(
    <App username={initialData.username} title={initialData.title} description={initialData.description} />
  );

  const finalHtml = handleRender(nodeAsHtmlStr);
  res.set("content-type", "text/html");
  res.send(finalHtml);
});

// const publicDir = path.resolve(__dirname, "/public");
// app.use("/static", express.static(publicDir));

// serve public as static files
app.use(express.static(path.join(__dirname, "../../dist/public")));

const port = process.env.SERVER_PORT || 8080;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
