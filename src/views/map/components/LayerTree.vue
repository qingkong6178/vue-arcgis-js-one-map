<!--// 组件：图层树-->
<template>
  <span>
    <el-tree  :data="treeData" node-key="id" default-expand-all show-checkbox ref="tree" @check="handleCheckChange" @node-click="sliderVisible=false" :check-strictly="true">
        <span  v-if="node.data.type!='legend'" class="treeNode" slot-scope="{ node, data }">
            <span class="layername">
              <i v-if="node.data.type=='map'" class="iconfont icon" style="color:rgb(0,84,166);font-size:18px" v-html="'&#xe610;'"></i>
              <i v-else-if="node.data.type=='layergroup'||node.data.type=='baselayergroup'|| node.data.type=='groundlayergroup'" style="color:rgb(255,197,61)" class="iconfont icon" v-html="'&#xe671;'"></i>
              <i v-else-if="node.data.layer.type=='feature'" class="iconfont icon" v-html="'&#xe66d;'"></i>
              <i v-else-if="node.data.layer.type=='imagery'||node.data.layer.type=='imagery-tile'" style="color:rgb(74,150,30);" class="iconfont icon" v-html="'&#xe6a2;'"></i>
              <i v-else class="iconfont icon" style="color:rgb(0,84,166)" v-html="'&#xe67d;'"></i>
              {{ node.label }}
            </span>
            <span>
              <i v-if="legendLayers.includes(node.data.layer.type)" class="iconfont icon" @click.stop="showOrHideLegend(node,data)">&#xe606;</i>
              <i v-if="node.data.type!='map'&& node.data.type!='baselayergroup'&& node.data.type!='groundlayergroup'" class="iconfont icon" @click="(e) => leftClick(e,node,data)">&#xe67a;</i>
            </span>
        </span>
       <span v-else slot-scope="{ node }">
         <span>
            <el-image :src="node.data.imageData" fit="scale-down" style="width:16px; height:16px">
              <div slot="error" class="image-slot">
                <i class="iconfont icon" style="font-size:16px" v-html="'&#xe606;'"></i>
              </div>
            </el-image>
          </span>
          <span class="layername" style="margin-left:5px"> {{ node.label }}</span>
       </span>
    </el-tree>
    <el-card id="layerTreeMenu" v-show="tmDisplay" class="tree_menu" :style="{...rightMenu}">
          <template  v-for="item in rightMenuWidgets">
            <div v-show="item.visible" :key="item.id" class="layer_btn" @click="clickMenu(item.id,item.name)">
               <i class="iconfont icon" v-html="item.icon"></i>
              {{item.text}}
            </div>
          </template>
    </el-card>
    <el-slider class="tree_menu" :style="{...rightMenu}" v-if="sliderVisible" v-model="selectNode.data.opacity" :format-tooltip="formatTooltip" @change="sliderVisible=false" @input="setLayerOpacity(selectNode,selectNode.data.opacity)"> </el-slider>
    <Dialog :visible="propertyDialogVisible" :layer="currentLayer" @handleCloseDialog="propertyDialogVisible=false" v-on="$listeners"></Dialog>
    <SymbolDialog :visible="symbolDialogVisible" :mapview="mapview" :layer="currentLayer" :layerType="'feature'" @handleCloseDialog="symbolDialogVisible=false"></SymbolDialog>
    <graphic-symbol :visible="graphicDialogVisible" :mapview="mapview" :layer="currentLayer" @handleCloseDialog="graphicDialogVisible=false"></graphic-symbol>
    <FeatureLabelDialog :visible="featureLabelVisible" :mapview="mapview" :layer="currentLayer" @handleCloseDialog="featureLabelVisible=false"></FeatureLabelDialog>
    <add-field :visible="addFieldeVisible" @handleCloseDialog="addFieldeVisible=false" @addField="addField"></add-field>
  </span>
</template>
<script>
import mylayers from "../mapconfig/layers";
import GroupLayer from "esri/layers/GroupLayer";
import searchData from "../widgets/searchData";
import Dialog from "./Dialog";
import SymbolDialog from "../widgets/symbol/SymbolDialog";
import GraphicSymbol from "../widgets/symbol/GraphicSymbol"
import FeatureLabelDialog from "../widgets/symbol/FeatureLabelDialog";
import drawShape from "@/views/map/core/drawShape"
import AddField from "./AddField"

let ctx;
let canvas;
let shape;
let canvasSize = 20;
export default {
  components: {Dialog,SymbolDialog,GraphicSymbol,FeatureLabelDialog,AddField},
  props: {
    mapview:{
      type:Object,
    },
    map:{
      type:Object,
    },
    loaded:{
      type:Function,
    },
    views:{
      type:Array,
    },
    searchPage:{//表示查询页数
      type:Number,
      default: 1
    },
    searchCount:{//表示查询每页的条数
      type:Number,
      default: 200
    },
    searchLayerType:{//查询图层的类型
      type:String,
      default:'feature'
    },
    searchLayerId:{//表示查询图层的图层Id
      type:Number,
    },
  },
  data () {
    return {
       treeData:[],//tree绑定数据
       lastViewsCount:0,
       thisViewsCount:1,
       tmDisplay: false,//单击...出现的菜单可见性
       sliderVisible:false,//透明度slider可见性
       rightMenu:{},//单击...菜单的css样式
       rightMenuWidgets:[//单击...菜单列表
        {id:0,text:"识别",name:"distinguis",icon: '&#xe873;',type:{map:true,baselayergroup:false,groundlayergroup:false,baselayer:false,groundlayer:false,layergroup:false,layer:{feature:false,"map-image":false,tile:false,imagery:false,group:false,"base-dynamic":false,"base-tile":false,common:false}}, visible:true,},
        {id:1,text:"透明度",name:"opacity",icon: '&#xe60e;',type:{map:false,baselayergroup:true,groundlayergroup:false,baselayer:true,groundlayer:true,layergroup:true,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:true,"base-dynamic":true,"base-tile":true,common:true}},visible:true,},
        {id:2,text:"设置最小比例",name:"set_min_scale",icon: '&#xe99a;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:true,groundlayer:false,layergroup:false,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:false,"base-dynamic":true,"base-tile":true,"wms":true,"wmts":true,"kml":true,"csv":true,"geo-rss":true,common:false}},visible:true,},
        {id:3,text:"设置最大比例",name:"set_max_scale",icon: '&#xe72e;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:true,groundlayer:false,layergroup:false,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:false,"base-dynamic":true,"base-tile":true,"wms":true,"wmts":true,"kml":true,"csv":true,"geo-rss":true,common:false}},visible:true,},
        {id:4,text:"清除可视比例",name:"clear_scale_range",icon: '&#xe663;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:true,groundlayer:false,layergroup:false,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:false,"base-dynamic":true,"base-tile":true,"wms":true,"wmts":true,"kml":true,"csv":true,"geo-rss":true,common:false}},visible:true,},
        {id:5,text:"重命名",name:"rename",icon: '&#xe64c;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:true,groundlayer:true,layergroup:true,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:true,"base-dynamic":true,"base-tile":true,common:true}},visible:true,},
        {id:6,text:"置顶",name:"top",icon: '&#xe669;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:false,groundlayer:true,layergroup:true,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:true,"base-dynamic":true,"base-tile":true,common:true}},visible:true,},
        {id:7,text:"上移",name:"up",icon: '&#xe634;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:false,groundlayer:true,layergroup:true,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:true,"base-dynamic":true,"base-tile":true,common:true}},visible:true,},
        {id:8,text:"下移",name:"down",icon: '&#xe636;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:false,groundlayer:true,layergroup:true,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:true,"base-dynamic":true,"base-tile":true,common:true}},visible:true,},
        {id:9,text:"删除图层",name:"remove",icon: '&#xe639;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:false,groundlayer:true,layergroup:true,layer:{feature:true,"map-image":true,tile:true,imagery:true,group:true,"base-dynamic":true,"base-tile":true,common:true}},visible:true,},
        {id:10,text:"打开属性表",name:"attributetable",icon: '&#xe63b;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:false,groundlayer:false,layergroup:false,layer:{feature:true,graphics:true,"map-image":false,tile:false,imagery:false,group:false,"base-dynamic":false,"base-tile":false,common:false}},visible:true,},
        {id:11,text:"缩放到图层",name:"zoomtolayer",icon: '&#xe659;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:true,groundlayer:true,layergroup:false,layer:{feature:true,"map-image":true,tile:true,imagery:true,graphics:true,group:false,"base-dynamic":true,"base-tile":true,"wms":true,"wmts":true,"kml":true,"csv":true,"geo-rss":true,"scene":true,common:false}},visible:true,},
        {id:12,text:"样式",name:"symbol",icon: '&#xe815;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:false,groundlayer:false,layergroup:false,layer:{feature:true,"csv":true,graphics:true,"map-image":false,tile:false,imagery:false,group:false,"base-dynamic":false,"base-tile":false,common:false}},visible:true,},
        {id:13,text:"标注",name:"label",icon: '&#xe76c;',type:{map:false,baselayergroup:false,groundlayergroup:false,layergroup:false,baselayer:false,groundlayer:false,layer:{feature:true,"csv":true,"map-image":false,tile:false,imagery:false,group:false,"base-dynamic":false,"base-tile":false,common:false}},visible:true,},
        {id:14,text:"添加字段",name:"add_field",icon: '&#xe64c;',type:{map:false,baselayergroup:false,groundlayergroup:false,layergroup:false,baselayer:false,groundlayer:false,layer:{graphics:true,common:false}},visible:true,},
        {id:15,text:"属性",name:"property",icon: '&#xed1b;',type:{map:false,baselayergroup:false,groundlayergroup:false,baselayer:true,groundlayer:true,layergroup:true,layer:{feature:true,"map-image":true,tile:true,imagery:false,group:true,"base-dynamic":true,"base-tile":true,common:true}},visible:true,},
        ],
        selectNode:{},
        iniHandles:[],//图层变动的事件集合
        dtresult:[],//表示featurelayer属性表信息临时存储
        dtAttInfo:[],//表示返给父组件map的featurelayer属性表信息
        propertyDialogVisible:false,//表示图层属性窗口可见性
        symbolDialogVisible:false,//表示符号样式窗口可见性
        graphicDialogVisible:false,//表示graphicsLayer符号样式窗口可见性
        featureLabelVisible:false,//表示标注窗口可见性
        addFieldeVisible:false,//表示添加字段窗口可见性
        currentLayer:{},//表示单击节点树对应的对层
        gridFields:[],//图层字段名
        legendLayers:['map-image','tile','feature'],
    }
  },
  methods: {
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
    formatTooltip(val) {//图层透明度slider值格式化
        return val / 100;
      },  
    setLayerOpacity(node, value) {//设置图层透明度
        let numOpacity = value / 100;
        mylayers.setLayerOpacity(node.data.layer, numOpacity);
    },
    handleCheckChange(checkedNodes, checkedKeys) {//设置图层可见性
      // mylayers.LayerVisible(this.views[checkedNodes.id.substr(0,1)], checkedNodes.layer);
      checkedNodes.layer.visible=!checkedNodes.layer.visible;
    },
    isDisableMove(node, direction) {//设置图层上下移按钮可用性
        const brotherNodes = node.parent.childNodes;
        const selfIndex = brotherNodes && brotherNodes.indexOf(node);
        if (direction === 'up') {
          return selfIndex === 0 ? true : false;
        } else {
          return selfIndex === brotherNodes.length - 1 ? true : false;
        }
      },
    handleNodeMove(node, direction) {//设置图层上下移功能顺序
        if (direction === 'up') { 
           mylayers.reorderLayer(node.parent.data.layer,node.data.layer,1);
        } else {
           mylayers.reorderLayer(node.parent.data.layer,node.data.layer,-1);
        }
    },
    handleTopLayer(node, direction) {//设置图层置顶
        if (direction === 'top') {
          let index = 999
          if(node.parent.data.layer.layers){
            index = node.parent.data.layer.layers.length - 1 - node.parent.data.layer.layers.indexOf(node.data.layer)
          }else if(parent.baseLayers){
            index = node.parent.data.layer.baseLayers.length - 1 - node.parent.data.layer.baseLayers.indexOf(node.data.layer)
          }
          mylayers.reorderLayer(node.parent.data.layer,node.data.layer,index);
        }
    },
    clickMenu(weightid,name){
      this.sliderVisible=false;
      if(name=="up"||name=="down"){//图层上下移
        this.handleNodeMove(this.selectNode,name);
      }else if(name=="top"){//图层上下移
        this.handleTopLayer(this.selectNode,name);
      }else if(name=="rename"){//重命名
        this.handleRenameLayer(this.selectNode);
      }else if(name=="opacity"){//设置图层透明度
        this.sliderVisible=true;
      }else if(name=="set_min_scale"){//设置最小比例
        this.handleScale(this.selectNode,0);
      }else if(name=="set_max_scale"){//设置最大比例
        this.handleScale(this.selectNode,1);
      }else if(name=="clear_scale_range"){//清除可视比例
        this.handleScale(this.selectNode,2);
      }else if(name=="distinguis"){//识别地图
        this.handleDistinguis(this.selectNode);
      }else if(name=="zoomtolayer"){//缩放到图层
        this.handleZoomToLayer(this.selectNode);
      }else if(name=="symbol"){//修改featurelayer样式
        this.updateFeaturlayerSymbol(this.selectNode);
      }else if(name=="remove"){//删除图层
        this.handleRemoveLayer(this.selectNode);
      }else if(name=="attributetable"){//查看featurelayer属性表
        this.openFullScreen(2000)
        this.handleAttribute(this.selectNode)
      }else if(name=="label"){//featurelayer要素标注
        this.handleFeatureLabel(this.selectNode);
      }else if(name=="add_field"){//图层属性
        this.handleAddField(this.selectNode)
      }else if(name=="property"){//图层属性
        this.handleOpenLayerPropertyDialog(this.selectNode);
      }
    },
    updateFeaturlayerSymbol(node){//设置featurelayer符号样式
        this.currentLayer=node.data.layer;
        if(this.currentLayer.type == 'graphics'){
            this.graphicDialogVisible=true
        }else{
            this.symbolDialogVisible=true
        }
    },
    handleRenameLayer(node){//图层重命名
      this.currentLayer=null;//先置为null,否则打开图层属性的时候，图层名并没有更改过来
      this.renameLayerTitle(node);
    },
    renameLayerTitle(node) {//图层重命名
      this.$prompt('请输入图层名称', '图层重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '请输入图层名称'
      }).then(({ value }) => {
        if(value.trim()!=""&&value.length<=30){
          node.data.layer.title=value;
          node.data.label=value;
        }else{
          this.$message({showClose: true, type: 'warning', message: '请输入长度不大于30的图层名称'});
        }
      }).catch(() => {});
    },
    handleScale(node,bs){//设置图层可视范围bs：0：设置最小比例，1：设置最大比例，：2：清除可视比例
      this.currentLayer=node.data.layer;
      if(bs==0){
        this.currentLayer.minScale=this.mapview.scale;
      }else if(bs==1){
        this.currentLayer.maxScale=this.mapview.scale;
      }else{
        this.currentLayer.minScale=0;
        this.currentLayer.maxScale=0;
      }
    },
    handleZoomToLayer(node){//缩放到图层
        this.currentLayer=node.data.layer;
        let extent=this.currentLayer.fullExtent;
        let transExtent=mylayers.transformationProjection(extent,this.mapview.spatialReference);
        this.mapview.goTo({target: transExtent});
    },
    handleRemoveLayer(node){//删除图层
      this.$confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
          this.currentLayer=node.data.layer;
          node.parent.data.layer.remove(this.currentLayer);
      })
    },
    handleOpenLayerPropertyDialog(node){//打开图层属性表
       this.propertyDialogVisible=true;
       this.currentLayer=node.data.layer;
    },
    handleFeatureLabel(node){//featurelayer要素标注
      this.featureLabelVisible=true;
      this.currentLayer=node.data.layer;
    },
    handleAddField(node){//graphicslayer添加字段
      this.addFieldeVisible = true
      this.currentLayer=node.data.layer
    },
    handleAttribute(node){
        this.removePreviousInfo();
        this.currentLayer=node.data.layer;
        this.gridFields=[];
        this.gridFields = this.currentLayer.fields.map((field)=>{return field.name});
        if(this.currentLayer.type == 'graphics'){
          this.handleSearchGraphicsAttribute(node)
        }else{
          this.handleSerachFeatureAttribute(node)
        }
    },
    handleSerachFeatureAttribute(node){//查看featurelayer属性表
        if(this.currentLayer.url && this.currentLayer.capabilities.query.supportsPagination){//当featurelayer是发布服务来的，有服务地址时，可分页，能查询总条数
          searchData.SearchFeaturelayerCount(this.currentLayer).then(count=>{
            this.$emit('getSerachCount',count);
            this.searchAllFeaturesByPage(1,1);
          });
        }
        else if(this.currentLayer.customBZ && this.currentLayer.customBZ.count){//从文件中或者从叠加分析结果中得到的featurelayer
            this.$emit('getSerachCount',this.currentLayer.customBZ.count);
            this.searchAllFeaturesByPage(1,1);
        }
        else{
          this.searchAllFeatures()
        }
    },
    handleSearchGraphicsAttribute(){//查看graphicslayer标绘图层属性表
        let intersectLayerAttributeData = this.getNewAttributeFromGraphic(this.currentLayer.graphics.items,this.gridFields)
        this.dtresult.push({id:this.currentLayer.id,name:this.currentLayer.title,data:intersectLayerAttributeData,fields:this.currentLayer.fields});
        this.dtAttInfo=this.dtresult.length==0?[]:this.dtresult;
        this.$emit('showGraphicsTable',this.dtAttInfo);
    },
    searchAllFeaturesByPage(tempPage,bs){//分页查询 bs:1点击属性查询；2：切换当前页
      if(bs!=1 && this.searchLayerType!='feature'){
          let layer=this.currentLayer.findSublayerById(this.searchLayerId)
          searchData.GetSubLayerInfo(layer.url).then(info=>{
              searchData.SearchFeaturesOfPaging(this.mapview,layer,'1=1',["*"],tempPage,this.searchCount,false).then(graphics=>{
              let intersectLayerAttributeData = this.getAttributeFromGraphic(graphics,info.fields.map(field=>field.name));
              this.dtresult.push({id:`${this.currentLayer.id}/${layer.id}`,name:layer.title,data:intersectLayerAttributeData});
              this.dtAttInfo=this.dtresult.length==0?[]:this.dtresult;
              this.$emit('showAnalyseTable',"属性表",this.dtAttInfo,true,false,false);
            });
          })
      }else{
        searchData.SearchFeaturesOfPaging(this.mapview,this.currentLayer,'1=1',["*"],tempPage,this.searchCount,false).then(graphics=>{
          let intersectLayerAttributeData = this.getAttributeFromGraphic(graphics,this.gridFields);
          this.dtresult.push({id:this.currentLayer.id,name:this.currentLayer.title,data:intersectLayerAttributeData});
          this.dtAttInfo=this.dtresult.length==0?[]:this.dtresult;
          this.$emit('showAnalyseTable',"属性表",this.dtAttInfo,true,false,false);
        });
      }
    },
    searchAllFeatures(){//查询所有
      searchData.SearchFeatures(this.mapview,this.currentLayer,'1=1',["*"],false).then(graphics=>{
        let intersectLayerAttributeData = this.getAttributeFromGraphic(graphics,this.gridFields);
        this.dtresult.push({id:this.currentLayer.id,name:this.currentLayer.title,data:intersectLayerAttributeData});
        this.dtAttInfo=this.dtresult.length==0?[]:this.dtresult;
        this.$emit('showAnalyseTable',"属性表",this.dtAttInfo,true,false,true);
      });
    },
    removePreviousInfo(){//打开属性表前先移除之前的graphics
        this.mapview.graphics.removeAll();
        this.dtresult=[];
    },
    getAttributeFromGraphic(graphics,gridFields){//获得图层属性信息
       let intersectLayerAttributeData =graphics && graphics.length<1?[]:graphics.map(function(feature, i) {
          return (
              Object.keys(feature.attributes).filter(function(key) {
                      return gridFields.indexOf(key) !== -1;
                  }) .reduce(function(obj, key) {
                      obj[key] = feature.attributes[key];
                      return obj;
              }, {})
          );
      });
      return intersectLayerAttributeData;
    },
     getNewAttributeFromGraphic(graphics,gridFields){//获得图层属性信息
       let intersectLayerAttributeData =graphics && graphics.length<1?[]:graphics.map(function(feature, i) {
         let obj = Object.keys(feature.attributes).filter(function(key) {
                      return gridFields.indexOf(key) !== -1;
                  }) .reduce(function(obj, key) {
                      obj[key] = feature.attributes[key];
                      return obj;
              }, {})
          obj.geometry = feature.geometry
          obj.attributes = feature.attributes
          return obj
      });
      return intersectLayerAttributeData;
    },
    handleDistinguis(node){
       let screenNum=node.data.id.substr(0,1)==0?"":node.data.id.substr(0,1);
       this.$emit('distinguisScreen',`我的地图${screenNum}`,`mapView${screenNum}`); 
    },
    changeLayer(initial){
      let that=this;
      this.treeData.length=1;
      let layerTreeData=this.treeData;
      let checkedKeys=[];let checkedKeysArr=[[],[],[],[]];
      let viewCount=this.views.length;

  
      let handles = this.views.map((view,index,views)=>{
        let layersCollection = view.map.layers;
        let layerCollectionChangeLisenters=[];

       return  layersCollection.on("change",addChangeListenerToLayerCollection);
        // viewsLisenters.push(eventHandlerIni);
       
        function addChangeListenerToLayerCollection(){
          checkedKeys=null;checkedKeys=[];
          if(index==0){checkedKeysArr[0]=null;checkedKeysArr[0]=[];
          }else if(index==1||index>viewCount-1){
            checkedKeysArr[1]=null;checkedKeysArr[1]=[];
          }else if(index==2||index>viewCount-1){
            checkedKeysArr[2]=null;checkedKeysArr[2]=[];
          }else if(index==3||index>viewCount-1){
            checkedKeysArr[3]=null;checkedKeysArr[3]=[];
          }
         
          //清空所有的layerCollection的监听事件
          for(let i=0;i<layerCollectionChangeLisenters.length;i++){
            layerCollectionChangeLisenters[i].remove();
            layerCollectionChangeLisenters[i]=null;
          }
          //监听事件集合置空
          // layerCollectionChangeLisenters.length=0;
          layerCollectionChangeLisenters=null;
          layerCollectionChangeLisenters=[];
          //刷新结构并重新挂载事件
          refreshMapTocTree(view,index);
        }
        function refreshMapTocTree(view,index){
          let baseMap=view.map.basemap;//that.map.basemap;
          let groundLayer=view.map.ground;//that.map.ground;
          let maptitle=index>0?`(${index})`:"";
          let treeData = [{id:`${index}0`,label:`我的地图${maptitle}`,disabled:true,layer:view.map,children: [],type:"map"}];
          let baseData={id:`${index}1`,label:"底图组",disabled:true,layer:baseMap,children:[],type:"baselayergroup"}
          let groundData={id:`${index}2`,label:"地表高程图层组",disabled:true,layer:groundLayer,children:[],type:"groundlayergroup"}
        
          let layersResult = getLayerArrayFromLayersCollection(layersCollection,2,"layer");
          let basemapResult = getLayerArrayFromLayersCollection(baseMap.baseLayers,layersResult.id,"baselayer");
          let groundResult = getLayerArrayFromLayersCollection(groundLayer.layers,basemapResult.id,"groundlayer");

          let objResult = {id:groundResult.id,result:[]};
          objResult.result=[...layersResult.result,groundData,baseData];
          baseData.children=basemapResult.result;
          groundData.children=groundResult.result;
          
          refeshTreeData(treeData,objResult);
        }
        function getLayerArrayFromLayersCollection(layers,id,layerType){
          let objectResult={id:`${index}${id}`,result:[]};
          let Currentid=id;
            for(let i = layers.items.length-1; i >=0; i--){
              //layers内部不包含BaseMap和Ground
              let  layer=layers.items[i];
              if(layer.type!="graphics" || (layer.type=="graphics" && layer.id.includes("myplotting"))){
                Currentid++;
                let obj={id:`${index}${Currentid}`,label:"",layer:{},opacity:layer.opacity*100,type:layerType};
                if(layer instanceof GroupLayer){
                  obj.label=layer.title;
                  obj.layer=layer;
                  if(layer.visible){
                    if(!checkedKeysArr[index].includes(`${index}${Currentid}`)){
                      checkedKeysArr[index].push(`${index}${Currentid}`);
                    }
                  }
                  //挂载事件
                  let eventHandler = layer.layers.on("change",addChangeListenerToLayerCollection);
                  layerCollectionChangeLisenters.push(eventHandler);
                  //循环读取GroupLayer中所有的Layer
                  let groupLayerResult = getLayerArrayFromLayersCollection(layer.layers,Currentid,layerType);
                  obj.children=groupLayerResult.result;
                  Currentid=groupLayerResult.id;
                  objectResult.result.push(obj);
                  obj.type="layergroup";
                }
                else{
                  obj.label=layer.title;
                  obj.layer=layer;
                  if(obj.layer.customLegend){
                      obj.children=obj.layer.customLegend
                      // obj.layer.customLegend.map(legend=>{ //设置图例的勾选状态
                      //   if(!checkedKeysArr[index].includes(legend.id)){
                      //       checkedKeysArr[index].push(legend.id);
                      //     }
                      // })
                  }else{}//初始化图层的时候，初始化图例，初始化的图层可以从后台获取，但如果是从web添加的图层，前台现去请求，仍然会出现异步问题，可以试试for await ...of
                  objectResult.result.push(obj);
                }
                if(layer.visible && layer.type!="group"){ 
                  if(!checkedKeysArr[index].includes(`${index}${Currentid}`)){
                    checkedKeysArr[index].push(`${index}${Currentid}`);
                  }
                }
              }
            }
          objectResult.id=Currentid;
          return objectResult;
        }
        function refeshTreeData(treeData,objResult){
          //刷新树绑定的数据
          treeData[0].children=objResult.result;
          if(that.thisViewsCount==that.lastViewsCount||index==0){//修改某个mapview中图层个数引起的事件
            //将更新后的树节点更新到树所绑定的数据中
            layerTreeData.splice(index,1,treeData[0]);
          } else {//修改视图个数引起的事件
            if(index==0){
            layerTreeData.length=0;
            }
            //将更新后的树节点更新到树所绑定的数据中
            layerTreeData.splice(index,1,treeData[0]);// layerTreeData.push(treeData[0]); 
          }

          //依据图层visible属性更新树节点的check状态
          for (let i = 0; i < viewCount; i++) {
            if(checkedKeysArr[i].length>0){
              checkedKeys=checkedKeys.concat(checkedKeysArr[i])
            }
          }
          that.$nextTick(() => {
            that.$refs.tree.setCheckedKeys(checkedKeys);
          });
        }
      });
       return handles;
    },
    loaderLayer(){//暴露给父控件加载图层
      if(this.loaded && this.loaded instanceof Function){
          this.loaded();
        }
    },
    leftClick(e,node,obj){//图层树功能菜单
      e.stopPropagation();
      this.$nextTick(() => {
        let type=obj.type;
        this.selectNode=node;
        this.sliderVisible=false;
        this.rightMenuWidgets.every((item,index)=>{
          if(obj.type=="layer"){
            if(item.type.layer[obj.layer.type]){
              if(item.name=="clear_scale_range"){
                item.visible=node.data.layer.maxScale!=0||node.data.layer.minScale!=0?true:false;
              }else{
                item.visible=item.type.layer[obj.layer.type];
              }
            }else{
              item.visible=item.type.layer.common;
            }
          }else{
            item.visible=item.type[obj.type];
          }
          return true;
        });
        this.rightMenu = {top:e.pageY+'px',left:e.pageX-165+'px'}
        this.tmDisplay = true
        document.addEventListener('click', this.foo)
      });
    },
    foo(ev){ // 取消鼠标监听事件 菜单栏
        if(ev.target!==document.getElementById('layerTreeMenu')){
            this.tmDisplay = false
        }
        document.removeEventListener('click', this.foo) // 要及时关掉监听，不关掉的是一个坑，不信你试试，虽然前台显示的时候没有啥毛病，加一个alert你就知道了
    },
    showOrHideLegend(node,obj){//显隐图层图例
      if(obj.children && obj.children.length > 0){
        obj.layer.customLegend=null
        node.data.children.splice(0,obj.children.length)
        this.$refs.tree.updateKeyChildren(obj.id,[])//一定要加更新这句话，否则如果新添加的节点，在原来已经添加过，会出现get,set监听不到的情况
        return
      }
      obj.layer.when(()=>{
        if(obj.layer.type=='feature'){
          let legends= this.getFeatureLegend(obj)
          this.updateLegendNode(legends,obj)
        }else{
          mylayers.getServiceLegend(obj.layer.url,obj.id).then((childrenArr)=>{
            this.updateLegendNode(childrenArr,obj)
          })
        }
      })
    },
    updateLegendNode(childrenArr,obj){
      if(childrenArr.length>0){
        obj.layer.customLegend=childrenArr
          if(!obj.children){
            this.$set(obj, 'children', childrenArr);
          }
          this.$refs.tree.updateKeyChildren(obj.id,childrenArr)//一定要加更新这句话，否则如果新添加的节点，在原来已经添加过，会出现get,set监听不到的情况
      }
    },
    getFeatureLegend(obj){
      if(obj.layer.renderer){
        let childrenArr=[];
        let type=obj.layer.renderer.type;
        if(type=="unique-value"){
          childrenArr= this.initUniquevalueSymbol(obj.layer,obj.id);
        }else if(type=="class-breaks"){
          childrenArr= this.initClassbreaksSymbol(obj.layer,obj.id);
        }else{
          childrenArr= this.initSimpleSymbol(obj.layer,obj.id);
        }
        return childrenArr
      }
    },
    initUniquevalueSymbol(layer,nodeId){//初始化唯一值符号
      let childrenArr=layer.renderer.uniqueValueInfos.map((item,index)=>{
        if(item.symbol.type== "picture-marker"){
          return  { id: `${nodeId}legend${index}`, label: item.label, disabled:true, type: "legend",imageData:item.symbol.url };
        }else{
          ctx.save();
          ctx.clearRect(0,0,canvasSize,canvasSize)//清空画布，重新绘制
          let obj={symbolColor:item.symbol.color,outlineColor:item.symbol.outline.color,size:canvasSize,dash:2}
          shape.Product(layer.geometryType).Product(item.symbol.style,item.symbol.outline.style).draw(obj,ctx);
          let src=canvas.toDataURL();
          ctx.restore();
          let newChild = { id: `${nodeId}legend${index}`, label: item.label, disabled:true, type: "legend",imageData:src };
          return  newChild
        }
      });
      return childrenArr
    },
    initClassbreaksSymbol(layer,nodeId){//初始化分级符号
      let childrenArr=layer.renderer.classBreakInfos.map((item,index)=>{
        if(item.symbol.type== "picture-marker"){
          return  { id: `${nodeId}legend${index}`, label: item.label, disabled:true, type: "legend",imageData:item.symbol.url };
        }else{
          ctx.save();
          ctx.clearRect(0,0,canvasSize,canvasSize)//清空画布，重新绘制
          let obj={symbolColor:item.symbol.color,outlineColor:item.symbol.outline.color,size:canvasSize,dash:2}
          shape.Product(layer.geometryType).Product(item.symbol.style,item.symbol.outline.style).draw(obj,ctx);
          let src=canvas.toDataURL();
          ctx.restore();
          let newChild = { id: `${nodeId}legend${index}`, label: item.label, disabled:true, type: "legend",imageData:src };
          return  newChild
        }
      });
      return childrenArr
    },
    initSimpleSymbol(layer,nodeId){//初始化简单类型符号
      let childrenArr=[]
      if(layer.geometryType!= 'text'){
        ctx.save();
        ctx.clearRect(0,0,canvasSize,canvasSize)//清空画布，重新绘制
        let obj={symbolColor:layer.renderer.symbol.color,outlineColor:layer.renderer.symbol.outline.color,size:canvasSize,dash:2}
        shape.Product(layer.geometryType).Product(layer.renderer.symbol.style,layer.renderer.symbol.outline.style).draw(obj,ctx);
        let src=canvas.toDataURL();
        ctx.restore();
        let newChild = { id: `${nodeId}legend0`, label: layer.renderer.label||layer.title, disabled:true, type: "legend",imageData:src };
        childrenArr.push(newChild)
      }
      return childrenArr
    },
    addField(Field){
      if(!this.currentLayer.fields){
        this.currentLayer.fields = []
      }
      this.currentLayer.fields.push(Field)
      this.currentLayer.graphics.items.forEach(graphic=>{
        graphic.attributes[Field.name] = ''
      })
      this.currentLayer = null
    }
  },
  mounted: function () {
      this.iniHandles=this.changeLayer(true);
      this.loaderLayer();

      canvas=document.createElement("canvas");
      canvas.height=canvasSize;
      canvas.width=canvasSize;
      ctx=canvas.getContext("2d");
      shape= new drawShape.ShapeFactory;
      ctx.save();
  },
  destroyed () {
    this.iniHandles.map((handle)=>{handle.remove();handle=null; })
  },
  watch:{
    views :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
      if(val.length!=oldVal.length){
        if(this.iniHandles[0]){//删除初始创建的监视事件，否则第一次监视的事件一直存在
          this.iniHandles.map((handle)=>{handle.remove();handle=null; })
        }
        this.thisViewsCount=val.length;
        this.lastViewsCount=oldVal.length;
        this.iniHandles= this.changeLayer(false);
        this.loaderLayer();
      }
    },
    searchPage:function (val, oldVal) {//当前页改变的时候
      this.removePreviousInfo();
      this.searchAllFeaturesByPage(val,2);
    },
  },
 }
</script>
<style scoped>
.treeNode {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    overflow:auto;
}
.layername{
    max-width:290px;
    text-overflow:ellipsis;
    white-space:nowrap;
    overflow:hidden;
}
.layer_btn{
  margin-bottom:5px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.icon{
    margin-right: 5px;
}
.tree_menu{
  width:150px;
  position: fixed;
}
</style>
