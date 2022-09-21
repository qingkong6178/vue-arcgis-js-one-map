<template>
  <div class="mapContainter">
  <!-- <div id="mapView">
  </div> -->
    <div class="map_container" :style="layout.layoutStyle"><!--多屏-->
      <template v-for="item in layout.subDiv">
        <div :key="item.i" :style="item.style">
          <div :class="item.class" :id="item.id" :style="{background:backgroundColor}" :ref="item.id">
          </div>
        </div>
      </template>
    </div>
    <navigation-extent v-if="isToggleExtent && map && mapview && mapview.ui" :mapview="mapview" @toggleExtent="toggleExtent"></navigation-extent>
 </div>
</template>
<script>
/*******************引用ArcGIS API For JavaScript******************/
import MapView from "esri/views/MapView";
import esriConfig from "esri/config";
import Map from "esri/Map";
import Basemap from "esri/Basemap";
import GroupLayer from "esri/layers/GroupLayer";
import SpatialReference from "esri/geometry/SpatialReference";
import Point from "esri/geometry/Point";
import ScaleBar from "esri/widgets/ScaleBar"; //比例尺工具
import CoordinateConversion from "esri/widgets/CoordinateConversion";//显示坐标工具
import Home from "esri/widgets/Home"; //返回初始状态工具
import Fullscreen from "esri/widgets/Fullscreen"; //全屏工具
import Compass from "esri/widgets/Compass"; //指北针工具
import Print from "esri/widgets/Print"; //打印工具
import Legend from "esri/widgets/Legend"; //图例
import Expand from "esri/widgets/Expand"; //expand可以将插件收起来

/*******************引用ArcGIS API For JavaScript******************/
import configfunc from "./mapconfig/configfunc";
import myconfig from "./mapconfig/myconfig";
import mylayers from "./mapconfig/layers";
import ChildsTransData from "./widgets/childsTransData";
import NavigationExtent from "./widgets/NavigationExtent"

esriConfig.geometryServiceUrl = myconfig.geometryService;
esriConfig.request.corsEnabledServers.push("localhost:6443");//设置地图服务器已允许跨域
let loading;
let handle
let lastTime
let nowTime
let isClickToggle = false
export default {
  components: {NavigationExtent},
  props: {
    widgets:{
      type:Array,
    }, 
    btnControlWidgets:{
      type:Array,
    },
    paramObj:{
      type:Object,
    },
    layout:{
      type:Object,
    },
    backgroundColor: {
      type:String,
      default: '#FFF'
    },
    isToggleExtent:{
      type:Boolean
    }
  },
  data() {
    return {
      map:{},//一屏当前地图
      mapview:{},//一屏当前mapview
      bkExpand:{},
      mapConfig:{},//从后台获取地图基础信息
      extentList:[],//前后视图保存的数组
      focusExtentIndex: 0,//当前视图所在的索引
    };
  },
  created() {
     ChildsTransData.$on('switchBaseMap',this.switchBaseMap)//注册切换底图事件
  },
  mounted() {
    if(this.paramObj){//区分是否从资源浏览中跳转过来的
      // let mapDescriptionInformation=JSON.parse(this.paramObj);
      this.getBaseMap(this.paramObj);
      this.getMapLayers(this.paramObj);
      if(this.isToggleExtent){
        this.removeWatchExtent()
        this.watchViewExtent()
      }
      this.$emit('getMapview',this.mapview);
      this.getWidgets();
      this.changeMapWidgetsStatus(this.widgets);
    }else{
      this.$message({showClose: true, type: 'warning', message: '没有地图基础信息'});
    }
  },
  destroyed () {
    ChildsTransData.$off()
    this.removeWatchExtent()
  },
  methods: {
    openFullscreenLoading(){//Loading加载
      loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
    getWidgets(){
      this.scalebar = new ScaleBar({
        view: this.mapview,
        unit: myconfig.widgetOnScreen["scalebar"]["unit"]
      });
      this.coordinateConversion = new CoordinateConversion({
        view: this.mapview
      });
      this.home = new Home({
        view: this.mapview
      });
      this.fullscreen = new Fullscreen({
        view: this.mapview
      });
      this.compass = new Compass({
        view: this.mapview
      });
      this.printEx = new Print({
        view: this.mapview,
        printServiceUrl:myconfig.widgetOnScreen.print.printServiceUrl,
      });
      this.print = new Expand({
        view: this.mapview,
        content: this.printEx,
        // expanded: true
      });
      this.legend=new Legend({
        view: this.mapview,
        basemapLegendVisible: true
      });
    },
    changeMapWidgetsStatus(widgets){//修改地图组件状态
      for (let i = 0; i < widgets.length; i++) {
        if(this.mapview.ui.find(this[widgets[i].name])){
         this.mapview.ui.remove(this[widgets[i].name]);
        }
        if(widgets[i].visible){
          this.mapview.ui.add(this[widgets[i].name],widgets[i].position);
        }
      }
    },
    getBaseMap(mapDescriptionInformation){
      let baselyr = mylayers.getLayerFromInfo("", mapDescriptionInformation.baseMapLayers.layers.children,true);//或得地图图层 
      let sr = new SpatialReference({wkid: mapDescriptionInformation.spatialReference?mapDescriptionInformation.spatialReference:mapDescriptionInformation.center.spatialReference.wkid,
        wkt:mapDescriptionInformation.center.spatialReference.wkt}); 
      //地图默认加载矢量底图
      let basemap= new Basemap({title:"底图",baseLayers:baselyr,id: "defaultImageBasemap"});
      this.map = new Map({
         basemap: basemap
      });// baselayer.baseLayers.add(baselyr);此种写法非法，必须再new的时候指定baseLayers才可以生效。
      this.mapview = new MapView({
        container: "mapView",
        map: this.map,
        // center: mapDescriptionInformation.center,
        zoom: mapDescriptionInformation.zoom,
        spatialReference: sr,
        ui:{
          components :["zoom"]
        },
      });
    },
    getMapLayers(mapDescriptionInformation){
     if(mapDescriptionInformation.mapLayers.layers.children.length!=0){
        mylayers.getLayerFromInfo(this.mapview.map, mapDescriptionInformation.mapLayers.layers.children,false);//或得地图图层
     }
    },
    switchBaseMap(baseLayerData){//切换底图
      if(baseLayerData.SERVICEADDRESS){
        this.openFullscreenLoading();
        let layer=mylayers.getLayerFromType(baseLayerData.TYPE,baseLayerData.SERVICEADDRESS);
        if(baseLayerData.TEXT && baseLayerData.TEXT.trim()){
          layer.title=baseLayerData.TEXT;
        }
        this.changeBasemap(baseLayerData,layer);
        this.$emit('getMapview',this.mapview); 
        this.getWidgets();
        this.changeMapWidgetsStatus(this.widgets);
        loading.close();
      }else{
        this.$message({showClose: true,message: '所选底图服务地址不合法，无法更换底图',type: 'warning'});
      }
    },
    changeBasemap(baseLayerData,layer){//根据底图信息生成底图
      this.map=null;
      this.mapview=null;
      //基础栅格底图
      let sr= new SpatialReference({wkid:baseLayerData.WKID,wkt:baseLayerData.WKT});
      let basemap= new Basemap({title:"底图",baseLayers:layer}); 
      //地图默认加载矢量底图
      this.map = new Map({
        basemap: basemap
      });
      this.mapview = new MapView({
        container: "mapView",
        map: this.map,
        ui:{
          components :["zoom"]
        },
      });
      if(sr.wkid!=0){//影像坐标系统如果是kwt的情况，如果把spatialReference初始化，会出现mapview初始化没有图的情况
        this.mapview.spatialReference=sr
      }
    },
    watchViewExtent(){
      this.mapview.when(()=>{
        lastTime = new Date()
        handle = this.mapview.watch("extent", this.viewExtentcallback)
      })
    },
    viewExtentcallback(newVal){
        nowTime = new Date()
        let timeDiff = nowTime.getTime() - lastTime.getTime()
        if(timeDiff >= myconfig.widgetOnScreen.navigationExtent.time){
            if(!isClickToggle){
              if(this.focusExtentIndex != this.extentList.length){
                this.extentList.splice(this.focusExtentIndex, this.extentList.length - this.focusExtentIndex, newVal)
              }else{
                this.extentList.push(newVal)
              }
              this.focusExtentIndex = this.extentList.length
              if(this.extentList.length > myconfig.widgetOnScreen.navigationExtent.maxRecord){
                this.extentList.splice(0, 1)
              }
            }else{
              isClickToggle = false
            }
            lastTime = new Date()
        }
    },
    toggleExtent(step){
      if(this.extentList.length > 0){
        this.focusExtentIndex = this.focusExtentIndex + step
        if(this.focusExtentIndex < 0 ){
          this.focusExtentIndex = 0
        }else if(this.focusExtentIndex >= this.extentList.length){
          this.focusExtentIndex = this.extentList.length - 1
        }
        isClickToggle = true
        this.mapview.extent = this.extentList[this.focusExtentIndex]
      }
    },
    removeWatchExtent(){
      if(handle && handle.remove){
        handle.remove()
        handle = null
      }
    }
  },
  watch:{
    btnControlWidgets :{
      handler: function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
        this.changeMapWidgetsStatus(val)
      },
      deep:true,
    },
    widgets :{
      handler: function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
        this.changeMapWidgetsStatus(val)
      },
      deep:true,
    }
  },
}
</script>
<style scoped>
  .mapView {
    height:100%;
    width:100%;
    position: absolute;
  }
  .mapContainter{
    position: relative;
    height:100%;
    width:100%;
  }
  .map_container{
    position: absolute;
  }
</style>
<style>
  div:focus{
    outline:none
  }
  .esri-view .esri-view-surface--inset-outline:focus::after{
    outline: none;
  }
</style>
