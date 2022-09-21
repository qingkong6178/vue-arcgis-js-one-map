'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
/************    ArcGIS打包wasm文件    *************/
///Author:YN
///Time:2020.03.25
// const WasmModuleWebpackPlugin = require('wasm-module-webpack-plugin');
const BabelPlugin = require('./babel-plugin');
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

// const createLintingRule = () => ({
//   test: /\.(js|vue)$/,
//   loader: 'eslint-loader',
//   enforce: 'pre',
//   include: [resolve('src'), resolve('test')],
//   options: {
//     formatter: require('eslint-friendly-formatter'),
//     emitWarning: !config.dev.showEslintErrorsInOverlay
//   }
// })

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    modules: ["../node_modules/"],
    extensions: [".ts", ".tsx", ".js", ".vue", ".scss", ".css"],// extensions:['.js', '.vue', '.json',".ts", ".tsx",".scss", ".css" ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      //引入NPM导入的Dojo原始包
      dojo: path.resolve(__dirname, "../node_modules/dojo"),
      dijit: path.resolve(__dirname, "../node_modules/dijit"),
      dojox: path.resolve(__dirname, "../node_modules/dojox"),
      dstore: path.resolve(__dirname, "../node_modules/dojo-dstore"),
      esri: path.resolve(__dirname, "../node_modules/arcgis-js-api"),
      moment$: path.resolve("node_modules/moment/moment")
    }
  },
  module: {
    rules: [
      // ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')],
        options:{
          presets:[
            '@babel/preset-env' //使用这个预设，会根据浏览器来选择插件转化ES5
        ]}
      },
      /************    ArcGIS打包wasm文件    *************/
      ///Author:YN
      ///Time:2020.03.25
      // {
      //   test: /\.m?js$/,
      //   exclude: /(node_modules|bower_components)/,
      //   include: [ path.join(process.cwd(), './node_modules/{wasm_module_name}') ],
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env'],
      //       plugins: [ '@babel/plugin-syntax-dynamic-import', WasmModuleWebpackPlugin.BabelPlugin ]
      //     }
      //   }
      // },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [ path.join(process.cwd(), './node_modules/arcgis-js-api/geometry/support/pe-wasm.js') ],
        options: {
          plugins: [ BabelPlugin ],
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [ path.join(process.cwd(), './node_modules/arcgis-js-api/libs/draco/draco_decoder.js') ],
        options: {
          plugins: [ BabelPlugin ],
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: false }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // limit: 10000,
          esModule: false,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf|wsv|svg|pbf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              alias: {
                "../fonts/bootstrap": "bootstrap-sass/assets/fonts/bootstrap"
              }
            }
          },
          {
            loader: "sass-loader",
            options: {
              includePaths: [
                path.resolve("./node_modules/bootstrap-sass/assets/stylesheets")
              ]
            }
          }
        ]
      },
       // @dojo modules are referenced in the API and need to be loaded via a umd loader
       {
        test: /@dojo/,
        use: "umd-compat-loader"
      },
      {
        // scoped to the arcgis-js-api resources only
        test: /arcgis-js-api\/.*(jpe?g|png|gif|webp)$/,
        loader: "url-loader",
        options: {
          // Inline files smaller than 10 kB (10240 bytes)
          limit: 10 * 1024
        }
      },
      {
        // scoped to the arcgis-js-api resources only
        test: /arcgis-js-api\/.*(wsv|ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "build/[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  node: {
    process: false,
    global: false,
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  mode: process.env.NODE_ENV
}
