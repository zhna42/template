const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const HtmlCriticalWebpackPlugin = require("html-critical-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";
const isHash = false;

const devServerConfig = {
  contentBase: path.resolve(__dirname, "./dist"),
  stats: "errors-only",
  host: "192.168.0.105",
  open: true,
  hot: true,
  port: 80
};

const jsLoader = {
  test: /\.js$/,
  use: isProd => {
    if(isProd) return ["babel-loader", "eslint-loader"];
    else return ["eslint-loader"];
  },
  exclude: /node_modules/
};

const htmlLoader = {
  test: /\.(html)$/,
  use: [
    {
      loader: "html-loader",
      options: {
        interpolate: true,
        minimize: false
      }
    }
  ]
};

const scssLoader = {
  test: /\.scss$/,
  use: isProd ? ["style-loader", MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"] : ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
};

const imgLoader = {
  test: /\.(png|svg|jpg|gif)$/,
  use: [
    {
      loader: "url-loader",
      options: {
        limit: 1,
        name: "./img/[hash].[ext]" 
      }
    }
  ]
};

const fontLoader = {
  test: /\.(woff|woff2|eot|ttf)$/, 
  loader: "file-loader",
  options: {
    name: "[name].[ext]",
    outputPath: "fonts/"
  }
};

let plugins = [
  new StyleLintPlugin({"extends": "stylelint-config-standard"}),
  new HtmlWebpackPlugin({template: "./app/index.html"}),
];

if(isProd){
  plugins.push(
    new HtmlWebpackPlugin({template: "./app/index.html"}),
    new MiniCssExtractPlugin({filename: isHash ? "style.[contenthash].css" : "style.css"}),
    new HtmlCriticalWebpackPlugin({
      base: path.resolve(__dirname, "dist"),
      src: "index.html",
      dest: "index.html",
      inline: true,
      minify: true,
      extract: true,
      width: 1920,
      height: 1080,
      penthouse: {
        blockJSRequests: false,
      }
    })
  );
}else{
  plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
}


module.exports = {
  mode: isProd ? "production" : "development",
  entry: { 
    main: "./app/entry.js" 
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: isHash ? "[hash].main.js" : "main.js"
  },
  devServer: devServerConfig,
  module: {
    rules: [jsLoader, htmlLoader, scssLoader, imgLoader, fontLoader]
  },
  plugins: plugins
};