
"use strict";
const utils = require("./utils");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const path = require("path");
const baseWebpackConfig = require("./webpack.base.conf");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const portfinder = require("portfinder");

const HOST = process.env.HOST;
const PORT = process.env.PORT && Number(process.env.PORT);

const ArcGISPlugin = require("@arcgis/webpack-plugin");
var HasJsPlugin = require("webpack-hasjs-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require("vue-loader");

/************    ArcGIS打包wasm文件    *************/
///Author:YN
///Time:2020.03.25
// const WasmPlugin = require('./WasmPlugin');
/************    ArcGIS打包wasm文件    *************/
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true
    })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: "warning",
    historyApiFallback: {
      rewrites: [
        {
          from: /.*/,
          to: path.posix.join(config.dev.assetsPublicPath, "index.html")
        }
      ]
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": require("../config/dev.env")
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),

    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
      inject: true,
      favicon: './favicon.ico'
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      // // {
      // //   from: path.resolve(__dirname, "../static"),
      // //   to: config.dev.assetsSubDirectory,
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
      //   from: "arcgis-js-api/",
      //   to: "arcgis-js-api/"
      // },
      // {
      //   context: "node_modules",
      //   from: "dojo-dstore/",
      //   to: "dojo-dstore/"
      // }
    ]),
    new ArcGISPlugin({
      useDefaultAssetLoaders: false,
      root: "..",
      loaderConfig: require.resolve("../src/config/esriconfig")
    }),
    // new ArcGISPlugin({
    //   useDefaultAssetLoaders: false,
    //   loaderConfig: require.resolve("../src/map/Esri/workerconfig")
    // }),
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
      ignoreOrder: false // Enable to remove warnings about conflicting order
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
    
    /************    ArcGIS打包wasm文件    *************/
    ///Author:YN
    ///Time:2020.03.25
    // new WasmModuleWebpackPlugin.WebpackPlugin(),
    // new WasmPlugin()
    /************    ArcGIS打包wasm文件    *************/
  ]
});

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port;
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err);
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port;
      // add port to devServer config
      devWebpackConfig.devServer.port = port;

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [
              `Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`
            ]
          },
          onErrors: config.dev.notifyOnErrors
            ? utils.createNotifierCallback()
            : undefined
        })
      );

      resolve(devWebpackConfig);
    }
  });
});
