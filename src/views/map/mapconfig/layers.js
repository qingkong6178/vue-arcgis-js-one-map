/*初始化各类型图层*/
import axios from 'axios';
import myconfig from "./myconfig";
import configfunc from "./configfunc";
import projection from "../core/Projection";
import RendererCreator from "../core/RendererCreator";

/*******************引用ArcGIS API For JavaScript******************/
import GroupLayer from "esri/layers/GroupLayer";
import TileLayer from "esri/layers/TileLayer";
import MapImageLayer from "esri/layers/MapImageLayer";
import FeatureLayer from "esri/layers/FeatureLayer";
import ImageryLayer from "esri/layers/ImageryLayer";
import WMTSLayer from "esri/layers/WMTSLayer";
import WMSLayer from "esri/layers/WMSLayer";
import SceneLayer from "esri/layers/SceneLayer";
import KMLLayer from "esri/layers/KMLLayer";
import GeoRSSLayer from "esri/layers/GeoRSSLayer"
import CSVLayer from "esri/layers/CSVLayer";
import Field from "esri/layers/support/Field";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer"
/*******************引用ArcGIS API For JavaScript******************/

//控制图层可见性
function LayerVisible(mapview,layer) {
  let lyr=mapview.map.layers.find((item)=>item.id==layer.id);
  if(lyr){
    lyr.visible=!lyr.visible;
  }
}
//控制图层透明度
function setLayerOpacity(layer,val) {
    layer.opacity = val
}
//调整图层顺序
function reorderLayer(parent,layer,index) {
  //mapview.map.reorder(layer,index);
  if(parent.layers){
    let step = 0
    if(parent.layers.length > parent.layers.indexOf(layer)+index){
      if(parent.layers.items[(parent.layers.indexOf(layer)+index)] && parent.layers.items[(parent.layers.indexOf(layer)+index)].type == 'graphics'){
        step = index
      }
    }
    parent.layers.reorder(layer,parent.layers.indexOf(layer) + index + step);
  }else if(parent.baseLayers){ 
    parent.baseLayers.reorder(layer,parent.baseLayers.indexOf(layer)+index);
  }
}
//添加图层组
function addGroupLayerToMap(mapview,layerName,layerId,parentLayerId){
  let parentLayer=mapview.map.findLayerById(parentLayerId);
  if(!mapview.map.findLayerById(layerId)){
    let layer=new GroupLayer({title:layerName,id:layerId});
    if(parentLayer){
      parentLayer.layers.add(layer)
    }else{
      mapview.map.add(layer);
    }
  }
}
//添加图层
function addTempLayer(mapview,layerServiceType,serviceUrl,layerType,layerGroupid){
  let newUrl=getUrl(serviceUrl,layerServiceType,layerType);
  getServerceLayer(mapview,layerServiceType,newUrl,layerType,layerGroupid);
}
function getUrl(serviceUrl,layerServiceType,layerType){
let param="?f=json";
if(layerType!=""){
    param=configfunc.getArrProkv(myconfig.layerType,"value",layerType,"prama");
}
else if(layerServiceType!=""){
    param=configfunc.getArrProkv(myconfig.webLayoutTypeOption,"value",layerServiceType,"prama");
}
let newUrl=configfunc.getUrl(layerServiceType,serviceUrl,param);
switch (layerServiceType) {
  case "wmsserver":
    if(newUrl.includes('/arcgis/rest/services/')){
      newUrl=newUrl.replace('/arcgis/rest/services/','/arcgis/services/')
    }
    break;
}
return newUrl;
}
function getServerceLayer(mapview,layerServiceType,serviceUrl,layerType,layerGroupid){
  switch (layerServiceType) {
    case "arc_gis_server_rest": //arcgisserver发布服务
      let tplayer=new getLayerFromUrl(serviceUrl,layerType,"");
      awaitAddlayer(mapview,tplayer,layerGroupid);
     break;
    case "wmsserver":
      let wmsLayer=getLayerFromType('wms',serviceUrl);
      addLayer(mapview,layerGroupid,wmsLayer)
     break;
    case "wmtsserver":
      let wmtsLayer=getLayerFromType('wmts',serviceUrl);
      addLayer(mapview,layerGroupid,wmtsLayer)
     break;
    case "wfs_ogc_web":
     break;
    case "tile_file":
     break;
    case "kml_file":
      let kmlLayer=getLayerFromType('kml',serviceUrl);
      addLayer(mapview,layerGroupid,kmlLayer)
     break;
    case "geo_rss_file":
      let georssLayer=getLayerFromType('geo-rss',serviceUrl);
      addLayer(mapview,layerGroupid,georssLayer)
     break;
    case "csv_file":
      let csvLayer=getLayerFromType('csv',serviceUrl);
      addLayer(mapview,layerGroupid,csvLayer)
     break;
     default:
  }
}
//mapview添加图层,并缩放
function addArcServerLayer(mapview,tplayer,layerGroupid){
  if (tplayer.layer!=null){
    if(tplayer.info){
      tplayer.layer.title=(tplayer.info.TYPE.toLowerCase()=="mapserver"||tplayer.info.TYPE.toLowerCase()=="imageserver"||tplayer.info.TYPE.toLowerCase()=="featureserver")?tplayer.info.TEXT:tplayer.info.NAME;
    }else if(tplayer.layer.title){
      tplayer.layer.title=tplayer.layer.title;
    }
    addLayer(mapview,layerGroupid,tplayer.layer)
  }
}
//转换坐标系统
function transformationProjection(geometry,spatialReference){
  let transGeometry=projection.project.project(geometry,spatialReference);
  return transGeometry
}
function addLayer(mapview,layerGroupid,layer){
  let grouplayer=getLayerGroupbyid(mapview,layerGroupid);
  if(grouplayer){
   grouplayer.layers.add(layer);
  }else{
   mapview.map.add(layer);
  }
  // layer.when(()=>{/**2021.2.1孟哥提出新增图层去掉缩放， 想要缩放，自己手动点击缩放*/
  //   if(layer.fullExtent){
  //     let transExtent=transformationProjection(layer.fullExtent,mapview.spatialReference);
  //     // mapview.goTo({target: transExtent});
  //     mapview.extent = transExtent.expand(1.3);
  //   }
  // })
}
//按照图层id，找对应的图层组
function getLayerGroupbyid(mapview,layerGroupid) {
  if(mapview && mapview.map && mapview.map.layers) {
    if(layerGroupid==""){
      return mapview.map;
    }
    else{
      let layer=mapview.map.findLayerById(layerGroupid);//findAllLayerGroup(mapview.map.layers,layerGroupid);
      return layer==null? mapview.map:layer;
    }
  }
}
//查找mapview中所有的图层组,返回图层组的数组结构
function getAllLayerGroupTree(layers,allLayerGroup,index,subindex,num) {
  if(layers) {
    for (let i = 0; i <layers.items.length; i++) {
      let layer= layers.items[i]
      if(layer instanceof GroupLayer) {
        num++;
        allLayerGroup.children.push({id:`${index}${subindex}${num}`,label:layer.title,value:layer.id,children:[]});
        getAllLayerGroupTree(layer.layers,allLayerGroup.children[0],index,subindex,num);
      }
    }
  }
  return allLayerGroup;
}
//方法对象，适用于new,传入url,（类型，范围俩参数没有可以添空值）获得图层，返回对象中包含图层，坐标系，是否加载等信息
function getLayerFromUrl(servicesUrl,layerTpye,dataExtent){
  this.url=servicesUrl;//url
  this.extent=dataExtent==""?{}:dataExtent;//服务地址
  this.wkid=4326;//坐标系
  this.layer={}; //图层
  this.type=layerTpye;//图层类型
  this.isload=false;//是否加载地图成功
  this.res=0;//是否请求结不结束
  this.data={};
  var that=this;
  that= getData(that);
}
function getData(temp) {
  var that=temp;
  if(that.type!=""){
    that.layer=getLayerFromType(that.type,that.url);
    if(that.layer!=null){
      that.isload=true;
    }
    if(JSON.stringify(that.extent) == "{}"||that.type=="FeatureLayer"){
      axios({
        method:"get",
        url:that.url,
      }).then(function(response) {
        var data=response.data;
        that.data=data;
        if(data.hasOwnProperty("spatialReference")){//或得坐标和范围
          that.wkid=data.spatialReference.wkid;
          that.extent=data.fullExtent;
        }
        else if(data.hasOwnProperty("sourceSpatialReference")){//或得坐标和范围
          that.wkid=data.sourceSpatialReference.wkid;
          that.extent=data.extent;
        }
        that.res=1;
      }).catch(function(error) {
        // alert(error+"添加图层失败");
        that.res=2;
     });
    }
    else{
      that.res=1;
    }
  }else{
    axios({
      method:"get",
      url:that.url,
    }).then(function(response) {
      var data=response.data;
      that.data=data;
      that.type= getLayerType(data,that.url);//给图层设置类型(把判断类型放在axios中，主要是为了获取图层范围，有便于图层缩放)
      if(data.hasOwnProperty("spatialReference")){//或得坐标和范围
        that.wkid=data.spatialReference.wkid;
        that.extent=data.fullExtent;
      }
      else if(data.hasOwnProperty("sourceSpatialReference")){//或得坐标和范围
        that.wkid=data.sourceSpatialReference.wkid;
        that.extent=data.extent;
      }else if(data.error && data.error.code==499){//data.error.message: "Token Required";服务锁定的情况
        that.type="map-image";
      }else if(that.url.toLowerCase().includes("sceneserver")){
        that.type="scene";
      }
      that.layer=getLayerFromType(that.type,that.url);
      if(that.layer!=null)
      {
        that.isload=true;
      }
      that.res=1;
  }).catch(function(error) {
      // alert(error+"添加图层失败");
      that.res=2;
  });
  }
return that;
}
//获得图层类型
function getLayerType(data,url)
{
  let type="";
  if(url.includes("ImageServer?f=")){
    type="ImageryLayer";
  }else{
    if(data.hasOwnProperty("singleFusedMapCache")) {
      if(data["singleFusedMapCache"]) {
        type="TileLayer";
      }else{
        type="MapImageLayer";
      }
    }
    else if(data.hasOwnProperty("type")){
      if(data["type"]=="Feature Layer"){
        type="FeatureLayer";
      }else if(data["type"]=="Group Layer"){
        type="GroupLayer";
      }
    }
  }
  return type
};
//通过图层类型，url获得对应图层
function getLayerFromType(type,url) {
  let layer;
  switch (type){
    case "TileLayer":
    case "tile":
      layer=new TileLayer({
        url:url
      });
      break;
    case "FeatureLayer":
    case "feature":
      layer=new FeatureLayer({
        url:url,
        outFields: ["*"]
      });
      break;
    case "MapImageLayer":
    case "map-image":
      layer=new MapImageLayer({
        url:url
      });
      break;
    case "ImageryLayer":
    case "imagery":
     layer=new ImageryLayer({
      url:url
     });
     break;
    case "GroupLayer":
    case "group":
      let layerName = new Date().getTime().toString();
      layer=new GroupLayer({title:`图层组${layerName}`});
      break;
    case "wms":
     layer=new WMSLayer({
      url:url
     });
    break;
    case "wmts":
     layer=new WMTSLayer({
      url:url
     });
    break;
    case "kml":
     layer=new KMLLayer({
      url:url
     });
    break;
    case "geo-rss":
      layer=new GeoRSSLayer({
       url:url
      });
    break;
    case "csv":
     layer=new CSVLayer({
      url:url //url是通过浏览器链接能下载的对应接口地址,浏览器下载文件，而不是直接打开，浏览器默认为打开，后台response.setContentType("application/x-download");
     });
    break;
    case "scene":
      layer=new SceneLayer({url:url});
    break;
    default:
  }
    return layer
}
//通过图层类型，url获得对应图层
function getLayerFromTypeAndInfo(obj){
  let layer;
  switch (obj.type){
    case "tile":
      layer=new TileLayer({
        title:obj.title,
        url:obj.url,
        opacity:obj.opacity,
        visible:obj.visible
      });
      break;
    case "feature":
      var flRenderer = RendererCreator.rendererJsonUtils.fromJSON(obj.renderer);
      if(obj.url){
        layer=new FeatureLayer({
          title:obj.title,
          url:obj.url,
          opacity:obj.opacity,
          outFields: ["*"],
          visible:obj.visible
        });
      }else{
        let source= obj.source.map(function(feature) {
          return {attributes:feature.attributes,geometry: feature.geometry};
        });
        let graphics = source.map(function(feature) {
          return Graphic.fromJSON(feature);
        });
        layer=new FeatureLayer({
          title:obj.title,
          source:graphics,
          opacity:obj.opacity,
          visible:obj.visible,
          fields: obj.fields.map(function(field) {
            return Field.fromJSON(field);
          })
        });
      }
      if(obj.labelingInfo && obj.labelingInfoSymbol){
        obj.labelingInfo[0].symbol=obj.labelingInfoSymbol;
        obj.labelingInfo[0].symbol.type= "text",
        obj.labelingInfo[0].labelPlacement=myconfig.labelPlacement[obj.geometryType],
        layer.labelingInfo=obj.labelingInfo;
      }
      if(obj.customBZ){
        layer.customBZ=obj.customBZ;
      }
      layer.renderer=flRenderer;
      break;
    case "map-image":
      layer=new MapImageLayer({
        title:obj.title,
        url:obj.url,
        opacity:obj.opacity,
        visible:obj.visible
      });
      break;
    case "imagery":
     layer=new ImageryLayer({
      title:obj.title,
      url:obj.url,
      opacity:obj.opacity,
      visible:obj.visible
     });
     break;
    case "group":
      layer=new GroupLayer({title:obj.title,opacity:obj.opacity,visible:obj.visible});
    break;
    case "graphics":
      if(obj.id && obj.id.includes("myplotting")){
        layer = new GraphicsLayer({id:obj.id,title:obj.title,opacity:obj.opacity,visible:obj.visible});
        let layerGraphics = JSON.parse(obj.graphics)
        let graphics = layerGraphics.map(item=>{
          return new Graphic({
            geometry: item.geometry,
            symbol: item.symbol,
            attributes: item.attributes
          })
        })
        layer.graphics.addMany(graphics)
        if(obj.fields){
          layer.fields = JSON.parse(obj.fields)
        }
        if(obj.renderer){
          layer.renderer = obj.renderer
        }
      }
    break;
    case "wms":
      layer=new WMSLayer({url:obj.url,title:obj.title,opacity:obj.opacity,visible:obj.visible});
    break;
    case "wmts":
      layer=new WMTSLayer({url:obj.url,title:obj.title,opacity:obj.opacity,visible:obj.visible});
    break;
    default:
  }
    return layer
}
//定时器判断请求结果是否成功,图层是否加载成功
function awaitAddlayer(mapview,tplayer,layerGroupid){
    if(tplayer.res!=0){
      if(tplayer.isload==true)
      {
        addArcServerLayer(mapview,tplayer,layerGroupid);
      }
    }
    else{
      setTimeout(function(){awaitAddlayer(mapview,tplayer,layerGroupid)}, 1000)
    }
}
//通过json获取featurelayer
function getFeatureLayerFromShp(id,layerId,title,features,fields,source,data){
  this.graphics = features.map(function(feature) {
    return Graphic.fromJSON(feature);
  });
  this.featureLayer = new FeatureLayer({
    id:id,
    layerId:layerId,
    title:title,
    outFields: ["*"],
    source: this.graphics,
    fields: fields.map(function(field) {
      return Field.fromJSON(field);
    })
  });
  this.featureLayer.customBZ={source:source,count:this.graphics.length,data:data};//从文件中或者从叠加分析结果中得到的featurelayer
}
//通过信息获得图层
function getLayerFromInfo(parentlayer,layers,isBase){
  for(let i = 0; i< layers.length; i++){
    let layer=layers[i];
    let lyr;
    lyr=getLayerFromTypeAndInfo(layer);
    if(layer.type=="group"){
      getLayerFromInfo(lyr.layers,layer.children.children);
    }
    if(!isBase){
      if(lyr!=null){
        parentlayer.add(lyr);
      }
    }else{
      return lyr;
    }
  }
}
//获取服务的图例
async function getServiceLegend(serviceUrl,nodeId){
  let childrenArr=[];
  let url=`${serviceUrl}/legend?f=pjson`
  await axios({method:"get",url:url}).then((response)=> {
    if(response.status==200){
      let i=0;
      response.data.layers.map(layer=>{
        layer.legend.map(item=>{
          let src= `data:image/png;base64,${item.imageData} `;
          let newChild = { id: `${nodeId}legend${i}`, label: item.label||layer.layerName, disabled:true, type: "legend",imageData:src };
          childrenArr.push(newChild)
          i++
        })
      })
    }}).catch((error)=> {
        console.log(error);
    });
  return childrenArr
}
//添加标绘图层GraphicsLayer
function addGraphicsLayerToMap(mapview,layerName,layerId,parentLayerId){
  let parentLayer=mapview.map.findLayerById(parentLayerId);
  if(!mapview.map.findLayerById(layerId)){
    let layer=new GraphicsLayer({title:layerName,id:layerId});
    let fields = [{name: "OBJECTID", alias: "OBJECTID", type: "oid",length: -1}]
    layer.set({ fields: fields, objectIdField: "OBJECTID" })
    layer.objectIdField = "OBJECTID"
    if(parentLayer){
      parentLayer.layers.add(layer)
    }else{
      mapview.map.add(layer);
    }
  }
}
//通过json恢复GraphicsLayer信息到map中
function addSketchLayer(parentlayer,layers,dataId,myDataInfo,isbase){
  let zymlLayer
  if(isbase){
    zymlLayer = parentlayer.layers.find(layer => layer.id=="zymlGroupLayer")
  }
  for(let i = 0; i< layers.length; i++){
    let layer=layers[i];
    let lyr;
    if(layer.type=="graphics"){
      lyr = new GraphicsLayer({id:layer.id,title: myDataInfo && myDataInfo.title ? myDataInfo.title:layer.title,opacity:layer.opacity,visible:layer.visible});
      let layerGraphics = JSON.parse(layer.graphics)
      let graphics = layerGraphics.map(obj=>{
        return new Graphic({
          geometry: obj.geometry,
          symbol: obj.symbol,
          attributes: obj.attributes
        })
      })
      lyr.graphics.addMany(graphics)
      if(layer.fields){
        lyr.fields = JSON.parse(layer.fields)
      }
      if(layer.objectIdField){
        lyr.objectIdField = layer.objectIdField
      }
      if(layer.renderer){
        lyr.renderer = layer.renderer
      }
      lyr.customBZ = {dataId:dataId,myDataInfo:myDataInfo}
    }else if(layer.type=="group"){
      if(layer.children.children.length >0){
        if( layer.id=="zymlGroupLayer" && zymlLayer){
          addSketchLayer(zymlLayer.layers,layer.children.children,dataId,myDataInfo,false);
        }else{
          lyr=getLayerFromTypeAndInfo(layer);
          addSketchLayer(lyr.layers,layer.children.children,dataId,myDataInfo,false);
        }
      }
    }
    if(lyr!=null ){
      parentlayer.add(lyr);
    }
  }
}
function addlayerGraphics(layers,graphicLayer){
  for(let i = 0; i< layers.length; i++){
    let layer=layers[i];
    if(layer.type=="graphics" && graphicLayer.id == layer.id){
      let layerGraphics = JSON.parse(layer.graphics)
      let graphics = layerGraphics.map(obj=>{
        return new Graphic({
          geometry: obj.geometry,
          symbol: obj.symbol,
          attributes: obj.attributes
        })
      })
      graphicLayer.graphics.addMany(graphics)
      return
    }else if(layer.type=="group"){
      addlayerGraphics(layer.children.children,graphicLayer)
    }
  }
}
function getGraphicsJson(graphics){
  return graphics.map(graphic=>{
    let item ={
      geometry: getSymbolGeometry(graphic.geometry),
      attributes: graphic.attributes
    }
    if(graphic.symbol.type == "simple-marker"){
      item.symbol = getSimpleMarker(graphic.symbol)
    }else if(graphic.symbol.type == "simple-line"){
      item.symbol = getSimpleLine(graphic.symbol)
    }else if(graphic.symbol.type == "simple-fill"){
      item.symbol = getSimpleFill(graphic.symbol)
    }
    return item
  })
}
function getSymbolGeometry(geometry){
  let geo ={
    type: geometry.type,
    spatialReference:{
      wkid:geometry.spatialReference.wkid
    }
  }
  if(geometry.type == "point"){
    if(geometry.x){
      geo.x = geometry.x
      geo.y = geometry.y
      geo.z = geometry.z
    }else{
      geo.longitude = geometry.longitude
      geo.latitude = geometry.longitude
    }
  }else if(geometry.type == "polyline"){
      geo.paths = geometry.paths
  }else{
      geo.rings = geometry.rings
  }
  return geo
}
function getSimpleMarker(symbol){
  return {
    angle: symbol.angle,
    color: `rgba(${symbol.color.r},${symbol.color.g},${symbol.color.b},${symbol.color.a})`,
    outline: getSimpleLine(symbol.outline),
    size: symbol.size,
    style: symbol.style,
    type: symbol.type
  }
}
function getSimpleLine(symbol){
  return {
    cap: symbol.cap,
    color: `rgba(${symbol.color.r},${symbol.color.g},${symbol.color.b},${symbol.color.a})`,
    join: symbol.join,
    miterLimit: symbol.miterLimit,
    style: symbol.style,
    type: symbol.type,
    width: symbol.width
  }
}
function getSimpleFill(symbol){
  return {
    color: `rgba(${symbol.color.r},${symbol.color.g},${symbol.color.b},${symbol.color.a})`,
    outline: getSimpleLine(symbol.outline),
    style: symbol.style,
    type: symbol.type
  }
}
function removeLayerById(mapview,id){
  let layer = mapview.map.findLayerById(id)
  if(layer){
    mapview.map.remove(layer)
  }
}

export default {
  LayerVisible,
  setLayerOpacity,
  reorderLayer,
  addGroupLayerToMap,
  addGraphicsLayerToMap,
  addTempLayer,
  getLayerFromUrl,
  awaitAddlayer,
  getUrl,
  getAllLayerGroupTree,
  getFeatureLayerFromShp,
  getLayerFromType,
  transformationProjection,
  getLayerFromInfo,
  addSketchLayer,
  addlayerGraphics,
  getServiceLegend,
  getGraphicsJson,
  removeLayerById
};
