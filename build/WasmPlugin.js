// webpack-plugin
///ArcGIS Api打包加载wasm
///Author:GBH
///Time:2020.03.25
const eventEmitter = require('./event-listener');
const path = require('path');
let midPath = "geometry/support/"

class WasmPlugin {
  apply(compiler) {
    compiler.plugin('emit', function(compilation, callback) {
      for (const i in eventEmitter.data) {
        for (const j in eventEmitter.data[i]) {
          const filePath = path.join(eventEmitter.data[ i ][ j ],j);// '.' + j);
          const content = compiler.inputFileSystem._readFileSync(filePath);
          const stat = compiler.inputFileSystem._statSync(filePath);
          const wasmRefPath = j;
          const wasmName = wasmRefPath.substring(0, wasmRefPath.length);
          if(wasmName.includes("draco_decoder")){
            midPath = "libs/draco/"
          }else{
            midPath = "geometry/support/"
          }
          compilation.assets["../arcgis-js-api/" + midPath + wasmName] = {
            size() {
              return stat.size;
            },
            source() {
              return content;
            },
          };
        }
      }
      callback();
    });
  }
}

module.exports = WasmPlugin;
