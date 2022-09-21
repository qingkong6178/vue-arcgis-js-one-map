<!--图上选择工具-->
<template>
  <div v-show="visible" class="geometry_select">
    <div>
      <el-tooltip effect="dark" placement="right">
        <div slot="content">选择地图上最上层的要素图层；<br/>可以点选，或拉框选择；<br/>按住Shift键可以多选，或切换选中状态</div>
        <el-button size="mini" icon="el-icon-thumb" type="primary" plain @click="selectPolygon">图上选择</el-button>
      </el-tooltip>
    </div>
    <div>
      <el-tooltip effect="dark" content="全部清除" placement="right">
        <i class="el-icon-delete removeAllPolygon" @click="removeAll"></i>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
import Extent from "esri/geometry/Extent";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import searchData from "../searchData";
import layers from "../../mapconfig/layers";
import myconfig from "../../mapconfig/myconfig"
let pointerdownHander;//图上选择鼠标点击按下事件
let pointermoveHander;//图上选择鼠标移动事件
let pointerupHander;//图上选择鼠标点击松开事件
let pointerdragHander;//图上选择拖动事件
let pointerdownEvent;//图上选择鼠标点击按下事件记录
let pointerkeydownHander;//图上选择键盘键按下事件
let pointerkeyupHander;//图上选择键盘键松开事件
let pointerkeydownEvent;//图上选择键盘键按下事件记录
export default {
  props: {
    mapview:{//地图
      type:Object,
    },
    visible:{//可见性
      type:Boolean,
    },
    sql:{//地图
      type:String,
    },
    isRemoveHander:{
      type:Boolean,
    }
  },
  data() {
    return {
      analyseLayer:{},//分析图层
      seachedFeaturesBypage:[],//通过分页获得的所有要素
      queryParams:null,//查询参数
      analysisGraphsLayer:{},//绘制源图形
    }
  },
  methods: {
    init(){//初始化
      document.documentElement.style.cursor ='';
      this.mapview.graphics.removeAll();
      if(this.analysisGraphsLayer.graphics){
        this.analysisGraphsLayer.graphics.removeAll();
      }
      this.mapview.map.remove(this.analysisGraphsLayer);
    },
    removeAll(){
      this.init();
      this.removePointerdownHander();
    },
    removePointerdownHander(){//移除"pointer-down"等注册事件
      if(pointerdownHander){
        pointerdownHander.remove();
        pointermoveHander.remove();
        pointerupHander.remove();
        pointerdragHander.remove();
        pointerkeydownHander.remove();
        pointerkeyupHander.remove();
        pointerdownHander=null;
        pointermoveHander=null;
        pointerupHander=null;
        pointerdragHander=null;
        pointerkeydownHander=null;
        pointerkeyupHander=null;
        myconfig.removeMapEvent()
      }
    },
    selectPolygon(){//图上选择
      let selectSQL=this.sql;
      let tempfeatureLayers=this.mapview.map.allLayers.items.filter((item)=> eval(selectSQL));
      if(tempfeatureLayers.length<1){
        this.$message({showClose: true,message:'没有合适的要素数据',type:'info'});
      }else{
        this.analyseLayer=tempfeatureLayers[tempfeatureLayers.length-1];
        this.$emit("getSelectLayer",this.analyseLayer);//获得标签
        this.init();
        document.documentElement.style.cursor = 'crosshair';
        layers.removeLayerById(this.mapview,"geometryAnalysisLayer")
        this.analysisGraphsLayer = new GraphicsLayer({id:"geometryAnalysisLayer"});
        this.mapview.map.add(this.analysisGraphsLayer);
        if(!pointerdownHander){
          pointerdownHander=this.mapview.on("pointer-down", this.eventHandler);
          pointermoveHander=this.mapview.on("pointer-move", this.eventHandler);
          pointerupHander=this.mapview.on("pointer-up", this.eventHandler);
          pointerdragHander=this.mapview.on("drag", this.eventHandler);
          pointerkeydownHander=this.mapview.on("key-down",this.eventHandler);
          pointerkeyupHander=this.mapview.on("key-up",this.eventHandler);
          myconfig.addMapEvent(pointerdownHander,"pointer-down")
          myconfig.addMapEvent(pointermoveHander,"pointer-move")
          myconfig.addMapEvent(pointerupHander,"pointer-up")
          myconfig.addMapEvent(pointerdragHander,"drag")
          myconfig.addMapEvent(pointerkeydownHander,"key-down")
          myconfig.addMapEvent(pointerkeyupHander,"key-up")
        }
      }
    },
    eventHandler(event) {//点选事件
      if(event.type=="pointer-down"){
        pointerdownEvent=event;
        let selectSQL=this.sql;
        let tempfeatureLayers=this.mapview.map.allLayers.items.filter((item)=> eval(selectSQL));
        if(tempfeatureLayers.length>0){
          if(this.analyseLayer!=tempfeatureLayers[tempfeatureLayers.length-1]){//在选择过程中切换图层时，重新获取分析图层
            this.mapview.graphics.removeAll();
            this.intersetGraphsLayer.graphics.removeAll();
            this.analyseLayer=tempfeatureLayers[tempfeatureLayers.length-1];
            layers.reorderLayer(this.mapview.map,this.analysisGraphsLayer, this.mapview.map.layers.length-1-this.mapview.map.layers.indexOf(this.analysisGraphsLayer));//将绘制图层移动到最上层
            this.$emit("getSelectLayer",this.analyseLayer);//获得图层
          }
        }
      }
      else if(event.type=="pointer-move"){
        if(pointerdownEvent){
            event.stopPropagation ();
            this.mapview.graphics.removeAll();
            if(!pointerkeydownEvent){//松开Shift键
              this.analysisGraphsLayer.graphics.removeAll();
            }
            this.drawGraphics(this.getExtent(pointerdownEvent,event),null,true);
        }
      }else if(event.type=="key-down"){
        if (event.key.toLowerCase() === "shift"){
          pointerkeydownEvent=true;
        }
      }else if(event.type=="key-up"){
        if (event.key.toLowerCase() === "shift"){
          pointerkeydownEvent=null;
        }
      }
      else if(event.type=="pointer-up"){
        if(pointerdownEvent.x===event.x&&pointerdownEvent.y===event.y){//表示鼠标点击
          this.mapview.hitTest(event).then(this.getGraphics);
        }
        else{//表示鼠标拖动
          let extent = this.getExtent(pointerdownEvent,event);
          this.queryParams=null;
          this.queryParams = this.analyseLayer.createQuery();
          this.queryParams.geometry = extent;
          this.queryParams.outFields=this.analyseLayer.fields.map(field=>field.name);
          this.mapview.graphics.removeAll();
          if(!pointerkeydownEvent){//松开Shift键
            this.analysisGraphsLayer.graphics.removeAll();
          }
          searchData.SearchFeaturelayerCount(this.analyseLayer).then(this.getAllFeatures);
        }
        pointerdownEvent=null;
      }
      event.stopPropagation ();
    },
    getExtent(event1,event2){//获取两次鼠标点选的范围
      let pt1 = this.mapview.toMap(event1);
      let pt2= this.mapview.toMap(event2);
      let extent=new Extent({
        xmin: pt1.x>pt2.x?pt2.x:pt1.x,
        ymin: pt1.y>pt2.y?pt2.y:pt1.y,
        xmax: pt1.x>pt2.x?pt1.x:pt2.x,
        ymax: pt1.y>pt2.y?pt1.y:pt2.y,
        spatialReference: pt1.spatialReference
      });
      return extent;
    },
    getAllFeatures(count){//通过查询出所有的要素，再buffer
      this.seachedFeaturesSumBypage=count;
      if(count<=1000 || !this.analyseLayer.capabilities.query.supportsPagination){
        this.analyseLayer.queryFeatures(this.queryParams).then(this.drawQueryFeatures);
      }else{
        this.seachedFeaturesBypage=[];
        let pageCount= Math.ceil(count/1000);
        for (let i = 0; i < pageCount; i++) {
          this.queryParams.start=i*1000;
          this.queryParams.num=1000;
          this.analyseLayer.queryFeatures(this.queryParams).then(this.drawQueryFeatures);
        }
      }
    }, 
    drawQueryFeatures(results){//绘制通过框选的要素
      if(results.features){
        for (let i = 0; i < results.features.length; i++) {
          this.drawGraphics(results.features[i].geometry,results.features[i].attributes,false);
        }
      }
    },
    drawGraphics(geometry,attributes,isAddToMap){//由geometry获取绘制要素
      let graphic=new Graphic({geometry:geometry,attributes:attributes});
      graphic.symbol=this.getSelectSymbolType(geometry.type);
      //添加新选择的,并将试图转到新的视图
      if(isAddToMap){
        this.mapview.graphics.add(graphic);
      }else{
        if(pointerkeydownEvent){//按住Shift键
          let exitGraphic= this.analysisGraphsLayer.graphics.find(item=>JSON.stringify(item.attributes)==JSON.stringify(graphic.attributes) || JSON.stringify(item.geometry.rings)==JSON.stringify(graphic.geometry.rings));
          if(exitGraphic && this.analysisGraphsLayer.graphics.includes(exitGraphic)){
              this.analysisGraphsLayer.graphics.remove(exitGraphic);
          }else{
            this.analysisGraphsLayer.graphics.add(graphic);
          }
        }else{
          this.analysisGraphsLayer.graphics.add(graphic);
        }
      }
    },
    getSelectSymbolType(type){
      let symbol;
      switch (type){
        case "point":
        case "multipoint":
          symbol={
            type: "simple-marker",
            size: 6,
            color: [ 51,51, 204, 0.9 ],
            outline: {
              color: "blue",
              width: 1,
            }
          };
          break;
        case "polyline":
          symbol={
            type: "simple-line",
            color: [ 51,51, 204, 0.9 ],
            style: "solid",
            width: "2px",
          };
          break;
        case "extent":
        case "polygon":
          symbol={
            type: "simple-fill",
            color: [ 51,51, 204, 0.9 ],
            style: "solid",
            outline: {
              color: "blue",
              width: 1
            }
          };
          break;
        default:
      }
      return symbol
    },
    getGraphics(response) {//获取高亮点选要素
      if (response.results.length) {
        let layer=this.analyseLayer;
        let count=response.results.filter(function(result) {return result.graphic.layer === layer;}).length;
        if(count>0){
          let graphic = response.results.filter(function(result) {
              return result.graphic.layer === layer;
          })[0].graphic;
          if(!pointerkeydownEvent){//松开Shift键
              this.analysisGraphsLayer.graphics.removeAll();
          }
          graphic.symbol=this.getSelectSymbolType(graphic.geometry.type);
          //添加新选择的,并将试图转到新的视图
          if(pointerkeydownEvent){//按住Shift键
            let exitGraphic= this.analysisGraphsLayer.graphics.find(item=>JSON.stringify(item.attributes)==JSON.stringify(graphic.attributes) || JSON.stringify(item.geometry.rings)==JSON.stringify(graphic.geometry.rings));
            if(exitGraphic){
              this.analysisGraphsLayer.graphics.remove(exitGraphic);
            }else{
              this.analysisGraphsLayer.graphics.add(graphic);
            }
          }else{
            this.analysisGraphsLayer.graphics.add(graphic);
          }
        }else{
          if(!pointerkeydownEvent){//松开Shift键            
            this.analysisGraphsLayer.graphics.removeAll();
          }
        }
      }else{
        if(!pointerkeydownEvent){//松开Shift键
          this.analysisGraphsLayer.graphics.removeAll();
        }
      }
    },
  },
  watch:{
    visible :function (val) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.init();
      }
    },
    isRemoveHander :function (val) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.removePointerdownHander();
        document.documentElement.style.cursor ='';
      }
    },
  },
}
</script>
<style scoped>
  .removeAllPolygon{
    font-size:18px;
  }
  .geometry_select {
    display: flex;
    justify-content: space-between;
  }
</style>
