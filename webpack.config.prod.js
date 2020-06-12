const BundleTracker = require('webpack-bundle-tracker');
const CompressionPlugin = require('compression-webpack-plugin');

const {
  resolve,
  entry,
  plugins,
  rules,
  optimization,
} = require('./webpack.config.common');

const output = {
  path: resolve('dist'),
  filename: '[name].[contenthash].js',
  chunkFilename: '[id].[contenthash].js',
  // put here your public url
  publicPath: resolve('dist'),
};

const bundleTrackerPlugin = new BundleTracker({
  filename: 'webpack-bundle.json',
});
const compressionPlugin = new CompressionPlugin({
  test: /\.(js|css|html|svg)$/,
  algorithm: 'gzip',
  compressionOptions: { level: 9 },
  filename: '[path].gz[query]',
  minRatio: 0.8,
});

const resolve_obj = {
  alias: {},
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
};

const config = {
  entry,
  output,
  module: {
    rules,
  },
  optimization,
  plugins: [bundleTrackerPlugin].concat(plugins).concat(compressionPlugin),
  resolve: resolve_obj,
};

module.exports = config;
