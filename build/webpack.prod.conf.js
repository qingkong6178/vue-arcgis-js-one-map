'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/************    ArcGIS打包wasm文件    *************/
///Author:YN
///Time:2020.03.25
const WasmPlugin = require('./WasmPlugin');
/************    ArcGIS打包wasm文件    *************/

const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const ArcGISPlugin = require("@arcgis/webpack-plugin");
const HasJsPlugin = require("webpack-hasjs-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

const env = require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    publicPath: config.build.assetsPublicPath,//'./',//'/myMapApplication/',// publicPath: './',
    path: config.build.assetsRoot,
    filename:'static/js/[name].[contenthash].js', // 这里占位符 [name] 就是 entry 配置的 key 值// utils.assetsPath("js/[name].[chunkhash].js"),
    chunkFilename:'static/js/[name].[contenthash].js',//utils.assetsPath("js/[id].[chunkhash].js")
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({}),
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: config.build.index,
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      favicon: './favicon.ico',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'none'
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      // // {
      // //   from: path.resolve(__dirname, "../static"),
      // //   to: config.build.assetsSubDirectory,
      // //   ignore: [".*"]
      // // },
      // {
      //   context: "node_modules",
      //   from: "dojo/resources/blank.gif",
      //   to: "dojo/resources"
      // },
      // {
      //   context: "node_modules",
      //   from: "@arcgis/webpack-plugin/extras/dojo/",
      //   to: "dojo/"
      // },
      // {
      //   context: "node_modules",
      //   from: "@arcgis/webpack-plugin/extras/dojo/dojo.js",
      //   to: "dojo/dojo-lite.js"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/images/",
      //   to: "arcgis-js-api/images/"
      // },
      // // {
      // //   context: "node_modules",
      // //   from: "arcgis-js-api/core/request/iframe.html",
      // //   to: "arcgis-js-api/core/request/iframe.html"
      // // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/views/3d/environment/resources/stars.wsv",
      //   to: "arcgis-js-api/views/3d/environment/resources/stars.wsv"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/geometry/support/pe-wasm.wasm",
      //   to: "arcgis-js-api/geometry/support/pe-wasm.wasm"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/themes/base/images/",
      //   to: "arcgis-js-api/themes/base/images/"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/images/",
      //   to: "arcgis-js-api/images/"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/workers/",
      //   to: "arcgis-js-api/workers/"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/core/workers/",
      //   to: "arcgis-js-api/core/workers/"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/views/2d/layers/features/",
      //   to: "arcgis-js-api/views/2d/layers/features/"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/layers/graphics/sources/support/",
      //   to: "arcgis-js-api/layers/graphics/sources/support/"
      // },
      // // charts libs and locale
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/libs/amcharts4/",
      //   to: "esri/libs/amcharts4/"
      // },
      // // Copy the moment locales
      // // so they can be dynamically loaded
      // {
      //   context: "node_modules",
      //   from: "moment/locale/",
      //   to: "moment/locale/"
      // },
      // // geometry engine worker
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/geometry/geometryenginewebworker.js",
      //   to: "arcgis-js-api/geometry/geometryenginewebworker.js"
      // },
      // {
      //   context: "node_modules",
      //   from: "arcgis-js-api/",
      //   to: "arcgis-js-api/"
      // },
      // {
      //   context: "node_modules",
      //   from: "dojo-dstore/",
      //   to: "dojo-dstore/"
      // }
      // // {
      // //   context: "node_modules",
      // //   from: "dojo-webpack-plugin/",
      // //   to: "dojo-webpack-plugin/"
      // // },
    ]),
    new ArcGISPlugin({
      useDefaultAssetLoaders: false,
      root: "../",//"myMapApplication",
      loaderConfig: require.resolve("../src/config/esriconfig")
    }),
    new HasJsPlugin({
      features: {
        "some-static-feature": false
      }
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: "[name].css",
      chunkFilename: "[id].css",
      // ignoreOrder: false // Enable to remove warnings about conflicting order
    }),
     // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    new webpack.ContextReplacementPlugin(
      /moment[/\\\\]locale$/,
      /zh-cn|es|zh-tw|ja/
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^dojox\/gfx\/renderer!/,
      "dojox/gfx/svg"
    ),
    new webpack.NormalModuleReplacementPlugin(/\/moment!/, "moment/moment"),
    // Ignore all locale files of moment.js
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    /************    ArcGIS打包wasm文件    *************/
    ///Author:YN
    ///Time:2020.03.25
    // new WasmModuleWebpackPlugin.WebpackPlugin(),
    new WasmPlugin()
    /************    ArcGIS打包wasm文件    *************/
  ],
  // 与plugins同级
  optimization: {
    splitChunks: {
      chunks: "async", //"all",//"async",
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    // runtimeChunk: { name: "runtime" }
  },
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
