var WatchUtils={};
init();
function init(){
    require(["esri/core/watchUtils"],function(watchUtils){      
        WatchUtils.watchUtils=watchUtils;
    });
}
export default WatchUtils;