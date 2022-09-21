<!-- 定制应用页-->
<template>
  <el-container>
    <el-header v-if="layout[0] && layout[0].visible" class="mapAppTheme" :style="layout[0].style">
      <AppHeader v-bind="$attrs"></AppHeader>
    </el-header>
    <el-container>
      <el-aside v-if="layout[1] && layout[1].visible" :width="layout[1].width" class="mapAppTheme" :style="layout[1].style">
        <map-tool :widgets="widgets[1].widgets" :toolboxStyle="'display:flex;flex-direction:column'" :toolStyle='layout[5].style' :iconColor="layout[5].toolIconColor" @clickMapTool="clickTool"></map-tool>
      </el-aside>
      <el-main v-if="layout[2] && layout[2].visible" class="mapAppMain" :style="layout[2].style">
        <template v-if="layout[4] && layout[4].visible">
          <component :is="layout[4].name">
            <baseMap slot="map" v-if="isinitMap" :key="bs" :widgets="widgets[0].widgets" :layout="mutiscreenLayout" :backgroundColor="layout[2].color" :isToggleExtent="true" :paramObj="mapInfomation" @getMapview="getMapview"></baseMap>
            <map-tool slot="mapWidget" :widgets="widgets[1].widgets" :toolboxStyle="'display:flex;flex-wrap:wrap'" :toolBoxBackgroud='true' :toolStyle='layout[5].style' :iconColor="layout[5].toolIconColor" @clickMapTool="clickTool">
               <div slot="tool" v-if="mapPlottingVisible && isrefresh && mapview && mapview.ui" :class="{mapSelectTool:true}" :style="layout[5].style">
                  <plotting :mapview="mapview" :myDataInfo="myDataInfo" @addLayers="addLayer" @getDataId="getDataId" @getEditDisable="(val)=>this.editdisAble = val"></plotting>
                </div>
            </map-tool>
            <div slot="customMapWidget" style="position:relative;width:100%;height:100%">
              <transition name="el-zoom-in-top">
                <app-widget-menu :absoluteClass="true" :key="bs" v-if="isrefresh" v-show="mapWidgetCardVisible" :widgets="activeCardvisible" :mapview="mapview" :views="views" :visible="mapWidgetCardVisible" :currentPage="currentPage" :currentSearchLayerType="currentSearchLayerType" :currentSearchLayerId="currentSearchLayerId" :title="cardName"
                  :showDialog="showDialog" :moduleId="mapModuleId" @addLayers="addLayer" @switchBaseMap="switchBaseMap" @getSerachCount="getSerachCount" @showAnalyseTable="receiveAnlyse" @clearDraw="clearDraw" @showGraphicsTable="showGraphicsTable" @handleClose="handleCloseMenu"></app-widget-menu>
              </transition>
            </div>
            <div v-show="attributeTableVisible" class="intersectAnalyseTable_absolute" slot="mapAttributeTable">
              <el-card v-show="cuttleTableVisible">
                <VTable v-if="mapview && mapview.map && mapview.map.layers" :mapview="mapview" :tableDatas="dtAnalyseAttFromShp" :tableHeight="'100%'" :clearDataBtnVisible="false" :totalCount="sumCount" :totalCountVisible="totalCountVisible" @getCurrentPage="getCurrentPage">
                </VTable>
              </el-card>
            </div>
          </component>
        </template>
        <template v-else>
          <baseMap v-if="isinitMap" :key="bs" :widgets="widgets[0].widgets" :layout="mutiscreenLayout" :backgroundColor="layout[2].color" :isToggleExtent="true" :paramObj="mapInfomation" @getMapview="getMapview"></baseMap>
          <transition name="map-widget-card">
            <app-widget-menu :fixedClass='true' :key="bs" v-if="isrefresh" v-show="mapWidgetCardVisible" :widgets="activeCardvisible" :mapview="mapview" :views="views" :visible="mapWidgetCardVisible" :currentPage="currentPage" :currentSearchLayerType="currentSearchLayerType" :currentSearchLayerId="currentSearchLayerId" :title="cardName"
              :showDialog="showDialog" :moduleId="mapModuleId" @addLayers="addLayer" @switchBaseMap="switchBaseMap" @getSerachCount="getSerachCount" @showAnalyseTable="receiveAnlyse" @clearDraw="clearDraw" @showGraphicsTable="showGraphicsTable" @handleClose="handleCloseMenu"></app-widget-menu>
          </transition>
          <div class="mapTool" v-if="!layout[3].visible && !layout[1].visible">
            <map-tool :widgets="widgets[1].widgets" :toolboxStyle="'display:flex;height: 100%;'" :toolBoxBackgroud='true' :toolStyle='layout[5].style' :iconColor="layout[5].toolIconColor" @clickMapTool="clickTool">
                <div slot="tool" v-if="mapPlottingVisible && isrefresh && mapview && mapview.ui" :class="{mapSelectTool:true}" :style="layout[5].style">
                  <plotting :mapview="mapview" :myDataInfo="myDataInfo" @addLayers="addLayer" @getDataId="getDataId" @getEditDisable="(val)=>this.editdisAble = val"></plotting>
                </div>
            </map-tool>
          </div>
          <div class="mapTool" v-if="(layout[1] && layout[1].visible || layout[3] && layout[3].visible) && mapPlottingVisible && isrefresh && mapview && mapview.ui">
            <div :class="{mapSelectTool:true}">
              <plotting :mapview="mapview" :myDataInfo="myDataInfo" @addLayers="addLayer" @getDataId="getDataId" @getEditDisable="(val)=>this.editdisAble = val"></plotting>
            </div>
          </div>
          <div v-show="attributeTableVisible" class="intersectAnalyseTable">
            <el-button size="mini" type="info" plain @click="cuttleTableVisible=!cuttleTableVisible"><i style="margin-left: 5px" :class="cuttleTableVisible ? 'el-icon-arrow-down' :'el-icon-arrow-up'"></i></el-button>
            <el-button v-show="cuttleTableVisible" style="float: right; " size="mini" @click="closePropertyTable" icon="el-icon-close"></el-button>
            <el-card v-show="cuttleTableVisible">
              <VTable v-if="mapview && mapview.map && mapview.map.layers" :mapview="mapview" :tableDatas="dtAnalyseAttFromShp" :tableHeight="analyseTableHeight" :clearDataBtnVisible="false" :totalCount="sumCount" :totalCountVisible="totalCountVisible" @getCurrentPage="getCurrentPage">
              </VTable>
            </el-card>
          </div>
          <div v-show="sketchTableVisible" class="intersectAnalyseTable">
            <el-button size="mini" type="info" plain @click="cuttleTableVisible=!cuttleTableVisible"><i style="margin-left: 5px" :class="cuttleTableVisible ? 'el-icon-arrow-down' :'el-icon-arrow-up'"></i></el-button>
            <el-button v-show="cuttleTableVisible" style="float: right; " size="mini" @click="sketchTableVisible = false" icon="el-icon-close"></el-button>
            <el-card v-show="cuttleTableVisible">
              <graphic-table v-if="mapview && mapview.map && mapview.map.layers" :mapview="mapview" :tableDatas="dtAnalyseAttFromShp" :tableHeight="analyseTableHeight" :totalCountVisible="true" :editdisAble="editdisAble">
              </graphic-table>
            </el-card>
          </div>
        </template>

        <div class="map_mutiscreen">
          <MutiScreen v-if="widgetsShow['mutiscreen'] && mapview && mapview.map.layers " :mapview="mapview" :widgetShow="widgetsShow['mutiscreen']" @handleCancleClick="hideWidget"  @handleChangeScreenLayout="changeScreenLayout" @getAllViews="getViews"></MutiScreen><!-- 多屏对比-->
        </div>
        <Search v-if="mapview && mapview.ui && mapview.map.layers" v-show="widgetsShow['property_search']" :mapview="mapview" :widgetShow="widgetsShow['property_search']" @handCloseMapTool="widgetsShow['property_search'] = false"></Search><!-- 搜索 -->
        <Bookmarks v-if="mapview && mapview.ui && mapview.map.layers" v-show="widgetsShow['bookmarks']" :mapview="mapview" :widgetShow="widgetsShow['bookmarks']"></Bookmarks><!-- 搜索 -->
        <Swipe v-if="mapview && mapview.ui && mapview.map.layers" v-show="widgetsShow['swipe']" :mapview="mapview" :widgetShow="widgetsShow['swipe']" @handCloseMapTool="widgetsShow['swipe'] = false"></Swipe><!-- 卷帘 -->
        <DrawIntersectAnalyse v-if="mapview && mapview.ui" v-show="widgetsShow['intersectAnalyse']" :mapview="mapview" :widgetShow="widgetsShow['intersectAnalyse']" :shpLayerId="shpLayerId" :addShpDate="addShpDate" :setMapTip="setMapTip" @showAnalyseTable="receiveAnlyse" @getDrawObj="getDraw" @showAddShpDialog="fileLayout=true,hightlightFeaturesFromshp=true" @handCloseMapTool="widgetsShow['intersectAnalyse'] = false"></DrawIntersectAnalyse><!--叠加分析绘制 -->
        <map-tip-mouse-move :visible="isShowTip" id="map-tip-mouse-move" :content="mapTipContent"></map-tip-mouse-move>
        <!-- <AddSearchedLayerDialog v-if="isrefresh && mapview && mapview.map.layers" :mapview="mapview" :views="views" :visible="searchLayout" @handleCloseDialog="searchLayout=false"></AddSearchedLayerDialog> -->
        <AddGroupLayerDialog v-if="isrefresh && mapview && mapview.map.layers" :mapview="mapview" :views="views" :visible="groupLayout" @handleCloseDialog="groupLayout=false"></AddGroupLayerDialog>
        <AddWebLayerDialog v-if="isrefresh && mapview && mapview.map.layers" :mapview="mapview" :views="views" :visible="webLayout" @handleCloseDialog="webLayout=false"></AddWebLayerDialog>
        <AddShpDialog v-if="isrefresh && mapview && mapview.map.layers" :mapview="mapview" :views="views" :visible="fileLayout" :hightlightFeaturesFromshp="hightlightFeaturesFromshp" @handleCloseDialog="addShpCloseDialog"></AddShpDialog>
        <EditDialog v-if="isrefresh && mapview && mapview.map.layers" :mapview="mapview" :visible="widgetsShow['edit']" @handleCloseDialog="widgetsShow['edit']=false"></EditDialog>
        <add-graphics-layer-dialog v-if=" isrefresh && mapview && mapview.map.layers" :mapview="mapview" :views="views" :visible="plotLayout" @handleCloseDialog="plotLayout=false"></add-graphics-layer-dialog>
        <el-dialog title="成果输出模板" :visible.sync="resultLayout" width="50%" @closed="mapModuleId=null">
          <map-module :visible="resultLayout" :resultType="resultType" :title="'选择模板'" @handleCloseDialog="resultLayout=false" @check="handleCheckResult"></map-module>
        </el-dialog>
      </el-main>
    </el-container>
    <el-footer v-if="layout[3] && layout[3].visible" class="mapAppTheme" :style="layout[3].style">
      <map-tool :widgets="widgets[1].widgets" :toolboxStyle="'display:flex;height: 100%;'" :toolStyle='layout[5].style' :iconColor="layout[5].toolIconColor" @clickMapTool="clickTool"></map-tool>
    </el-footer>
  </el-container>
</template>
<script>
import MapView from "esri/views/MapView";
import Map from "esri/Map";
import Basemap from "esri/Basemap";
import SpatialReference from "esri/geometry/SpatialReference";
import GraphicsLayer from "esri/layers/GraphicsLayer"
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel"
import Draw from "esri/views/draw/Draw"

import CustomLayoutOne from "./widgets/appbuilder/CustomLayoutOne";
import CustomLayoutTwo from "./widgets/appbuilder/CustomLayoutTwo";
import CustomLayoutThree from "./widgets/appbuilder/CustomLayoutThree";
import AppHeader from "./widgets/appbuilder/AppHeader";
import baseMap from "./baseMap";
import AppWidgetMenu from "./widgets/appbuilder/AppWidgetMenu";
import MapTool from "./widgets/appbuilder/MapTool";
import VTable from "./widgets/VTable";
import GraphicTable from "./widgets/GraphicTable"
import Search from "./widgets/Search";
import Bookmarks from "./widgets/Bookmarks";
import Swipe from "./widgets/Swipe";
import DrawIntersectAnalyse from "./widgets/DrawIntersectAnalyse";
import MutiScreen from "./widgets/MutiScreen";
// import AddSearchedLayerDialog from "./widgets/AddSearchedLayerDialog";
import AddGroupLayerDialog from "./widgets/AddGroupLayerDialog";
import AddWebLayerDialog from "./widgets/AddWebLayerDialog";
import AddShpDialog from "./widgets/AddShpDialog";
import AddGraphicsLayerDialog from "./widgets/AddGraphicsLayerDialog"
import EditDialog from "./widgets/EditDialog"
import MapModule from "./components/mapModule";
import Plotting from "./widgets/Plotting"
import MapTipMouseMove from "./widgets/MapTipMouseMove"

import myconfig from "./mapconfig/myconfig";
import measurement from "./widgets/measurement"
import measure from "./widgets/measure"
import mylayers from "./mapconfig/layers"
import LayerPopuptemplate from "./mapconfig/LayerPopuptemplate"
import ResetMapTool from "./mapconfig/ResetMapTool"
let initLoading;
export default {
  components:{CustomLayoutOne,CustomLayoutTwo,CustomLayoutThree,AppHeader,baseMap,AppWidgetMenu,MapTool,VTable,GraphicTable,Search,Bookmarks,Swipe,DrawIntersectAnalyse,MutiScreen,
    AddGroupLayerDialog,AddWebLayerDialog,AddShpDialog,AddGraphicsLayerDialog,MapModule,EditDialog,Plotting,MapTipMouseMove},
  props: {
    layout:{//app布局
      type:Array,
    },
    isinitMap: {//窗体开关状态
      type: Boolean,
      default: false,
    },
    bs:{//更新界面布局，更新地图组件
      type: Number,
      default: 0,
    },
    widgets:{
      type:Array,
    },
    mapInfomation:{
      type:Object,
    },
  },
  computed: {
    mapPlottingVisible: function () {//各类图层的基础属性
      let visible = this.widgets[1].widgets.find(item=>item.name.toLowerCase() == 'sketch').visible
      return visible
    }
  },
  data () {
    return {
      mutiscreenLayout:myconfig.containerOnScreen.oneScreenLayout,//当前地图布局
      mapWidgetCardVisible:false,//悬浮card可见性
      mapview:null,
      views:[],
      searchLayout: false,//设置搜索图层dialog显隐
      fileLayout: false,//设置从文件添加图层dialog显隐
      webLayout: false,//控制从web中添加图层，关闭窗体
      groupLayout:false,//设置图层组dialog显示
      plotLayout:false,//设置标绘图层dialog显示
      activeName:'0',//初始展示tab页
      widgetsShow:{//自定义组件显隐
        "line_measure":false,//长度测量工具
        "area_measure":false,//空间测量工具
        "point_search":false,//单点查询的工具使用
        "property_search":false,//控制属性查询组件显隐
        "bookmarks":false,//控制书签组件显隐
        "spatial_search":false,//控制空间查询组件显隐
        "mutiscreen":false,//控制多屏组件显隐
        "swipe":false,//控制卷帘组件显隐
        "intersectAnalyse":false,//控制叠加分析显隐
        "clear_map":false,//控制叠加分析显隐
        "edit":false,//控制编辑工具显隐
        "sketch":false,//控制标绘工具显隐
        "resource_catalog":false,//资源目录显隐
        "layer_list":false,//图层列表显隐
        "export_map":false,//成果输出显隐
        "switch_basemap":false,//切换底图显隐
        "feature_analyse":false,//要素分析显隐
      },
      activeCardvisible:[
        {name:"resource_catalog", alt:"资源目录", visible:false},
        {name:"layer_list", alt:"图层列表", visible:false},
        {name:"export_map", alt:"成果输出", visible:false},
        {name:"switch_basemap", alt:"切换底图", visible:false},
        {name:"feature_analyse", alt:"要素分析", visible:false}
      ],
      cardName:'',
      hightlightFeaturesFromshp:false,//表示是否高亮从文件中添加的要素
      shpLayerId:"",//添加的shpLayerId
      addShpDate:0,
      describeOfInterset:"",//叠加分析结果总体描述
      dtAnalyseAttFromShp:[],//叠加分析结果table
      attributeTableVisible:false,//属性表，折叠按钮的可见性
      sketchTableVisible:false,//标绘图层属性表
      isContentvisible:true,//属性表格中件描述信息可见性
      cuttleTableVisible:true,//属性表格的可见性
      analyseTableHeight:"23vh",//叠加分析结果高度
      sumCount:0,//属性表的总条数
      totalCountVisible:true,//总条数可见性
      currentPage:1,//属性表当前页数
      currentSearchLayerType:'feature',//属性表当前查询图层的类型
      currentSearchLayerId:0,//属性表当前查询图层的Id
      drawObj:{},//空间分析绘制对象
      intersetGraphsLayer:{},//空间叠加分析layer
      isrefresh:true,//切换底图
      sketchViewModel:{},//空间查询对象
      hightLightColections:[],//空间查询后高亮要素集
      resultLayout:false,//成果模板窗口可见性
      resultType: 5,
      mapModuleTile:"成果输出模板",//成果模板标题
      mapModuleId:null,//成果模板选中数据id
      CARD_RESULT: [{resultType:5,title:"成果输出模板",func:"setResultMap"},{resultType:6,title:"我的数据",func:"setMyData",ids:[]}],
      myDataInfo:{title:"我的数据",describe:"",label:[]},
      editdisAble: true,//属性编辑可用性
      handlers:[],
      appId:'',
      isShowTip:false,
      mapTipContent:'',//鼠标移动悬浮在旁边的文字
      measureDraw:null
    }
  },
  methods: {
    getMapview(mapView){//获取地图
      this.mapview=mapView;
      this.views[0]=mapView;
      this.reload();
      // this.isSwitchBasemap=!this.isSwitchBasemap;
    },
    addLayer(addType){//添加类型
      this[`${addType}Layout`] = true
      if(addType=="fileLayout"){
        this.hightlightFeaturesFromshp=false;
      }
      this.resultType = 6
      this.mapModuleTile = "我的数据"
    },
    openFullscreenLoading(){//Loading加载
      initLoading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
    openFullScreen(time) {//加载遮罩等待
      const loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      setTimeout(() => {
        loading.close();
      }, time);
    },
    switchBaseMap(baseLayerData){//切换底图
      if(baseLayerData.SERVICEADDRESS){
        this.clear()
        this.openFullScreen(2000);
        let layer=mylayers.getLayerFromType(baseLayerData.TYPE,baseLayerData.SERVICEADDRESS);
        if(baseLayerData.TEXT && baseLayerData.TEXT.trim()){
          layer.title=baseLayerData.TEXT;
        }
        this.setBasemap(baseLayerData,layer);
        this.views.length=0;
        this.views.push(this.mapview);
        this.reload();
        initLoading.close();
      }else{
        this.$message({showClose: true,message: '所选底图服务地址不合法，无法更换底图'});
      }
    },
    setBasemap(baseLayerData,layer){//根据底图信息生成底图
      let sr= new SpatialReference({wkid:baseLayerData.WKID,wkt:baseLayerData.WKT});
      let basemap= new Basemap({title:"底图",baseLayers:layer});
      this.mapview.map.basemap = basemap
      if(sr.wkid!=0){//影像坐标系统如果是kwt的情况，如果把spatialReference初始化，会出现mapview初始化没有图的情况
        this.mapview.spatialReference=sr
      }
    },
    addShpCloseDialog(shpLayerId,addShpDate){//从shp文件中添加图层回调
      this.fileLayout=false;
      if(shpLayerId!=""){
        this.shpLayerId=shpLayerId;
        this.addShpDate=addShpDate;
      }
    },
    receiveAnlyse(describeOfInterset,dtAnalyseAttFromShp,analyseDtVisible,contentVisible=true,pageVisible=true){//接收叠加分析数据/表格显示数据,参数描述1：表格中间描述信息，2表格信息，3表示属性表格是否可见，4表格中间描述信息是否可见
      this.describeOfInterset=describeOfInterset==""?"":describeOfInterset;
      this.dtAnalyseAttFromShp=describeOfInterset==""?[]:dtAnalyseAttFromShp;
      this.attributeTableVisible=analyseDtVisible;
      this.isContentvisible= contentVisible;//表格中件描述信息和总条数是从叠加分析来的，featurelayer的显示时从平台后台返回的，并非服务，不能查询分页
      this.totalCountVisible= pageVisible;
      this.sketchTableVisible = false
    },
    showGraphicsTable(dtAnalyseAttFromShp){
        this.dtAnalyseAttFromShp = dtAnalyseAttFromShp
        this.sketchTableVisible = true
        this.attributeTableVisible = false
    },
    getSerachCount(val){//获取查询总条数
      this.sumCount=val;
      this.cuttleTableVisible=true;
    },
    closePropertyTable(){//叠加分析属性页面返回到叠加分析页面
      this.attributeTableVisible=false;
      this.mapview.graphics.removeAll();
    },
    getCurrentPage(val,type,layerId){//当切换分页时
      this.currentPage=val;
      this.currentSearchLayerType=type;
      this.currentSearchLayerId=layerId
    },
    clickTool(tool){//单击工具
      this.widgetsShow[tool.name]=!this.widgetsShow[tool.name];
      if(tool.name=="line_measure"||tool.name=="area_measure"){
        this.measureGeometry(tool.name)
      }else if (tool.name=="point_search"){
        this.pointSearch(tool.name);
      }else if (tool.name=="spatial_query"){
        this.setUpSketchViewModel();
      }else if (tool.name=="clear_map"){
        this.clear();
      }else if(tool.name=="resource_catalog" || tool.name=="layer_list" || tool.name=="export_map" || tool.name=="switch_basemap" || tool.name=="feature_analyse"){
        this.openMenu(tool.name)
      }
    },
    measure2D(btnId,measure_type) {//测量
      this.clear(["line_measure","area_measure","attributeSearch","bookmarks","swipeWidget","mutiScreenWidget"])
      measurement.measure(this.mapview,document.getElementById(btnId),true,measure_type);
    },
    measureGeometry(measure_type){
      this.clear(["line_measure","area_measure","property_search","bookmarks","swipe","mutiscreen"])
      this.setMapTip(true,'单击确定起点，双击结束')
      this.initMeasureDraw()
      if(measure_type == "line_measure"){
        measure.measureDist(this.mapview, this.measureDraw,this.setMapTip)
        return
      }
      if(measure_type == "area_measure"){
        measure.measureArea(this.mapview, this.measureDraw,this.setMapTip)
        return
      }
    },
    initMeasureDraw(){
      this.mapview.when(()=>{
        if(!this.measureDraw){
          let draw = new Draw({
            view: this.mapview
          });
          this.measureDraw = draw
        }
      })
    },
    setUpSketchViewModel() {//空间绘制选择
      if(!this.mapview.map.allLayers.find(layer =>layer.type=="feature"&& layer.visible)){
        this.$message({ showClose: true,message: '当前地图下没有可见的要素图层'})
        return
      }
      this.clear(["property_search","bookmarks","swipe","mutiscreen"])
      this.setMapTip(true,'单击确定起点，双击结束')
      mylayers.removeLayerById(this.mapview,"spatialQueryGraphicLayer")
      let polygonGraphicsLayer = new GraphicsLayer({id:"spatialQueryGraphicLayer"});
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
      })
      this.sketchViewModel.create("polygon");
      let eventHandler = this.sketchViewModel.on("create", (event) => {//注册绘制事件
        if (event.state === "complete") {
            this.setMapTip(false)
            this.mapview.map.allLayers.map((layer,index,layers)=>{
            if(layer.type=="feature"&&layer.visible){
              let csvLayer=layer;
              csvLayer.when(() =>{
                  this.mapview.whenLayerView(csvLayer).then((layerView)=> {
                    this.mapview.popup.close();
                    polygonGraphicsLayer.remove(event.graphic);
                    this.selectFeatures(layer.id,event.graphic.geometry, layerView,layer);
                  });
              })
            }
          });
        }
      });
      this.handlers = []
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
        mycsvLayerView.queryFeatures(query).then((results)=> {
            const graphics = results.features;
            if (graphics.length > 0) {
              this.mapview.goTo(geometry.extent.expand(2));
              temphighlight = mycsvLayerView.highlight(graphics);
              this.hightLightColections.push(temphighlight)
              let data = graphics.map(function(feature, i) {
                return (
                  Object.keys(feature.attributes).filter(function(key) {
                      return gridFields.indexOf(key) !== -1;
                    }).reduce(function(obj, key) {
                      obj[key] = feature.attributes[key];
                      return obj;
                    }, {})
                );
              });
              this.dtAnalyseAttFromShp.push({id:layerID,name:layer.title,data:data})
              this.attributeTableVisible = true
              this.cuttleTableVisible = true
            }else {
              this.$message({ showClose: true,message: layer.title + '该查询条件下暂无结果'})
            }
          })
      }
    },
    pointSearch(pointSearchVisible){//单点查询
      this.setLayerPopuptemplate(this.widgetsShow[pointSearchVisible])
    },
    setLayerPopuptemplate(checked){
      this.setPopuptemplate(checked)
    },
    setClearPopuptemplate(item){
      this.setPopuptemplate(false)
    },
    setPopuptemplate(checked){
      LayerPopuptemplate.setPopuptemplate(checked,this.mapview)
      this.setMapTip(checked,'单击查询要素信息')
    },
    handleCloseMenu(widgetName){
      this.mapWidgetCardVisible = false
      this.widgetsShow[widgetName] = false
      this.activeCardvisible.find(item =>item.name == widgetName).visible = false
    },
    openMenu(widgetName){
      this.activeCardvisible.forEach((item,index)=>{
        if(item.name==widgetName){
          item.visible = !item.visible
          item.visible ? this.mapWidgetCardVisible = true : this.mapWidgetCardVisible = false
          this.cardName = item.alt
        }else{
          item.visible = false
        }
      })
    },
    getDraw(draw,drawLayer){//或得叠加分析绘制的对象
      this.drawObj=draw;
      this.intersetGraphsLayer=drawLayer;
    },
    clear(excludeIds = []){
      myconfig.map2DWidget.editableWidget.forEach(item =>{
        if(item.clearEvent && this[item.clearEvent]){
          if(!excludeIds.includes(item.id)){
            this[item.clearEvent](item)
          }
        }
      })
    },
    clearSpatialSketch(){//清除空间查询绘制，高亮等
      this.setMapTip(false)
      this.dtAnalyseAttFromShp = []
      if(this.sketchViewModel && this.sketchViewModel.state!="disabled" && this.sketchViewModel.state){
        this.sketchViewModel.destroy();
      }
      this.hightLightColections.map((hightLight)=>{
        if (hightLight) {
          hightLight.remove();
          hightLight=null;
        }
      })
      this.hightLightColections.length=0;
      this.handlers.forEach(handle =>{
        handle.remove()
        handle = null
      })
      mylayers.removeLayerById(this.mapview,"spatialQueryGraphicLayer")
    },
    closeWidgetCard(item){//关闭属性查询,卷帘,书签
      this.widgetsShow[item.name]=false
    },
    clearMutiScreen(item){//关闭多屏
      this.closeMutiScreen(item.id,true)
      this.widgetsShow[item.name]=false;
    },
    clearMap(){//清除地图绘制，事件等
      ResetMapTool.clearMap(this.mapview)
    },
    clearExportMapMark(){
      ResetMapTool.clearExportMapMark()
    },
    clearMeasure(){//清除测量绘制
      if(this.measureDraw){
          this.measureDraw.complete()
      }
      this.mapview.graphics.removeAll();
      this.setMapTip(false)
    },
    clearDraw(){//清除绘制对象
      this.widgetsShow["intersectAnalyse"]=false;
      this.drawObj.complete();
      this.intersetGraphsLayer.graphics.removeAll();
    },
    hideWidget(widget){//关闭组件,从子组件取消传入的事件
      this.closeMutiScreen(widget,true);
      this.widgets[widget]=false;
    },
    closeMutiScreen(widget,isOpen){//在父组件中关闭全屏组件
      if(widget=="mutiScreenWidget"&&isOpen){
        if(this.mutiscreenLayout.subDiv.length!=1){
          this.mutiscreenLayout=myconfig.containerOnScreen.oneScreenLayout;
          this.views=[this.mapview]
        }
      }
    },
    changeScreenLayout(layout){//由全屏组件传过来的布局
      this.mutiscreenLayout=layout;
    },
    getViews(allViews){//获得mapview
      this.$nextTick(() => {
        this.views=allViews;
      })
    },
    reload () {//切换底图，所以要重新刷新与底图相关的页面
      this.isrefresh = false;//先关闭，
      this.$nextTick(function () {
        this.mapview.when(this.isrefreshMap)
      })
    },
    isrefreshMap(){
      this.isrefresh = true;//再打开
    },
    showDialog(){
      this.resultType = 5
      this.resultLayout=!this.resultLayout
      this.mapModuleTile="成果输出模板"
    },
    handleCheckResult(val){
      let item = this.CARD_RESULT.find(obj => obj.resultType ==this.resultType)
      this.resultLayout=false
      this[item.func](val)
    },
    setResultMap(val){
      this.mapModuleId=val
    },
    getDataId(val){
      if(!this.CARD_RESULT[1].ids.includes(val)){
        this.CARD_RESULT[1].ids.push(val)
      }
    },
    setMyData(val){
      if(this.CARD_RESULT[1].ids.includes(val)){
        this.$message({showClose: true,message: '已经添加过该数据，不能重复添加'})
      }else{
        this.CARD_RESULT[1].ids.push(val)
        this.handleAddDataLayer(val)
      }
    },
    handleAddDataLayer(id){//从我的数据中添加图层
      this.openFullscreenLoading();
      this.$axios.get('/thematicMapInfomation/getThematicMapInfomationById/?id="+id').then(response => {//添加服务
        if (response.code == 200) {
          let myDataInfo = {
            title : response.data.title ? response.data.title : "我的数据",
            describe : response.data.describe,
            label : JSON.parse(response.data.label)
          }
          let data = JSON.parse(response.data.mapDescriptionInformation)
          mylayers.addSketchLayer(this.mapview.map, data.mapLayers.layers.children,id,myDataInfo,true);//添加标绘图层
        } else {
          this.$message.error(response.data);
        }
        initLoading.close();
      }).catch(error => {
        console.log(error);
          initLoading.close();
      });
    },
    setMapTip(checked,text){
      this.isShowTip = checked
      if(checked){
        this.mouseFllow(text)
      }else{
        document.onmousemove = null
      }
    },
    mouseFllow(text) {// 鼠标跟随tip
        this.mapTipContent = text
        let spanTip = document.getElementById("map-tip-mouse-move")
        document.onmousemove = (e) => {
            let offset = 20
            spanTip.style.left = e.clientX + offset + "px";
            spanTip.style.top = e.clientY + offset + "px";
        }
    }
  }
}
</script>
<style scoped>
 .mapAppTheme{
    background-color:rgb(57,162,237);
 }
 .mapAppMain{
    position: relative;
    background-color:rgb(255,255,255);
    padding:0;
 }
 .mapTool{
   position: absolute;
   top: 5px;
   right:50px;
 }
 .map_mutiscreen{
    position: absolute;
    top: 15px;
    left:50px;
 }
 .intersectAnalyseTable{
    position: absolute;
    bottom:5px;
    left: 5px;
    right: 5px;
    max-height:37vh;
    overflow: auto;
  }
  .intersectAnalyseTable_absolute{
    position: relative;
    width:100%;
    height:100%;
    overflow: auto;
  }
  .mapSelectTool{
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    margin:2px;
    padding:0 3px;
  }
  .map-widget-card-enter-active {
    transition: all .2s ease;
  }
  .map-widget-card-leave-active {
    transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .map-widget-card-enter, .map-widget-card-leave-to {
    transform: translateX(10px);
    opacity: 0;
  }
</style>
