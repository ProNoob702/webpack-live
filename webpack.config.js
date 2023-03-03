const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DotenvPlugin = require("dotenv-webpack");
const LoadablePlugin = require("@loadable/webpack-plugin");
const nodeExternals = require("webpack-node-externals");

const isDev = () => process.env.NODE_ENV != "production";
const _isDev = isDev();

const getPath = (...args) => path.resolve(process.cwd(), ...args);

//#region =============== FRONTEND ===============

const getFrontendPlugins = () => {
  const plugins = [
    new LoadablePlugin({ filename: "stats.json", writeToDisk: true }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new DotenvPlugin(),
  ];

  return plugins;
};

const getStyleLoaders = () => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    {
      loader: "css-loader",
      options: {
        sourceMap: _isDev,
      },
    },
    {
      loader: "sass-loader",
      options: { sourceMap: !_isDev },
    },
  ];
  return loaders;
};

const getFrontendModuleRules = () => {
  return [
    {
      test: /\.(js|jsx|ts|tsx)?$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
      },
    },
    {
      test: /\.(s(a|c)ss)$/,
      exclude: /node_modules/,
      use: getStyleLoaders(),
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf)$/i,
      type: "asset/resource",
    },
  ];
};

const frontendConfig = {
  target: "web",
  mode: isDev ? "development" : "production",
  devtool: "source-map",
  entry: [
    "@babel/polyfill", // enables async-await
    path.resolve(__dirname, "src/client/index.js"),
  ],
  output: {
    // filename: "bundle.js",
    path: path.resolve(__dirname, "dist/public"),
    filename: _isDev ? "[name].js" : "[name].[contenthash:8].js",
  },
  plugins: getFrontendPlugins(),
  module: {
    rules: getFrontendModuleRules(),
  },
  devServer: {
    contentBase: path.join(__dirname, "/public"), // serve your static files from here
    watchContentBase: true, // initiate a page refresh if static content changes
    proxy: [
      // allows redirect of requests to webpack-dev-server to another destination
      {
        context: ["/api", "/auth"], // can have multiple
        target: "http://localhost:8080", // server and port to redirect to
        secure: false,
      },
    ],
    port: 3030, // port webpack-dev-server listens to, defaults to 8080
    overlay: {
      // Shows a full-screen overlay in the browser when there are compiler errors or warnings
      warnings: false, // defaults to false
      errors: false, // defaults to false
    },
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ["*", ".ts", ".tsx", ".js", ".jsx"],
  },
};

//#endregion =============== / FRONTEND ===============

//#region =============== Backend ===============

const getBackendPlugins = () => {
  const plugins = [new DotenvPlugin()];
  return plugins;
};

const getBackendModuleRules = () => {
  return [
    {
      test: /\.(js|jsx|ts|tsx)?$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
      },
    },
    {
      test: /\.(s(a|c)ss)$/,
      exclude: /node_modules/,
      use: "ignore-loader",
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf)$/i,
      type: "asset/resource",
    },
  ];
};

const backendConfig = {
  target: "node",
  mode: isDev ? "development" : "production",
  node: {
    __dirname: true,
    __filename: true,
  },
  externals: [nodeExternals()],
  entry: {
    main: getPath("src/server/index.js"),
  },
  output: {
    path: getPath("dist"),
    filename: "index.js",
  },
  plugins: getBackendPlugins(),
  module: {
    rules: getBackendModuleRules(),
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ["*", ".ts", ".tsx", ".js", ".jsx"],
  },
};

//#endregion =============== / Backend ===============

module.exports = [backendConfig, frontendConfig];
