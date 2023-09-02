const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: "./index.tsx",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.(png|jpe?g|gif)$/i, loader: "file-loader" },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "/"),
    },
    compress: true,
    port: 8080,
  },
  plugins: [new Dotenv()],
};
