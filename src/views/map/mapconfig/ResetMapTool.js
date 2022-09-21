import myconfig from "./myconfig"
import measurement from "../widgets/measurement";
function clearExportMapMark(){//清除成果输出的掩膜
  let parentDiv = document.getElementById("gtkjghMyMap")
  let childDiv = document.getElementById("gtkjghExportMapByExtent")
  if(childDiv){
    parentDiv.removeChild(childDiv)
  }
}
function clearMap(mapview){//清除地图绘制，事件等
  mapview.graphics.removeAll();
  let groupLayers = mapview.map.layers.items.filter((layer)=>layer.type=="graphics" && !layer.id.includes("myplotting"));
  groupLayers.forEach((layer)=>{
    layer.graphics.removeAll()
  })
  document.documentElement.style.cursor = ''
  myconfig.removeMapEvent()
}
function clearMeasure(id,id2,mapview){//清除测量绘制
  if(document.getElementById(id)||document.getElementById(id2)){
    measurement.clearMeasure(null,this.mapview,document.getElementById(id))
  }
  let draw = myconfig.map2DWidget.editableWidget.find(item=>item.name=="line_measure")
  draw.obj.complete()
  mapview.graphics.removeAll();
}
export default {
  clearExportMapMark,
  clearMap,
  clearMeasure
}
