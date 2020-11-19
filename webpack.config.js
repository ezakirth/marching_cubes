const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // Require  html-webpack-plugin plugin
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

let config = {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader", // compiles Sass to CSS, using Node Sass by default
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader",
          },
        ],
      },
      {
        test: /\.(frag|vert|glsl)$/,
        use: ["raw-loader"],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js"],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.join(__dirname, "dist"),
  },
  // npx webpack-dev-server
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3000,
    //    hotOnly: true
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
};

let main = Object.assign({}, config, {
  name: "main",
  entry: "./src/main.js",
  plugins: [
    // Array of plugins to apply to build chunk
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: __dirname + "/src/index.html",
      inject: "body",
    }),
    new CopyPlugin([
      {
        context: "post_install/common/",
        from: "**/*",
        to: "./",
      },
    ]),
    new webpack.HotModuleReplacementPlugin(),
  ],
});

module.exports = [main];
