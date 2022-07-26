/*arcgis plugin的config设置*/
var selectedLanguage = "zh-CN";//en

function getConfig(env) {
 
  var loaderConfig = {
    baseUrl: ".",
    locales: selectedLanguage,
    packages: [
      {
        name: "esri",
        location: env.root + "/arcgis-js-api",
        main: "kernel"
      },
     {
        name: "dojo",
        location: env.root + "/dojo",
        lib: "."
      },
      {
        name: "dojox",
        location: env.root + "/dojox",
        lib: "."
      },
      {
        name:"dojo-dstore",// "dstore",
        location: env.root +"/dojo-dstore",
        lib: "."
      },
      // {
      //   name: "moment",
      //   location: env.root + "/moment",
      //   lib: "."
      // },
      {
        name: "@dojo",
        location: env.root + "/@dojo",
        lib: "."
      },

      {
        name: "cldrjs",
        location: env.root + "/cldrjs",
        main: "dist/cldr"
      },
      {
        name: "globalize",
        location: env.root + "/globalize",
        main: "dist/globalize"
      },
      {
        name: "dijit",
        location: env.root + "/dijit",
        lib: "."
      },
      
      {
        name: "maquette",
        location: env.root + "/maquette",
        main: "dist/maquette.umd",
        resourceTags: {
          miniExclude: function (filename, mid) {
            return (
              mid.indexOf("/polyfills/") > -1 ||
              (mid.indexOf("/dist/") > -1 &&
                filename.indexOf(".umd.js") === -1)
            );
          }
        }
      },
      {
        name: "maquette-css-transitions",
        location: env.root + "/maquette-css-transitions",
        main: "dist/maquette-css-transitions.umd",
        resourceTags: {
          miniExclude: function (filename, mid) {
            return (
              mid.indexOf("/dist/") > -1 && filename.indexOf(".umd.js") === -1
            );
          }
        }
      },
      {
        name: "maquette-jsx",
        location: env.root + "/maquette-jsx",
        main: "dist/maquette-jsx.umd",
        resourceTags: {
          miniExclude: function (filename, mid) {
            return (
              mid.indexOf("/dist/") > -1 && filename.indexOf(".umd.js") === -1
            );
          }
        }
      },
      {
        name: "tslib",
        location: env.root + "/tslib",
        main: "tslib"
      }
    ],
    map: {
      globalize: {
        cldr: "cldrjs/dist/cldr",
        "cldr/event": "cldrjs/dist/cldr/event",
        "cldr/supplemental": "cldrjs/dist/cldr/supplemental",
        "cldr/unresolved": "cldrjs/dist/cldr/unresolved"
      }
    },
    async: true,
    has: {
      // "config-deferredInstrumentation": 1,//
      "dojo-config-api": 0, // Don't need the config API code in the embedded Dojo loader
      "esri-promise-compatibility": 1,
      "esri-webpack": 1,
      "esri-featurelayer-webgl": 1 //后加入的
    }
  };   
  return loaderConfig;
}

if (typeof module !== "undefined" && module) {
  module.exports = getConfig; 
} else {
	// No webpack.  This script was loaded by page via script tag, so load Dojo from CDN
	getConfig({dojoRoot: '//ajax.googleapis.com/ajax/libs/dojo/1.14.0'});
}
