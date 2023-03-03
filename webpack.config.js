const webpack = require("webpack");
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
    new webpack.EnvironmentPlugin({ ...process.env }),
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
    publicPath: "/",
  },
  plugins: getFrontendPlugins(),
  module: {
    rules: getFrontendModuleRules(),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    proxy: [
      // allows redirect of requests to webpack-dev-server to another destination
      {
        context: ["/api", "/auth"], // can have multiple
        target: `http://localhost:${process.env.SERVER_PORT}`,
        secure: false,
      },
    ],
    port: process.env.CLIENT_PORT,
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ["*", ".ts", ".tsx", ".js", ".jsx"],
  },
};

//#endregion =============== / FRONTEND ===============

//#region =============== Backend ===============

const getBackendPlugins = () => {
  const plugins = [new webpack.EnvironmentPlugin({ ...process.env }), new DotenvPlugin()];
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
