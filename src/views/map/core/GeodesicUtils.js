var GeodesicUtils={};
init();
function init(){
    require(["esri/geometry/support/geodesicUtils"],function(geodesicUtils){      
        GeodesicUtils.geodesicUtils=geodesicUtils;
    });
}
export default GeodesicUtils;