const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const OptimizeAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const styleLoaders = (extendedLoader) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    'css-loader'
  ]

  if (extendedLoader)
    loaders.push(extendedLoader)

  return loaders
}

const optimizations = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    },
    chunkIds: false
  }

  if (isProd)
    config.minimizer = [
      new TerserWebpackPlugin(),
      new OptimizeAssetsWebpackPlugin()
    ]

  return config
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: ['@babel/polyfill', './app.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (chunk) => `app${isProd ? '.[contenthash]' : ''}.js`,
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    overlay: true,
    compress: true,
    stats: 'errors-only',
  },
  mode: process.env.NODE_ENV,
  devtool: isDev ? 'source-map' : false,
  optimization: optimizations(),
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
        }
      },
      {
        test: /\.css$/,
        use: styleLoaders()
      },
      {
        test: /\.s[ac]ss$/,
        use: styleLoaders('sass-loader')
      },
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
      {
        test: /\.(jpg|jpeg|png|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'assets/img'
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: 'index.html',
      minify: isProd,
      favicon: './favicon.ico',
    }),
    new MiniCssExtractPlugin({
      filename: `style${isProd ? '.[contenthash]' : ''}.css`,
    }),
    new ESLintPlugin()
  ]
}