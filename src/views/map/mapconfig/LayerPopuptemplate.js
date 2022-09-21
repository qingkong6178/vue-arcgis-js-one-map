// 单点查询的信息模板
import axios from "axios"
function setPopuptemplate(checked,mapview){ //清除单点查询
  if(checked){
    document.documentElement.style.cursor = 'pointer';
  }else{
    document.documentElement.style.cursor = '';
    mapview.popup.close();
  }
  let layers = mapview.map.allLayers.items.filter((layer)=>layer.type=="feature" || layer.type=="csv")
  let mapImageLayers = mapview.map.allLayers.items.filter((layer)=>layer.type=="map-image"||layer.type=="tile")
  setLayerPopuptemplate(layers,checked,"feature")
  mapImageLayers.map((layer)=>{
    setLayerPopuptemplate(layer.sublayers.items,checked,"map-image")
  })
}
function setLayerPopuptemplate(layers,plugchecked,type){
  for(let i = 0; i <layers.length; i++){
    if(plugchecked){
      if(type=="feature"||type=="csv"){
        layers[i].popupTemplate=getPopuptemplate(layers[i]);
      }else{
        getSublayerInfo(layers[i]);
      }
    }else{
      layers[i].popupTemplate=null;
    }
  }
}
function getPopuptemplate(layer){//获取popuptemplate模板
  let layerPopuptemplate={
      title:layer.title,
      content:[{
          type:"fields",
          fieldInfos:layer.fields.map(field=>{
            return {
                fieldName:field.name,
                label: field.alias
            }
          })
        }
      ]
   };
  return layerPopuptemplate;
}
function getSublayerInfo(layer){//获取popuptemplate模板
  axios({
    method:"get",
    url:`${layer.url}?f=pjson`,
  }).then((response)=> {
      if(response.status==200){
        let fields=response.data.fields.filter(field=>field.type!="esriFieldTypeGeometry")
        getSublayerPopuptemplate(layer,fields)
      }
  })
}
function getSublayerPopuptemplate(layer,fields){
  layer.popupTemplate={
    title:layer.title,
    content:[{
        type:"fields",
        fieldInfos:fields.map(field=>{
          return {
              fieldName: field.name,
              label: field.alias
          }
        })
      }]
  };
}
export default {
  setPopuptemplate,
  setLayerPopuptemplate,
}
