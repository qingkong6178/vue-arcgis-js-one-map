<!--图上绘制工具-->
<template>
  <div v-show="visible" class="geometry_select">
    <div>
      <el-tooltip effect="dark" placement="right">
        <div slot="content">通过鼠标自由绘制图形</div>
        <el-button size="mini" icon="el-icon-edit" type="primary" plain @click="drawPolygon">图上绘制</el-button>
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
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Draw from "esri/views/draw/Draw";
import Polygon from "esri/geometry/Polygon"
import layers from "../../mapconfig/layers";
var cursorUpdateHander;//鼠标绘制事件
var drawCompleteHander;//鼠标绘制完成事件
export default {
  props: {
    mapview:{//地图
      type:Object,
    },
    visible:{//可见性
      type:Boolean,
    },  
    graphicLayerId:{//绘制图层id
      type:String,
    },    
  },
  data() {
    return {
      analysisGraphsLayer:{},//分析图层
      seachedFeaturesBypage:[],//通过分页获得的所有要素
      queryParams:null,//查询参数
      analysisGraphsLayer:{},//绘制源图形
    }
  },
  mounted: function () {
    this.draw = new Draw({
        view: this.mapview,
    });
    this.$emit('getDrawObj',this.draw);
  },
  methods: {
    init(){//初始化
      document.documentElement.style.cursor ='';
      this.mapview.graphics.removeAll();
      if(this.analysisGraphsLayer.graphics){
        this.analysisGraphsLayer.graphics.removeAll();
      }
      if(this.draw.complete){
        this.draw.complete();
      }
      this.mapview.map.remove(this.analysisGraphsLayer);
      this.analysisGraphsLayer = new GraphicsLayer({id:this.graphicLayerId});
      this.mapview.map.add(this.analysisGraphsLayer);
    },
    removeAll(){//全部删除
      this.init();
    },
    drawPolygon(){//点击绘制 
      this.init();
      this.$emit('getDrawObj',this.draw);
      let action = this.draw.create("polygon");        
      this.mapview.focus();//设置在地图上聚焦，激活键盘快捷键 
      document.documentElement.style.cursor = 'crosshair';
      layers.reorderLayer(this.mapview.map,this.analysisGraphsLayer, this.mapview.map.layers.length-1-this.mapview.map.layers.indexOf(this.analysisGraphsLayer));//将绘制图层移动到最上层
      cursorUpdateHander=action.on("cursor-update", this.handleDrawCursorUpdate);//注册鼠标移动更新事件            
      drawCompleteHander=action.on("draw-complete", this.handleDrawComplete);//注册绘制完成事件
      
    },
    handleDrawCursorUpdate(evt){//鼠标移动更新事件
      this.createPolygonGraphic(evt.vertices);
    },
    handleDrawComplete(evt){//绘制完成事件
      this.createPolygonGraphic(evt.vertices);
      document.documentElement.style.cursor = '';
    },
    createPolygonGraphic(vertices){//创建面图形
      this.mapview.graphics.removeAll();
      this.analysisGraphsLayer.graphics.removeAll();
      let graphic=this.createGraphic(vertices);
      this.analysisGraphsLayer.graphics.add(graphic);
    },
    createGraphic(vertices){
      let polygon = {
        type: "polygon",
        rings: vertices,
        spatialReference: this.mapview.spatialReference
      };        
      var graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill", 
          color: [ 51,51, 204, 0.9 ],
          style: "solid",
          outline: {
              color: "blue",
              width: 1
          }
        }
      });
      return graphic
    },


  },
  watch:{
    visible :function (val) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.removeAll();
      }
    },  
  }, 
}
</script>
<style  scoped>
  .removeAllPolygon{
    font-size:18px;
  }
  .geometry_select {
    display: flex;
    justify-content: space-between;
  }
</style>
