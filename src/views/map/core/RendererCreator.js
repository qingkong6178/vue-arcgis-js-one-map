var RendererCreator={};
init();
function init(){
    require(["esri/renderers/smartMapping/creators/type", "esri/renderers/smartMapping/creators/color","esri/renderers/support/jsonUtils"],function(typeRendererCreator,colorRendererCreator,rendererJsonUtils){      
        RendererCreator.typeRendererCreator=typeRendererCreator;
        RendererCreator.colorRendererCreator=colorRendererCreator;   
        RendererCreator.rendererJsonUtils=rendererJsonUtils    
    });
}
export default RendererCreator;