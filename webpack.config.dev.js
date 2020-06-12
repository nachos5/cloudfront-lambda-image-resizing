const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const BundleTracker = require('webpack-bundle-tracker');

const {
  entry,
  plugins,
  rules,
  optimization,
} = require('./webpack.config.common');

const output = {
  publicPath: 'http://localhost:9000/',
};

const devServer = {
  contentBase: 'dist',
  port: 9000,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  compress: true,
  hot: true,
};

const devPlugins = [
  new BundleTracker({ filename: 'webpack-bundle.json' }),
  new BundleAnalyzerPlugin(),
];

const resolve = {
  alias: {},
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
};

const config = {
  entry,
  output,
  devServer,
  module: {
    rules,
  },
  optimization,
  plugins: devPlugins.concat(plugins),
  resolve,
};

module.exports = config;
