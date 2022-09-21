<!--空间查询插件 -->
<template>
 <el-tooltip class="item" effect="dark" content="请选择可见的要素图层" placement="bottom">
  <el-button type="primary" size="mini" plain icon="el-icon-info" class="maptoolbtn" id="spatialQuery"
    @click="setUpSketchViewModel">空间查询
  </el-button>
 </el-tooltip>
</template>
<script>
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import ChildsTransData from "./childsTransData";
import measurement from "./measurement";
let polygonGraphicsLayer;//空间查询绘制的图层
let eventHandler;//绘制注册的事件
export default {
  props: {
    mapview:{
      type:Object,
    },
  },
  data () {
    return {
        sketchViewModel:{},//空间查询工具
        dtresult:[],//空间查询要素属性结果
        hightLightColections:[],//间查询要素图形结果
    }
  },
  methods: {
    clearUpSelection() {//清除已选中要素，清除已组册事件
      this.dtresult=[];
      // remove existing highlighted features
      this.hightLightColections.map((hightLight)=>{
        if (hightLight) {
          hightLight.remove();
          hightLight=null;
        }
      })
      this.hightLightColections.length=0;
      this.mapview.graphics.removeAll();  
      if(eventHandler){
        eventHandler.remove();
        eventHandler=null;
      }
      if(polygonGraphicsLayer){
        this.mapview.map.remove(polygonGraphicsLayer);
      }
      ChildsTransData.$emit('send-data',[]);
      this.clearMeasure();
      this.$emit('clearDraw');
    },
    clearMeasure(){//清除测量绘制
      if(document.getElementById("distanceButton")||document.getElementById("areaButton")){
        measurement.clearMeasure(null,this.mapview,document.getElementById("distanceButton"))
      }
    },
    setUpSketchViewModel() {//空间绘制选择
      this.clearUpSelection();
      if(!this.mapview.map.allLayers.find(layer =>layer.type=="feature"&& layer.visible)){
        this.$message({ showClose: true,message: '当前地图下没有可见的要素图层'})
        return
      }
      let layer = this.mapview.map.findLayerById("spatialQueryGraphicLayer")
      if(layer){
        this.mapview.map.remove(layer)
      }
      polygonGraphicsLayer = new GraphicsLayer({id:"spatialQueryGraphicLayer"});
      this.mapview.map.add(polygonGraphicsLayer);
      this.sketchViewModel = new SketchViewModel({
        view: this.mapview,
        layer: polygonGraphicsLayer,
        pointSymbol: {
          type: "simple-marker",
          color: [255, 255, 255, 0],
          size: "1px",
          outline: {
            color: "gray",
            width: 0
          }
        }
      });
      this.sketchViewModel.create("polygon");
      eventHandler= this.sketchViewModel.on("create", (event)=> {//注册绘制事件
        if (event.state === "complete") {
            this.mapview.map.allLayers.map((layer,index,layers)=>{
              if(layer.type=="feature"&&layer.visible){
                let csvLayer=layer;
                let mycsvLayerView;
                csvLayer.when(()=> {
                    this.mapview.whenLayerView(csvLayer).then(function(layerView) {
                      mycsvLayerView = layerView;
                    });
                  })
                .catch(console.log("1"));
                this.mapview.popup.close();
                polygonGraphicsLayer.remove(event.graphic);
                this.selectFeatures(layer.id,event.graphic.geometry, mycsvLayerView,layer); 
              }
            });
         }
      });
      this.$emit('handleClearSpatialSketchResult',this.sketchViewModel,this.hightLightColections,this.dtresult)
     
    },
    selectFeatures(layerID,geometry, mycsvLayerView,layer) {//获取选中要素，和要素信息
      let gridFields = layer.fields.map((field)=>{return field.name});
      this.mapview.graphics.removeAll();
      let temphighlight
      if (mycsvLayerView) {
        const query = {
          geometry: geometry,
          outFields: ["*"]
        };
        // query graphics from the csv layer view. Geometry set for the query
        // can be polygon for point features and only intersecting geometries are returned
        mycsvLayerView
          .queryFeatures(query)
          .then((results)=> {
            const graphics = results.features;
            if (graphics.length > 0) {
              // zoom to the extent of the polygon with factor 2
              this.mapview.goTo(geometry.extent.expand(2));
            } else {
            }
            if (graphics.length > 0) {
              temphighlight = mycsvLayerView.highlight(graphics);
              this.hightLightColections.push(temphighlight)
              let data = graphics.map(function(feature, i) {
                return (
                  Object.keys(feature.attributes)
                    .filter(function(key) {
                      return gridFields.indexOf(key) !== -1;
                    })
                    .reduce(function(obj, key) {
                      obj[key] = feature.attributes[key];
                      return obj;
                    }, {})
                );
              });
              this.dtresult.push({id:layerID,name:layer.title,data:data});
            } else {
              //   dataStore.objectStore.data = null;
            }
            ChildsTransData.$emit('send-data',this.dtresult.length==0?[]:this.dtresult)
          })
          .catch(console.log("2"));
      }
    },
    clearSpatialSketch(){//清除空间查询绘制，高亮等
      if(this.sketchViewModel.state!="disabled" && this.sketchViewModel.state){
        this.sketchViewModel.destroy();
      }
      this.clearUpSelection();
    },
   
  },
}
</script>
<style scoped>
.maptoolbtn{
  font-size: 13px;
}
</style>
