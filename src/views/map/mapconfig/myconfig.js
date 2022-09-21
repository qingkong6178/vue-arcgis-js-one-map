/*地图上参数设置*/
const GIS_SERVICE_PATH=window.vpgis && window.vpgis.config && window.vpgis.config.gisServicePath ? window.vpgis.config.gisServicePath: 'http://192.168.48.12:6080';//server发布服务地址
const GIS_CUSTOM_SERVICE=window.vpgis && window.vpgis.config && window.vpgis.config.gisCustomServicePath ? window.vpgis.config.gisCustomServicePath: 'http://192.168.50.13:8080';//gis后天地址
let map2DWidget = { editableWidget:[
  {id:0,name:"resource_catalog",visible:true,editable:true,alt: '资源目录',type:"button",icon:"&#xe657;",event: "openMenu", params: "resource_catalog", clearEvent: null},
  {id:1,name:"layer_list",visible:true,editable:true,alt: '图层列表',type:"button",icon:"&#xe66d;",event: "openMenu", params: "layer_list", clearEvent: null,layerId: null},
  {id:2,name:"export_map",visible:false,editable:true,alt: '成果输出',type:"button",icon:"&#xe65d;",event: "openMenu", params: "export_map", clearEvent:"clearExportMapMark",layerId: null,},
  {id:3,name:"switch_basemap",visible:false,editable:true,alt: '切换底图',type:"button",icon:"&#xe64e;",event: "openMenu", params: "switch_basemap", clearEvent:"clearMap",layerId: null,},
  {id:4,name:"feature_analyse",visible:false ,editable:true,alt: '要素分析',type:"button",icon:"&#xe64b;",event: "openMenu", params: "feature_analyse", clearEvent:"clearMap",layerId: "geometryAnalysisLayer"},
  {id:5,name:"point_search",visible:false,editable:true,alt: '单点查询',type:"button",icon:"&#xed1b;",event: "setLayerPopuptemplate", params: 'point_search',clearEvent:"setClearPopuptemplate",layerId: null},
  {id:6,name:"property_search",visible:true,editable:true,alt: '属性查询',type:"button",icon:"&#xe79a;",event: "openWidgetsDialog", params: 'property_search',clearEvent:"closeWidgetCard",layerId: null},
  {id:7,name:"spatial_query",visible:true,editable:true,alt: '空间查询',type:"button",icon:"&#xe65c;",event: "setUpSketchViewModel", params: null,clearEvent:"clearSpatialSketch",layerId: "spatialQueryGraphicLayer"},
  {id:8,name:"line_measure",visible:true,editable:true,alt: '长度测量',type:"button",icon:"&#xe65b;",event: "measureGeometry", params: 'distance',clearEvent:"clearMeasure",layerId: null},
  {id:9,name:"area_measure",visible:true,editable:true,alt: '面积测量',type:"button",icon:"&#xe658;",event: "measureGeometry", params: 'area',clearEvent:"clearMeasure",layerId: null},
  {id:10,name:"bookmarks",visible:false,editable:true,alt: '书签',type:"button",icon:"&#xe7ae;",event: "openAndCloseTool", params: 'bookmarks', clearEvent:"closeWidgetCard",layerId: null,},
  {id:11,name:"mutiscreen",visible:false,editable:true,alt: '多屏对比',type:"button",icon:"&#xe7b8;",event: "openWidgetsDialog", params: 'mutiscreen',clearEvent: "clearMutiScreen",layerId: null},
  {id:12,name:"swipe",visible:false,editable:true,alt: '卷帘',type:"button",icon:"&#xe664;",event: "openWidgetsDialog", params: 'swipe',clearEvent:"closeWidgetCard",layerId: null},
  {id:13,name:"intersectAnalyse",visible:true,editable:true,alt: '叠加分析',type:"button",icon:"&#xe665;",event: "begindrawPolygonAnalyse", params: null, clearEvent:"clearDraw",layerId: "intersetAnalysis"},
  {id:14,name:"clear_map",visible:true,editable:true,alt: '清除',type:"button",icon:"&#xe663;",event: "clear", params: [], clearEvent: null,layerId: null},
  {id:15,name:"edit",visible:false,editable:true,alt: '编辑',type:"button",icon:"&#xe603",event: "openTool", params: 'editDialog', clearEvent: null,layerId: null},
  {id:16,name:"sketch",visible:false,editable:true,alt: '标绘',type:"dropdown",icon:"&#xe603;",event: "openWidget", params: 'sketch', clearEvent: null,layerId: null},
  {id:17,name:"tool_box",visible:true,editable:false,alt: '工具箱',type:"button",icon:"&#xe67a;",event: "openMenu", params: "tool_box", clearEvent: null,layerId: null},
],
uneditableWidget: [
  {id:17,name:"scalebar",visible:false,editable:false,alt: '比例尺',type:"button",icon:"&#xe60a;",event: "openWidget", params: 'scalebar'},
  {id:18,name:"compass",visible:false,editable:false,alt: '指北针',type:"button",icon:"&#xe6da;",event: "openWidget", params: 'compass'},
  {id:19,name:"home",visible:false,editable:false,alt: '回到初始地图',type:"button",icon:"&#xe63e;",event: "openWidget", params: 'home'},
  {id:20,name:"fullscreen",visible:false,editable:false,alt: '全屏',type:"button",icon:"&#xe6c4;",event: "openWidget", params: 'fullscreen'},
  {id:21,name:"print",visible:false,editable:false,alt: '打印',type:"button",icon:"&#xe705;",event: "openWidget", params: 'print'},
  {id:22,name:"coordinateconversion",visible:false,editable:false,alt: '坐标',type:"button",icon:"&#xe605;",event: "openWidget", params: 'coordinateconversion'},
  {id:23,name:"Legend",visible:false,editable:false,alt: '图例',type:"button",icon:"&#xe606;",event: "openWidget", params: 'legend'}
]}
let mapHandles= []
function addMapEvent(handle,eventName){
  let item = mapHandles.find(item =>item.name == eventName)
  if(item && item.event){
    item.event.remove()
    item.event = handle
  }else{
    mapHandles.push({name:eventName,event:handle})
  }
}
function removeMapEvent(){
    mapHandles.forEach(item=>{
      item.event.remove()
      item.event = null
    })
    mapHandles= []
}
export default{ // 输出
  title: "我的地图",
  subtitle: "xxxxx",
  keepAppState: true,
  logo: "images/app-logo.png",
  geometryService: `${GIS_SERVICE_PATH}/arcgis/rest/services/Utilities/Geometry/GeometryServer`,
  wkid: 4490,
  //图层类型
  mapLayerType:{"base-dynamic":"BaseDynamicLayer","base-elevation":"BaseElevationLayer","base-tile":"BaseTileLayer","bing-maps":"BingMaps图层(BingMapsLayer)","building-scene":"BuildingSceneLayer","csv":"CSV图层(CSVLayer)","elevation":"高程图层(ElevationLayer)",
                "feature":"要素图层(FeatureLayer)","geojson":"GeoJSON图层(GeoJSONLayer)","geo-rss":"GeoRSS图层(GeoRSSLayer)","graphics":"GraphicsLayer","group":"图层组(GroupLayer)","imagery":"影像图层(ImageryLayer)","imagery-tile":"影像切片图层(TileImageryLayer)",
                "integrated-mesh":"集成网络图层(IntegratedMeshLayer)","kml":"KML图层(KMLLayer)","map-image":"动态图层(MapImageLayer)","map-notes":"MapNotesLayer","open-street-map":"OSM图层(OpenStreetMapLayer)","point-cloud":"点云图层(PointCloudLayer)","route":"Route","scene":"场景图层(SceneLayer)",
                "stream":"流数据图层(StreamLayer)","tile":"瓦片图层(TileLayer)","unknown":"未知图层(UnknownLayer)","unsupported":"非支持图层(UnsupportedLayer)","vector-tile":"矢量瓦片图层(VectorTileLayer)","web-tile":"WebTileLayer","wms":"WMS图层(WMSLayer)","wmts":"WMTS图层(WMTSLayer)",},
  //几何地理要素类型
  geometryType:{"point":"点要素(point)","multipoint":"多点要素(multipoint)","polyline":"线要素(polyline)","polygon":"面要素(polygon)","multipatch":"多面体(multipatch)","mesh":"网络(mesh)",},
  //几何地理要素标注位置，面只支持always-horizontal，2D的featurelayer的polyline只支持center-along
  labelPlacement:{"point":"above-center","multipoint":"above-center","polyline":"center-along","polygon":"always-horizontal"},
  //栅格像素值类型
  pixelType :{"unknown":"像元值类型是未知的","s8":"-128 到 127","s16":"-32768 到 32767","s32":"-2147483648 到 2147483647",
             "u8":"0 到 255","u16":"0 到 65535","u32":"0 到 4294967295","f32":"-3.402823466e+38 到 3.402823466e+38","f64":"0 到 18446744073709551616",},
  simpleMarkerSymbolStyle :[
    {value:'circle',label:'圆形'},{value:'cross',label:'十字丝'},
    {value:'diamond',label:'菱形'},{value:'square',label:'正方形'},
    {value:'triangle',label:'三角形'},{value:'x',label:'X'},],
  simpleFillSymbolStyle :[
    {value:'solid',label:'简单面符号'},{value:'backward-diagonal',label:'反向对角线'},
    {value:'cross',label:'十字丝'},{value:'diagonal-cross',label:'交叉对角线'},
    {value:'forward-diagonal',label:'正向对角线'},{value:'horizontal',label:'水平线'},
    {value:'vertical',label:'垂直线'},{value:'none',label:'无填充'},],
  simpleLineSymbolStyle :[
    {value:'solid',label:'实线'},{value:'dash',label:'虚线'},
    {value:'dash-dot',label:'虚线-点'},{value:'dot',label:'点'},
    {value:'long-dash',label:'长虚线'},{value:'long-dash-dot',label:'长虚线-点'},
    {value:'long-dash-dot-dot',label:'长虚线-点-点'},{value:'short-dash',label:'短虚线'},
    {value:'short-dash-dot',label:'短虚线-点'},{value:'short-dash-dot-dot',label:'短虚线-点-点'},
    {value:'short-dot',label:'短点'},{value:'none',label:'无填充'},],
  layerType:[
    {label:"自动识别",value:"",prama:"?f=json"},
    {label:"瓦片图层",value:"TileLayer",prama:"?f=json"},
    {label:"动态地图",value:"MapImageLayer",prama:"?f=json"},
    {label:"要素图层",value:"FeatureLayer",prama:"?f=json"},
    {label:"影像图层",value:"ImageryLayer",prama:"?f=json"},
  ],
  webLayoutTypeOption:[
    {label:"ArcGis Server Rest服务",value:"arc_gis_server_rest",prama:"?f=json"},
    {label:"WMS服务",value:"wmsserver",prama:""},//"/WMSServer?request=GetCapabilities&service=WMS"
    {label:"WMTS服务",value:"wmtsserver",prama:""},//"/WMTS/1.0.0/WMTSCapabilities.xml"
    // {label:"WFS OGC服务",value:"wfs_ogc_web",prama:"/WFSServer?request=GetCapabilities&service=WFS"},
    {label:"切片图层",value:"tile_file",prama:""},
    {label:"KML文件",value:"kml_file",prama:""},
    {label:"GeoRSS文件",value:"geo_rss_file",prama:""},
    {label:"CSV文件",value:"csv_file",prama:""},
  ],
  getJsonFromShpUrl:`${GIS_CUSTOM_SERVICE}/datamanagement/feature/fileToJson`,//`${GIS_CUSTOM_SERVICE}/GisToos/convert/fileToObject`,//"http://192.168.50.13:8080/GisToos/convert/fileToObject",
  getStreamFromUrl:`${GIS_CUSTOM_SERVICE}/datamanagement/feature/uploadTempFile`,//后台从文件流下载文件
  csvLayerUrl:`${GIS_CUSTOM_SERVICE}/datamanagement/feature/downLoadTempFile`,//后台返回csvlayer接口
//各个图层服务
  mapGroupInfo:[
      {mapId:"baseImageLayer",mapName:"baseImageLayer",layerGroupName:"矢量图层",layerName:"行政区",layerType:"TileLayer"},//"WMSlayer"},//"dinamiclayer"},//"TileLayer"},//Tile类型加载切片类型地图 
  ],
//矢量图层详细信息 所有图层都有title（图层名），visible(可见性，bool类型)，maxScale(可显示的最大比例尺)，minScale（可显示的最小比例尺），id(图层id)；FeatureLayer有layerid属性，outFields: ["*"](能够输出矢量图层的所有字段)；
  layersInfo:{
    baseImageLayer:{
      url:`${GIS_SERVICE_PATH}/arcgis/rest/services/XZQH/JCDL_XZQH_2016/MapServer`,//"http://172.16.171.242:6080/arcgis/rest/services/XZQH/JCDL_XZQH_2016/MapServer",//"http://172.16.171.242:6080/arcgis/services/YNCS/PCSWMS/MapServer/WMSServer?request=GetCapabilities&service=WMS",//"https://172.16.171.242:6443/arcgis/rest/services/YNCS/TILEXZQ/MapServer",//"https://172.16.171.242:6443/arcgis/rest/services/YNCS/FXZQ/MapServer",//"https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",//"http://172.16.171.242:6080/arcgis/rest/services/XZQH/JCDL_XZQH_2016/MapServer",
      id: "baseImageLayer",
      layerId: 3,
      title:"行政区",
      maxScale:1000,
      visible:true
    },
  },
//地图上小工具
  map2DWidget,
  addMapEvent,
  removeMapEvent,
//地图小工具详细配置
widgetOnScreen: {
  scalebar: {//比例尺_控件配置
      url: "esri/widgets/ScaleBar",
      visible: true,
      text:"比例尺",
      unit: "metric",
      position:"bottom-left",
    },
  zoom:{//缩放_控件配置
    url: "esri/widgets/Zoom",
    visible: true,
    text:"缩放",
    position:"top-left"
  },
  fullscreen:{//全屏_控件配置
      url: "esri/widgets/Fullscreen",
      visible: true,
      text:"全屏",
      position:"top-left"
    },
  locate:{//定位_控件配置
      url: "esri/widgets/Locate",
      visible: false,
      text:"定位",
      position:"top-left",
    },
  coordinateconversion: {//坐标_控件配置
      url: "esri/widgets/CoordinateConversion",
      visible: true,
      text:"坐标",
      position:"bottom-right",
    },
  compass:{//指南针_控件配置
      url: "esri/widgets/Compass",
      visible: true,
      text:"坐标",
      position:"top-right",
    },
  home:{//回到初始地图_控件配置
      url: "esri/widgets/Home",
      visible: true,
      text:"回到初始地图",
      position:"top-left"
    },
  legend:{//图例_控件配置
      url: "esri/widgets/Legent",
      visible: false,
      text:"图例",
      position:"bottom-right",
      Legentlayers:"FeatureLayer_DLTB1",
    },
  popuptemplate:{//单点查询_控件配置
      url: "esri/PopupTemplate",
      visible: true,
      text:"单点查询",
      position:"center",
    },
  attributesearch:{//属性查询_控件配置
      simplefillsymbol: {
        color: [0, 0, 0, 0],//查询结果样式
        style: 'solid',
        outline: {
            color: 'blue',
            width: 1.5},
        },
      simpleMarkerSymbol :{
        color:"orange",//"red",
        outline: {  // autocasts as new SimpleLineSymbol()
          color:[ 128, 128, 128, 0.5 ],
          width: "0.5px",
        },
      },
      simpleLineSymbol : {
        color: "lightblue",
        width: "2px",
        style: "solid",
      },
    },
  spatialquery:{//空间查询_控件配置
    mapid:"FeatureLayer_DLTB1",//图层
    gridFields:[
      "OBJECTID",
      "BSM",
      "YSDM",
      "TBYBH",
      "TBBH",
      "DLBM",
      "DLMC",
      "QSXZ",
      "QSDWDM",
      "QSDWMC",
      "GDLX",
      "KCLX",
      "DLBZ",
      "KCDLBM",
      "TKXS",
      "TBMJ",
      "XZDWMJ"
    ],
    visible: true,
    text:"空间查询",
    },
  search:{//查询_控件配置
      url: "widgets/Search/Widget",
      visible: false,
      text:"属性查询",
      position: "top-left"
  },
  swipe:{//卷帘_控件配置
    url: "esri/widgets/Swipe",
    visible: false,
    text:"卷帘",
    position: "top-left"
  },
  mutiScreen:{
    visible: false,
    text:"多屏对比",
    position: "top-right"
  },
  exportMap:{
    visible: true,
    text:"成果输出",
    position: "top-right"
  },
  draw:{//绘制面叠加分析
    url: "esri/views/draw/Draw",
    position:"top-left",
    visible: false,
    text: "叠加分析",
    drawIntersectAnalyseUrl:`${GIS_CUSTOM_SERVICE}/statics/area/intersect`,//"http://192.168.50.13:8080/GisStatics/intersect/area",//"http://192.168.19.159:8080/GisStatics/intersect/area",相交接口
    downFileUrl:`${GIS_CUSTOM_SERVICE}/datamanagement/feature/jsonToFile`,//"http://192.168.50.13:8080/GisToos/convert/jsonToFile",//下载文件接口
    xzq:[{//按区域选择的服务地址和字段
      "6":{url:`${GIS_SERVICE_PATH}/arcgis/rest/services/XZQH/QYDH/MapServer/3`,layer:{}},//县,服务地址//"6":{url:"http://172.16.171.242:6080/arcgis/rest/services/XZQH/QYDH/MapServer/3",layer:{}},//县,服务地址
      "9":{url:`${GIS_SERVICE_PATH}/arcgis/rest/services/XZQH/QYDH/MapServer/2`,layer:{}},//"9":{url:"http://172.16.171.242:6080/arcgis/rest/services/XZQH/QYDH/MapServer/2",layer:{}},//乡镇,服务地址
      "12":{url:`${GIS_SERVICE_PATH}/arcgis/rest/services/XZQH/QYDH/MapServer/1`,layer:{}},//"12":{url:"http://172.16.171.242:6080/arcgis/rest/services/XZQH/QYDH/MapServer/1",layer:{}},//村,服务地址
      xzdm:"211021",//若为省级的，用于区分县区用
      valueField:"xzqdm",//行政代码字段
      labelField:"xzqmc",//行政区名称
    }],
  },
  print:{//打印
    url: "esri/widgets/Print",
    printServiceUrl:`${GIS_SERVICE_PATH}/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task`,//"http://172.16.171.242:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",             
    visible: false,
    text: "打印",
    position:"bottom-left"
  },
  bookmarks:{//书签
    visible: false,
    position:"bottom-right",
    text: "书签",
  },
  switchBaseMap:{//切换底图
    visible: true,
    position:null,
    text: "切换底图",
  },
  attributeTable:{
    url: "widgets/AttributeTable/Widget",
    visible: false,
    position: {
      relativeTo: "map"
    },
  },
  edit:{
    visible: true,
    position:"bottom-left",
    text: "编辑",
  },
  navigationExtent:{
    id: "toggleExtentSpan",
    visible: true,
    text:"坐标",
    position:"top-left",
    maxRecord: 30,
    time: 1000
  },
  sketch:{
    visible: false,
    text:"草图",
    position:"bottom-left",
    creationMode:"update"
  }
},

//分屏容器等设置
containerOnScreen:{
 oneScreenLayout:{
  layoutStyle:{
    display: "flex",
    position: "relative",
    height:"100%",
    width:"100%",
    color: "#FFF",
 },
  subDiv:[
  {i:0,class:"mapView",id:"mapView",description:"我的地图", shadestyle:{},style:{width:"100%",height:"100%"}},
 ],},
 twoHorizontalScreenLayout:{//俩水平布局
  layoutStyle:{
    display: "flex",
    "flex-direction": "column",
    "flex-wrap": "nowrap",
    position: "relative",
    height:"100%",
    width:"100%",
    color: "#FFF",
    // border:"3px blue solid"
  },
  subDiv:[
   {i:0,class:"mapView",id:"mapView",description:"我的地图",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
   {i:1,class:"mapView",id:"mapView1",description:"我的地图1",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
  ],
},
 twoVerticalScreenLayout:{//俩垂直布局
  layoutStyle:{
    display: "flex",
    "flex-wrap": "nowrap",
    position: "relative",
    width:"100%",
    height:"100%",
    color: "#FFF",
    // border:"3px blue solid"
  },
  subDiv:[
   {i:0,class:"mapView",id:"mapView",description:"我的地图",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
   {i:1,class:"mapView",id:"mapView1",description:"我的地图1",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
  ],
},
 threeHorizontalScreenLayout:{//三水平布局
    layoutStyle:{
        display: "flex",
        "flex-direction": "column",
        "flex-wrap": "nowrap",//"space-between",
        position: "relative",
        height:"100%",
        width:"100%",
        color: "#FFF",
        // border:"3px blue solid"
    },
    subDiv:[
     {i:0,class:"mapView",id:"mapView",description:"我的地图",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
     {i:1,class:"mapView",id:"mapView1",description:"我的地图1",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
     {i:2,class:"mapView",id:"mapView2",description:"我的地图2",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
    ],
 },

 threeVerticalScreenLayout:{//垂直布局
    layoutStyle:{
      display: "flex",
      "flex-wrap": "nowrap",
      position: "relative",
      width:"100%",
      height:"100%",
      color: "#FFF",
      // border:"3px blue solid"
    },
    subDiv:[
     {i:0,class:"mapView",id:"mapView",description:"我的地图",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
     {i:1,class:"mapView",id:"mapView1",description:"我的地图1",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
     {i:2,class:"mapView",id:"mapView2",description:"我的地图2",shadestyle:{},style:{width:"100%",height:"100%",position: "relative"},},
    ],
 },
 verAndHorScreenLayout:{//垂直加水平左一右二
    layoutStyle:{
        display: "flex",
        "flex-direction": "column",
        "flex-wrap": "wrap",
        position: "relative",
        height:"100%",
        width:"100",
        color: "#FFF",
        class:"box",
        // border:"3px blue solid"
    },
    subDiv:[
      {i:0,class:"mapView",id:"mapView",description:"我的地图",shadestyle:{},style:{width:"50%",height:"100%",position: "relative"},},
      {i:1,class:"mapView",id:"mapView1",description:"我的地图1",shadestyle:{},style:{width:"50%",height:"50%",position: "relative"},},
      {i:2,class:"mapView",id:"mapView2",description:"我的地图2",shadestyle:{},style:{width:"50%",height:"50%",position: "relative"},},    
    ],
  }, 
  horAndVerScreenLayout:{//水平加垂直左二右一
    layoutStyle:{
        display: "flex",
        "flex-direction": "column",
        "flex-wrap": "wrap",
        position: "relative",
        height:"100%",
        width:"100", 
        color: "#FFF",
        class:"box",
        // border:"3px blue solid"
    },
    subDiv:[
      {i:0,class:"mapView",id:"mapView",description:"我的地图",shadestyle:{},style:{width:"50%",height:"50%",position: "relative"},},
      {i:1,class:"mapView",id:"mapView1",description:"我的地图1",shadestyle:{},style:{width:"50%",height:"50%",position: "relative"},},
      {i:2,class:"mapView",id:"mapView2",description:"我的地图2",shadestyle:{},style:{width:"50%",height:"100%",position: "relative"},},
    ],
  },
 fourScreenLayout:{//四分屏上下左右类型
    layoutStyle:{
        display: "flex",
        "flex-wrap": "wrap",
        position: "relative",
        height:"100%",
        width:"100",
        color: "#FFF",
        class:"box",
        // border:"3px blue solid"
    },
    subDiv:[
      {i:0,class:"mapView",id:"mapView",description:"我的地图",shadestyle:{},style:{width:"50%",height:"50%",position: "relative"},},
      {i:1,class:"mapView",id:"mapView1",description:"我的地图1",shadestyle:{},style:{width:"50%",height:"50%",position: "relative"},},
      {i:2,class:"mapView",id:"mapView2",description:"我的地图2",shadestyle:{},style:{width:"50%",height:"50%",position: "relative"},},
      {i:3,class:"mapView",id:"mapView3",description:"我的地图3",shadestyle:{},style:{width:"50%",height:"50%",position: "relative"},},
    ],
 },
},
};
