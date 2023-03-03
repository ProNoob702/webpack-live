const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DotenvPlugin = require("dotenv-webpack");
const LoadablePlugin = require("@loadable/webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const isDev = () => process.env.NODE_ENV != "production";
const _isDev = isDev();

const getPath = (...args) => path.resolve(process.cwd(), ...args);

//#region =============== FRONTEND ===============

const getFrontendMinimizers = () => {
  return [
    new TerserPlugin({
      parallel: true,
      extractComments: false,
      minify: TerserPlugin.uglifyJsMinify,
      terserOptions: {
        compress: {
          drop_console: true,
        },
        mangle: true,
      },
    }),
    new CssMinimizerPlugin({
      minimizerOptions: {
        preset: [
          "default",
          {
            discardComments: { removeAll: true },
          },
        ],
      },
    }),
  ];
};

const getFrontendOptimization = () => {
  if (_isDev) return undefined;
  return {
    minimize: true,
    minimizer: getFrontendMinimizers(),
    splitChunks: {
      chunks: "all",
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
  };
};

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
  mode: _isDev ? "development" : "production",
  devtool: _isDev ? "cheap-module-source-map" : false,
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
  optimization: getFrontendOptimization(),
  resolve: {
    modules: ["node_modules"],
    extensions: ["*", ".ts", ".tsx", ".js", ".jsx"],
  },
};

//#endregion =============== / FRONTEND ===============

//#region =============== Backend ===============

const getBackendOptimization = () => {
  if (_isDev) return undefined;
  return {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        minify: TerserPlugin.uglifyJsMinify,
        terserOptions: {
          compress: {
            drop_console: true,
          },
          mangle: true,
        },
      }),
    ],
  };
};

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
  mode: _isDev ? "development" : "production",
  devtool: _isDev ? "cheap-module-source-map" : false,
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
  optimization: getBackendOptimization(),
};

//#endregion =============== / Backend ===============

module.exports = [backendConfig, frontendConfig];
