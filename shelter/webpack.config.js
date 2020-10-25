const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const OptimizeAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const styleLoaders = (extendedLoader) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev,
        reloadAll: true,
      }
    },
    'css-loader'
  ]

  if (extendedLoader)
    loaders.push(extendedLoader)

  return loaders
}

const optimizations = () => {
  const config = {
    chunkIds: false,
    splitChunks: {
      chunks: 'all',
    },
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
  entry: {
    main: ['@babel/polyfill', './pages/main/app.js'],
    'our-pets': ['@babel/polyfill', './pages/our-pets/app.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (chunk) => `pages/[name]/index${isDev ? '' : '.[contenthash]'}.js`,
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
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
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|svg|ico)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'assets/images/shared',
            publicPath: '../../assets/images/shared'
          }
        }
      },
      {
        test: /\.(woff(2)?|ttf|eot)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'assets/fonts',
            publicPath: '../../assets/fonts'
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
      template: 'pages/main/index.html',
      filename: 'pages/main/index.html',
      minify: isProd,
      favicon: 'assets/images/icons/favicon.ico'
    }),
    new HTMLWebpackPlugin({
      template: 'pages/our-pets/index.html',
      filename: 'pages/our-pets/index.html',
      minify: isProd,
      favicon: 'assets/images/icons/favicon.ico'
    }),
    new MiniCssExtractPlugin({
      filename: `pages/[name]/style${isDev ? '' : '.[contenthash]'}.css`,
    }),
  ]
}