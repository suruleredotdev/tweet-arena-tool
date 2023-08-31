module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: "./index.tsx",
  output: {
    filename: "app.js",
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
};
