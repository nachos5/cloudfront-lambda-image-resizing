require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const isDev = process.env.NODE_ENV === 'development';

const resolve = path.resolve.bind(path, __dirname);

const entry = {
  'origin-response': './src/origin-response.ts',
  'viewer-request': './src/viewer-request.ts',
};

const output = {
  path: resolve('dist'),
  filename: '[name]/index.js',
  library: 'cloudfront-lambda-image-resizing',
  libraryTarget: 'umd',
};

const plugins = [
  new webpack.DefinePlugin({
    BUCKET: '"' + process.env.BUCKET + '"',
    INFO_LOG: process.env.INFO_LOG === 'true',
  }),
];

const jsRule = {
  test: /\.j(s|sx)$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
};
const tsRule = {
  test: /\.t(s|sx)$/,
  exclude: /node_modules/,
  loader: 'ts-loader',
};
const rules = [jsRule, tsRule];

const resolve_obj = {
  alias: {},
  extensions: ['.js', '.ts'],
};

const config = {
  mode: isDev ? 'development' : 'production',
  target: 'node',
  name: 'cloudfront-lambda-image-resizing',
  entry,
  output,
  // devtool: 'eval',
  module: { rules },
  plugins,
  resolve: resolve_obj,
  externals: [nodeExternals()],
};

module.exports = config;
