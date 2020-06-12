require('dotenv').config();

const path = require('path');

const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const resolve = path.resolve.bind(path, __dirname);

const dev = process.env.NODE_ENV !== 'production';

const entry = {
  index: './src/index.ts',
};

const plugins = [
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin({
    filename: dev ? '[name].css' : '[name].[contenthash].css',
    chunkFilename: dev ? '[id].css' : '[id].[contenthash].css',
    ignoreOrder: false,
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
const stylesRule = {
  test: /\.(sa|sc|c)ss$/,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: function () {
          return [autoprefixer];
        },
      },
    },
    'sass-loader',
  ],
};
const filesRule = {
  test: /\.(eot|otf|png|svg|jpg|ttf|woff|woff2)(\?v=[0-9.]+)?$/,
  loader: dev
    ? 'file-loader?name=[name].[ext]'
    : 'file-loader?name=[name].[hash].[ext]',
};
const rules = [jsRule, tsRule, stylesRule, filesRule];

const optimization = {
  minimize: !dev,
  minimizer: [
    new TerserJSPlugin({
      terserOptions: { output: { comments: false } },
      extractComments: false,
    }),
    new OptimizeCssAssetsPlugin({
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
    }),
  ],
  removeAvailableModules: false,
  splitChunks: {
    chunks: 'async',
    minSize: 30000,
    maxSize: 0,
    minChunks: 1,
    maxAsyncRequests: 6,
    maxInitialRequests: 4,
    automaticNameDelimiter: '~',
    cacheGroups: {
      defaultVendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      },
    },
  },
};

module.exports = {
  resolve,
  entry,
  plugins,
  rules,
  optimization,
};
