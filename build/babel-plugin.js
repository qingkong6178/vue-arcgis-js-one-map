// babel-plugin.js
///ArcGIS Api打包加载wasm
///Author:GBH
///Time:2020.03.25
const eventEmitter = require('./event-listener');
const pathInternal = require('path');
let file_Name='pe-wasm.wasm';

module.exports = function() {
    return {
      visitor: {
        CallExpression(path, state) {
          if(path.node.callee.name === 'fetch'){
            const argument = JSON.parse(JSON.stringify(path.node.arguments[0]));
            // for (const i in argument.right) {
            //   console.log(123);
              // if (i === 'value' && argument.right[i].endsWith('.wasm')) {
                // console.log('argument.right[ i ]', argument.right[ i ], 'state.file.opts.filename', state.file.opts.filename);
                if(state.file.opts.filename.includes("draco_decoder")){
                  file_Name='draco_decoder.wasm';
                }else {
                  file_Name='pe-wasm.wasm';
                }
                console.log('wasmRefPath', file_Name, '\r\nwasmRefFileName', state.file.opts.filename,'\r\nwasmDir', pathInternal.parse(state.file.opts.filename).dir);
                eventEmitter.emit('wasm', {
                  wasmRefPath: file_Name,//argument.right[i],
                  wasmRefFileName: state.file.opts.filename,
                  wasmDir: pathInternal.parse(state.file.opts.filename).dir,
                });
              // }
            // }
          }
        },
      }
    }
  };
