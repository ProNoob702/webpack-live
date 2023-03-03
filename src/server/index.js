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
function handleRender(initialData) {
  const { username, title, description } = initialData;

  const component = ReactDOMServer.renderToString(<App username={username} title={title} description={description} />);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">

      <title>${title}</title>
      <meta name="description" content="${description}">

      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
            "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;

          text-align: center;

          /* Background color to go to page edge. */
          margin: 0;
        }

        body > * {
          padding-left: 15px;
          padding-right: 15px;
        }
      </style>

      <script>
        window.__INITIAL__DATA__ = ${JSON.stringify(initialData)};
      </script>
      <link rel="stylesheet" href="main.css">
    </head>

    <body>
      <div id="root">${component}</div>
      <script defer src="main.js"></script>
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
  const finalHtml = handleRender(initialData);
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
