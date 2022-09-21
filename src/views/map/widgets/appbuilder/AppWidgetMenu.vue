<!-- 定制应用页头部-->
<template>
  <el-card title="地图菜单" :class="{ 'menuContainer': fixedClass,'menuContainer_absolute': absoluteClass}" body-style="width: 100%; box-sizing: border-box;">
    <div slot="header">
      <span>{{title}}</span>
      <i class="el-icon-close" style="float: right; padding: 3px 0;cursor :pointer;font-size: 18px;" @click="handleCloseMenu"></i>
    </div>
    <div style="padding: 0 5px" class="menuContainerToolTab">
        <div v-show="widgets[0].visible" class="menuContainerToolTab">
            <CatalogTree v-if="mapview && mapview.map" :mapview="mapview" :views="views"></CatalogTree><!--资源目录 -->
        </div>
        <div v-show="widgets[1].visible" class="menuContainerToolTab">
            <div>
                <AddLayerType v-on="$listeners">
                  <!-- <el-button slot="shadeBtn" v-if="views.length>1" type="text" size="mini" @click="getShade">识别</el-button> -->
                </AddLayerType>
                <LayerTree v-if="mapview && mapview.map && mapview.map.layers" :mapview="mapview" :map="mapview.map" :loaded="layerTreeLoaded" :views="views" :searchPage="currentPage" :searchLayerType="currentSearchLayerType" :searchLayerId="currentSearchLayerId" :searchCount="100" v-on="$listeners"></LayerTree><!--图层目录 -->
            </div>
        </div>
        <div v-show="widgets[2].visible" class="menuContainerToolTab"><!-- 数据专题图 -->
            <export-map v-if="mapview && mapview.extent" :mapview="mapview" :showDialog="showDialog" :moduleId="moduleId"></export-map>
        </div>
        <div v-show="widgets[3].visible" class="menuContainerToolTab"><!-- 切换底图 -->
           <switch-base-map v-on="$listeners"></switch-base-map>
        </div>
        <div v-show="widgets[4].visible" class="menuContainerToolTab"><!--要素分析 -->
           <geometry-analyse v-if="mapview && mapview.map.layers" :mapview="mapview"></geometry-analyse>
        </div>
    </div>
  </el-card>
</template>
<script>
import GroupLayer from "esri/layers/GroupLayer";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import CatalogTree from "../../components/CatalogTree";
import AddLayerType from "../../widgets/AddLayerType";
import LayerTree from "../../components/LayerTree";
import ExportMap from "../../widgets/ExportMap";
import SwitchBaseMap from "../../widgets/SwitchBaseMap";
import GeometryAnalyse from "../asideMenu/GeometryAnalyse"
function layerTreeLoaded(){
   this.views.map((view)=>{//先移除之前添加的图层，
     if(view.map.layers){
      if(view.map.layers.find((layer)=>layer.id=="tempGraphicslayer")){
        view.map.layers.remove(view.map.layers.find((layer)=>layer.id=="tempGraphicslayer"));
      }
     }
   })
  this.views.map((view)=>{//添加图层，否则图层树不显示
    view.map.add(new GraphicsLayer({id:'tempGraphicslayer'}));
  })
};
export default {
  inheritAttrs:false,
  components: {CatalogTree,AddLayerType,LayerTree,ExportMap,SwitchBaseMap,GeometryAnalyse},
  props: {
    fixedClass:{//样式1
      type:Boolean,
    },
    absoluteClass:{//样式2
      type:Boolean,
    },
    visible:{//工具栏可见性
      type:Boolean,
    },
    mapview:{
      type:Object,
    },
    views:{//多屏mapview集合
      type:Array,
    },
    widgets:{
      type:Array,
    },
    currentPage:{//属性选择页码数
      type:Number,
    },
    currentSearchLayerType:{//属性表当前查询图层的类型
      type:String,
      default:'feature'
    },
    currentSearchLayerId:{//表示查询图层的图层Id
      type:Number,
    },
    showDialog:{
        type: Function
    },
    moduleId:{
        type: Number
    },
    title:{
        type : String
    }
  },
  data() {
    return {
      layerTreeLoaded:layerTreeLoaded,//传给图层管理的方法
    }
  },
   methods: {
    // layerTreeLoaded(){
    //   this.createDefaultLayers();
    // },
    // retriveHavedLayers(){//恢复已有图层
    //   let mapDescriptionInformation=JSON.parse(this.paramObj.mapDescriptionInformation);
    //   if(mapDescriptionInformation.mapLayers.layers.children.length==0){
    //      this.createDefaultLayers();
    //   }else{
    //     mylayers.getLayerFromInfo(this.mapview.map, mapDescriptionInformation.mapLayers.layers.children,false);//或得地图图层
    //   }
    // },
    handleCloseMenu(){
      let name = this.widgets.find(item=>item.alt == this.title).name
      this.$emit('handleClose',name)
    }
  }
}
</script>
<style scoped>
  .menuContainer{
    position: absolute;
    top: 50px;
    height: calc(55vh);
    right: 50px;
    width: 23vw;
    overflow:auto;
  }
  .menuContainer_absolute{
    width:100%;
    height:100%;
    overflow: auto;
  }
  .aboutFont{
    font-weight: bolder;
  }
  .menuContainerToolTab{
    position: relative;
    width:100%;
    height:100%;
  }
  .el-card{
    border:0
  }
</style>
