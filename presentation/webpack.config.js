const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

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
    writeToDisk: false,
  },
  mode: process.env.NODE_ENV,
  devtool: isDev ? 'source-map' : false,
  module: {
    rules: [{
        test: /\.html$/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|svg|ico|ttf|eot|woff)$/,
        use: {
          loader: 'file-loader',
        },
      },
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue$': 'vue/dist/vue.esm.js',
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: 'index.html',
      favicon: './favicon.png',
      minify: isProd,
    }),
    new MiniCssExtractPlugin({
      filename: `style${isProd ? '.[contenthash]' : ''}.css`,
    }),
  ]
}