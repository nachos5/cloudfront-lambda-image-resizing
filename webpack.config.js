require('dotenv').config();

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const resolve = path.resolve.bind(path, __dirname);

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter((item) => ['.bin'].indexOf(item) === -1) // exclude the .bin folder
  .forEach((mod) => {
    nodeModules[mod] = 'commonjs ' + mod;
  });

const entry = {
  'origin-response': './src/origin-response.ts',
  'viewer-request': './src/viewer-request.ts',
};

const output = {
  path: resolve('dist'),
  filename: '[name]/index.js',
  publicPath: resolve('dist'),
};

const plugins = [new webpack.DefinePlugin({ BUCKET: process.env.BUCKET })];

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
  target: 'node',
  name: 'cloudfront-lambda-image-resizing',
  entry,
  output,
  module: { rules },
  plugins,
  resolve: resolve_obj,
  externals: nodeModules,
};

module.exports = config;
