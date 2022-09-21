<!--绘制工具插件 -->
<template>
    <el-card class="box-card" id="onemap-draw-analyse-button">
        <div slot="header">
            <span>叠加分析</span>
            <i class="el-icon-close" style="float: right; padding: 3px 0;cursor: pointer;font-size: 16px" @click="handClose"></i>
        </div>
        <span v-show="containVisible[0].visible">
            <i class="el-icon-caret-right"></i> <span>设置源图形</span>
            <span class="deleteAllPolygonContainer" @click="removePolygon">
                <i class="el-icon-delete"></i><span  class="deleteAllPolygon"> 全部清除</span>
            </span>
            <div class="dataSourceType">
                <el-tooltip effect="dark" content="通过鼠标自由绘制图形" placement="right">
                    <el-button size="mini" icon="el-icon-edit" @click="drawPolygon">图上绘制</el-button>
                </el-tooltip>
                <el-tooltip effect="dark" placement="right">
                    <div slot="content">选择地图上最上层的要素图层；<br/>单击选择，或拉框选择；<br/>按住Shift键可以多选，或切换选中状态</div>
                    <el-button size="mini" icon="el-icon-thumb" @click="selectPolygon">图上选择</el-button>
                </el-tooltip>
            </div>
            <div class="dataSourceType">
                <el-tooltip effect="dark" content="上传包含所有shapefile文件的ZIP等归档" placement="right">
                    <el-button size="mini" icon="el-icon-upload" @click="uploadShp">图形上传</el-button>
                </el-tooltip>
                <!-- <el-popover
                    style="margin-left:10px"
                    placement="bottom"
                    trigger="click">
                     <el-cascader-panel :options="xzqOptions" :props="{checkStrictly: true,lazy:true,lazyLoad:loadXZQnode}" @change="changeXZQNode"></el-cascader-panel>
                    <el-button size="mini" icon="el-icon-house" slot="reference" @click="selectXZQ">区域选择</el-button>
                </el-popover> -->
            </div>
            <div class="resultDes" v-show="false"> {{describeOfDraw}}</div>
            <el-divider/>
            <el-button type="primary" size="small" @click="removePolygon">清 除</el-button>
            <el-button type="primary" size="small" @click="beginAnalyse">下一步</el-button>
        </span>
        <span v-show="containVisible[1].visible">
            <i class="el-icon-caret-right"></i> <span>设置分析图层</span>
            <span class="deleteAllPolygonContainer" style="margin-left:5px" @click="lookInfo">
                <i class="el-icon-arrow-down"></i><span  class="deleteAllPolygon"> 属性</span>
            </span>
            <span class="deleteAllPolygonContainer" @click="removePolygon">
                <i class="el-icon-delete"></i><span  class="deleteAllPolygon"> 全部清除</span>
            </span>
            <div class="dataSourceLayer">
                <!-- <br /> -->
                <span>叠加图层</span>
                <!-- <el-select v-model="layerId" placeholder="请选择" @focus="GetVisiblePolygonFeatureLayer">
                    <el-option
                    v-for="(item,index) in featureLayersOptions"
                    :key="index"
                    :label="item.label"
                    :value="index">
                    </el-option>
                </el-select> -->
                <el-cascader v-model="layerId" placeholder="请选择图层" :show-all-levels="false" :options="featureLayersOptions" @visible-change="GetVisiblePolygonFeatureLayer"></el-cascader>
                <div style="margin-top:5px;color:#F56C6C;font-size:10px">请选择图层</div>
            </div>
            <el-divider/>
            <el-button type="primary" size="small" @click="toggleVisible(0)">上一步</el-button>
            <el-button type="primary" size="small" @click="finish">分 析</el-button>
        </span>
        <span v-show="containVisible[2].visible">
            <p style="font-size:12px;margin-top:5px" v-html ="describeOfInterset"></p>
            <i class="el-icon-caret-right"></i> <span>设置分析结果</span>
            <span class="deleteAllPolygonContainer" @click="removePolygon">
                <i class="el-icon-delete"></i><span  class="deleteAllPolygon"> 全部清除</span>
            </span>
            <el-radio-group v-model="exportOutput">
                <el-radio label="SHP">SHP</el-radio>
                <el-radio label="TXT">TXT</el-radio>
                <el-radio label="GEOJSON">GEOJSON</el-radio>
            </el-radio-group>
            <el-divider/>
            <el-button type="primary" size="small" @click="toggleVisible(1)">上一步</el-button>
            <el-button type="primary" size="small" @click="exportResult">导 出</el-button>
        </span>
        <form :action="downFileUrl" method="post" ref="downShpForm">
            <input type="hidden" name="fileType" value = "shp"/>
            <input type="hidden" name="json" ref="downShpInput"/>
        </form>
    </el-card>
</template>

<script>
import axios from 'axios';
import Draw from "esri/views/draw/Draw"; //叠加分析
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from "esri/Graphic";
import Polygon from "esri/geometry/Polygon"
import Extent from "esri/geometry/Extent"
import Expand from "esri/widgets/Expand"; //expand可以将插件收起来

import layers from "../mapconfig/layers";
import myconfig from "../mapconfig/myconfig";
import geodesicUtils from "../core/GeodesicUtils";

let loading;
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
        mapview:{
            type:Object,
        },
        widgetShow:{//组件显隐状态
            type: Boolean,
        },
        shpLayerId:{//从shp文件中添加的layerId
            type: String,
        },
        addShpDate:{//从shp文件中添加的时间
            type: Number,
        },
        setMapTip:{//设置地图鼠标悬浮的文本
            type:Function
        }
    },
    data () {
        return {
            bkExpand:{},
            sourceIdentify:1,//1表示绘制，2表示图上选择，3表示文件上传,4表示按区域选择
            position: myconfig.widgetOnScreen.draw.position,
            visible:myconfig.widgetOnScreen.draw.visible,
            analyseUrl:myconfig.widgetOnScreen.draw.drawIntersectAnalyseUrl,
            downFileUrl:myconfig.widgetOnScreen.draw.downFileUrl,
            draw:{},
            intersetGraphsLayer:{},
            dataTypeContainer:true,
            layerId:"",//选中图层的layerid
            featureLayersOptions:[],//featruelays列表,
            featureLayersFromShp:[],//绘制面从后台获取相交shp
            featureLayersFromShpGraphics:[],//绘制面从后台获取相交要素
            containVisible:[{id:0,visible:true,name:"setSource"},{id:1,visible:false,name:"setAnalyseLayer"},{id:2,visible:false,name:"analyseResult"},],
            dtresult:[],
            dtAnalyseAttFromShp:[],
            describeOfInterset:"",//叠加结果图形描述
            describeOfDraw:"",//绘制图形描述
            exportOutput: "SHP",//导出成果格式
            isAddShp:false,//是否选择添加shp
            topLayer:{},//图上选择最上边的featurelayer
            xzqOptions: [],//按区域选择级联面板数据内容
            allXZQ:[],//包括所有的行政区
            xzq:myconfig.widgetOnScreen.draw.xzq,
            xzqValueField:"",
            xzqLabelField:"",
        }
    },
    mounted: function () {
        this.intersetGraphsLayer = new GraphicsLayer({id:"intersetAnalysis"});
        this.mapview.map.add(this.intersetGraphsLayer);
        this.draw = new Draw({
            view: this.mapview,
        });
        this.bkExpand = new Expand({
            view: this.mapview,
            content: document.getElementById("onemap-draw-analyse-button"),
            expanded: true
        });
        if(this.visible){
            this.mapview.ui.add(this.bkExpand,this.position);
        }
        // this.mapview.ui.add("onemap-draw-analyse-button",this.position);
        this.$emit('getDrawObj',this.draw,this.intersetGraphsLayer);
        // this.$axiosWithToken.get("/basemapinfo/selectBasemapinfo").then(response => {//从后台获取地图基本信息
        //     if(response.code==200){
        //         if(response.data.length>0 && response.data[0].areaInfo!=""){
        //             let a=response.data[0];
        //             let mapConfig = eval('(' + response.data[0].areaInfo + ')');
        //             this.xzqValueField=mapConfig.widgetOnScreen.draw.xzq[0].valueField.trim();
        //             this.xzqLabelField=mapConfig.widgetOnScreen.draw.xzq[0].labelField.trim();
        //             for (let i = 0; i < this.xzq.length; i++) {
        //                 this.xzq[i]["6"].layer=layers.getLayerFromType("FeatureLayer",mapConfig.layersInfo.xjxzq.url.trim());//this.xzq[i]["6"].url
        //                 this.xzq[i]["9"].layer=layers.getLayerFromType("FeatureLayer",mapConfig.layersInfo.xzxzq.url.trim());//this.xzq[i]["9"].url
        //                 this.xzq[i]["12"].layer=layers.getLayerFromType("FeatureLayer",mapConfig.layersInfo.cjxzq.url.trim());//this.xzq[i]["12"].url
        //                 this.getXZQOptions(this.xzq[i]["6"].layer).then(this.getXZQOptions(this.xzq[i]["9"].layer)).then(this.getXZQOptions(this.xzq[i]["12"].layer));
        //             }
        //         }
        //     }
        // })
    },
    destroyed () {
        this.removePointerdownHander();
    },
    methods: {
        getXZQOptions(layer){//获取行政区名称等
            let query = layer.createQuery();
            return layer.queryFeatures(query).then(this.getXZQdmAndMc);
        },
        getXZQdmAndMc(response){
            let features = response.features;
            let valueField=this.xzqValueField;
            let labelField=this.xzqLabelField;
            let values = features.map(function(feature) {
                return {value:feature.attributes[valueField].trim(),label:feature.attributes[labelField].trim()};
            });
            if(values.length>0){
                this.allXZQ.push(values);
            }
            if(this.xzqOptions.length<1 && this.allXZQ[0]){
                this.xzqOptions=this.allXZQ[0];
            }
        },
        loadXZQnode(node,resolve){//加载行政区级联表
            let data;
            if(!node.root && node.value.length<12){//不是根节点
                if(node.value.length==6){
                    let xz=this.allXZQ.filter(xzArr=>xzArr[0].value.length==9 && xzArr[0].value.startsWith(node.value));
                    if(xz){
                       data=xz.find(item=>item[0].value.startsWith(node.value));
                    }
                }else if(node.value.length==9){
                    let  cunArr=this.allXZQ.filter(cunArr=>cunArr[0]["value"].length==12 && cunArr[0]["value"].startsWith(node.value.substr(0,6)));
                    if(cunArr && cunArr[0]){
                        let cunTempArr=cunArr[0].filter(item=>item.value.startsWith(node.value));
                        if(cunTempArr){
                            data=cunTempArr.map((cun)=>{
                                return {value:cun.value,label:cun.label,leaf:true}
                            });
                        }
                    }
                }
            }
            resolve(data);
        },
        init(bs){//点击选取数据初始化
            this.describeOfDraw="";
            this.sourceIdentify=bs;
            this.draw.complete();
            this.intersetGraphsLayer.graphics.removeAll();
            this.removeLayersFormShpOfMapview();
        },
        removeLayersFormShpOfMapview(){//移除之前分析的结果,包括绘制的图形，叠加添加的图形，列表信息，总体描述等
            this.describeOfInterset="";
            this.mapview.graphics.removeAll();
            this.mapview.map.removeMany(this.featureLayersFromShp);
            this.featureLayersFromShp=[];
            this.featureLayersFromShpGraphics=[];
            this.dtresult=[];
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
            }
        },
        selectXZQ(){//按行政区选择
            this.init(4);
            this.isAddShp=false;
            document.documentElement.style.cursor = '';
            this.removePointerdownHander();
            layers.reorderLayer(this.mapview.map,this.intersetGraphsLayer, this.mapview.map.layers.length-1-this.mapview.map.layers.indexOf(this.intersetGraphsLayer));//将绘制图层移动到最上层
        },
        changeXZQNode(value){//切换选择区域
            this.intersetGraphsLayer.graphics.removeAll();
            let level=value[value.length-1].length;
            let queryParams = this.xzq[0][`${level}`].layer.createQuery();
            queryParams.where = "xzqdm like '" + value[value.length-1] + "%'";
            this.xzq[0][`${level}`].layer.queryFeatures(queryParams).then(this.drawQueryFeatures);
        },
        setWidgetVisible(btnid,visible){//控制分析组件显隐
            if(this.mapview.ui.find(this.bkExpand)){
                this.mapview.ui.remove(this.bkExpand);
            }
            if(visible){
                this.bkExpand.expanded=true
                this.mapview.ui.add(this.bkExpand,this.position);
            }else{
                this.removePolygon();
            }
        },
        toggleVisible(visibleIndex){//切换显示页
            this.containVisible.map((item,index,array)=>{
                visibleIndex==index?item.visible=true:item.visible=false;
                return true;
            });
        },
        beginAnalyse(){//选择图形确定
            this.isAddShp=false;
            document.documentElement.style.cursor = '';
            this.removePointerdownHander(); 
            if( this.intersetGraphsLayer.graphics.length<1){
                this.$message({showClose: true,message:'没有数据源',type:'warning'});
            }else{
                this.toggleVisible(1);
                this.layerId="";
            }
        },
        drawPolygon(){//点击绘制
            this.init(1);
            this.isAddShp=false;
            this.removePointerdownHander();
            let action = this.draw.create("polygon");
            this.mapview.focus();//设置在地图上聚焦，激活键盘快捷键
            document.documentElement.style.cursor = 'crosshair';
            if(this.setMapTip){
                this.setMapTip(true,'单击确定起点，双击结束')
            }
            layers.reorderLayer(this.mapview.map,this.intersetGraphsLayer, this.mapview.map.layers.length-1-this.mapview.map.layers.indexOf(this.intersetGraphsLayer));//将绘制图层移动到最上层
            action.on("cursor-update", this.handleDrawCursorUpdate);//注册鼠标移动更新事件
            action.on("draw-complete", this.handleDrawComplete);//注册绘制完成事件
        },
        selectPolygon(){//图上选择
            this.init(2);
            this.isAddShp=false;
            layers.reorderLayer(this.mapview.map,this.intersetGraphsLayer, this.mapview.map.layers.length-1-this.mapview.map.layers.indexOf(this.intersetGraphsLayer));//将绘制图层移动到最上层
            let tempfeatureLayers=this.mapview.map.allLayers.items.filter((item)=> item.type=="feature"&& item.visible==true&&item.geometryType=="polygon");
            
            if(tempfeatureLayers.length<1){
                this.$message({showClose: true,message:'没有合适的要素数据',type:'warning'});
            }else{
                if(this.setMapTip){
                    this.setMapTip(true,'单击选择，或拉框选择')
                }
                this.topLayer=tempfeatureLayers[tempfeatureLayers.length-1];
                // let view=this.mapview;
                document.documentElement.style.cursor = 'crosshair';
                if(!pointerdownHander){
                    pointerdownHander=this.mapview.on("pointer-down", this.eventHandler);
                    pointermoveHander=this.mapview.on("pointer-move", this.eventHandler);
                    pointerupHander=this.mapview.on("pointer-up", this.eventHandler);
                    pointerdragHander=this.mapview.on("drag", this.eventHandler);
                    pointerkeydownHander=this.mapview.on("key-down",this.eventHandler);
                    pointerkeyupHander=this.mapview.on("key-up",this.eventHandler);
                }
            }
        },
        eventHandler(event) {//点选事件
            if(event.type=="pointer-down"){
                pointerdownEvent=event;
                let tempfeatureLayers=this.mapview.map.allLayers.items.filter((item)=> item.type=="feature"&& item.visible==true&&item.geometryType=="polygon");
                if(tempfeatureLayers.length>0){
                    if(this.topLayer!=tempfeatureLayers[tempfeatureLayers.length-1]){//在选择过程中切换图层时，重新获取分析图层
                        this.mapview.graphics.removeAll();
                        this.intersetGraphsLayer.graphics.removeAll();
                        this.topLayer=tempfeatureLayers[tempfeatureLayers.length-1];
                        layers.reorderLayer(this.mapview.map,this.intersetGraphsLayer, this.mapview.map.layers.length-1-this.mapview.map.layers.indexOf(this.intersetGraphsLayer));//将绘制图层移动到最上层
                    }
                }
            }
            else if(event.type=="pointer-move"){
                if(pointerdownEvent){
                    event.stopPropagation ();
                    this.mapview.graphics.removeAll();
                    if(!pointerkeydownEvent){//松开Shift键
                        this.intersetGraphsLayer.graphics.removeAll();
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
                    let queryParams = this.topLayer.createQuery();
                    queryParams.geometry = extent;
                    queryParams.outFields=this.topLayer.fields.map(field=>field.name);
                    this.mapview.graphics.removeAll();
                    if(!pointerkeydownEvent){//松开Shift键
                        this.intersetGraphsLayer.graphics.removeAll();
                    }
                    this.topLayer.queryFeatures(queryParams).then(this.drawQueryFeatures);
                }
                pointerdownEvent=null;
                if(this.setMapTip){
                    this.setMapTip(false)
                }
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
        drawQueryFeatures(results){//绘制通过框选的要素
            for (let i = 0; i < results.features.length; i++) {
                this.drawGraphics(results.features[i].geometry,results.features[i].attributes,false);
            }
            if(this.sourceIdentify==4){
                this.mapview.goTo({target: results.features})
            }
        },
        drawGraphics(geometry,attributes,isAddToMap){//由geometry获取绘制要素
            let graphic=new Graphic({geometry:geometry,attributes:attributes});
            graphic.symbol={
                type: "simple-fill", 
                color: [ 51,51, 204, 0.9 ],
                style: "solid",
                outline: {
                    color: "blue",
                    width: 1
                }
            }
            //添加新选择的,并将试图转到新的视图
            if(isAddToMap){
                this.mapview.graphics.add(graphic);
            }else{
                if(pointerkeydownEvent){//按住Shift键
                   let exitGraphic=this.intersetGraphsLayer.graphics.find(item=>JSON.stringify(item.attributes)==JSON.stringify(graphic.attributes) || JSON.stringify(item.geometry.rings)==JSON.stringify(graphic.geometry.rings));
                    if(exitGraphic && this.intersetGraphsLayer.graphics.includes(exitGraphic)){
                        this.intersetGraphsLayer.graphics.remove(exitGraphic);
                    }else{
                        this.intersetGraphsLayer.graphics.add(graphic);
                    }
                }else{
                    this.intersetGraphsLayer.graphics.add(graphic);
                }
            }
        },
        getGraphics(response) {//获取高亮点选要素
            if (response.results.length) {
                let layer=this.topLayer;
                let count=response.results.filter(function(result) {return result.graphic.layer === layer;}).length;
                if(count>0){
                    let graphic = response.results.filter(function(result) {
                        return result.graphic.layer === layer;
                    })[0].graphic;
                    if(!pointerkeydownEvent){//松开Shift键
                        this.intersetGraphsLayer.graphics.removeAll();
                    }
                    graphic.symbol={
                        type: "simple-fill",
                        color: [ 51,51, 204, 0.9 ],
                        style: "solid",
                        outline: {
                            color: "blue",
                            width: 1
                        }
                    }
                    //添加新选择的,并将试图转到新的视图
                    if(pointerkeydownEvent){//按住Shift键
                        let exitGraphic=this.intersetGraphsLayer.graphics.find(item=>JSON.stringify(item.attributes)==JSON.stringify(graphic.attributes) || JSON.stringify(item.geometry.rings)==JSON.stringify(graphic.geometry.rings));
                        if(exitGraphic){
                            this.intersetGraphsLayer.graphics.remove(exitGraphic);
                        }else{
                            this.intersetGraphsLayer.graphics.add(graphic);
                        }
                    }else{
                        this.intersetGraphsLayer.graphics.add(graphic);
                    }
                }else{
                    if(!pointerkeydownEvent){//松开Shift键
                        this.intersetGraphsLayer.graphics.removeAll();
                    }
                }
            }else{
                if(!pointerkeydownEvent){//松开Shift键
                    this.intersetGraphsLayer.graphics.removeAll();
                }
            }
        },
        uploadShp(){//上传文件
           this.init(3);
           document.documentElement.style.cursor = '';
           this.removePointerdownHander();
           this.$emit('showAddShpDialog');
           this.isAddShp=true;

        },
        addShpPolygon(){//添加shp数据
            this.isAddShp=false; 
            this.intersetGraphsLayer.graphics.removeAll();
            let shplayer= this.mapview.map.findLayerById(this.shpLayerId);
            if(shplayer){
                let createGraphicFunc=this.createGraphic;
                let graphics= shplayer.customBZ.data.features.map((feature)=>{
                    return createGraphicFunc(feature.geometry.rings);
                })
                this.intersetGraphsLayer.graphics.addMany(graphics);
            }
        },
        removePolygon(){//移除绘制
            document.documentElement.style.cursor = '';
            this.describeOfDraw="";
            this.removePointerdownHander();
            this.mapview.graphics.removeAll();
            this.intersetGraphsLayer.graphics.removeAll();
            this.removeLayersFormShpOfMapview();
            this.toggleVisible(0);
            this.exportOutput="SHP";
            this.$emit('showAnalyseTable',this.describeOfInterset,this.dtAnalyseAttFromShp,false);
        },
        handleDrawCursorUpdate(evt){//鼠标移动更新事件
            this.createPolygonGraphic(evt.vertices);
        },
        handleDrawComplete(evt){//绘制完成事件
            this.createPolygonGraphic(evt.vertices);
            document.documentElement.style.cursor = '';
            let area=this.calculatePolygonArea(this.intersetGraphsLayer.graphics.items[0].geometry.rings);
            this.describeOfDraw="绘制图形面积: "+area+" m²";
            if(this.setMapTip){
                this.setMapTip(false)
            }
        },
        calculatePolygonArea(rings){//计算绘制的图形面积
            let polygons = rings.map(ring=>new Polygon({rings: ring}));
            let areas = geodesicUtils.geodesicUtils.geodesicAreas(polygons,"square-meters");
            let sumAreaFunc=(...areas) => [].concat(...areas).reduce((acc, val) => acc + val, 0);
            let sumArea=sumAreaFunc(areas)
            // return Math.round(sumArea);
            return Math.abs(sumArea.toFixed(4));
        },
        createPolygonGraphic(vertices){//创建面图形
            this.mapview.graphics.removeAll();
            this.intersetGraphsLayer.graphics.removeAll();
            let graphic=this.createGraphic(vertices);
            this.intersetGraphsLayer.graphics.add(graphic);
        },
        createGraphic(vertices){
            let polygon = {
            type: "polygon", // autocasts as Polygon
            rings: vertices,
            spatialReference: this.mapview.spatialReference
            };
            let graphic = new Graphic({
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
        GetVisiblePolygonFeatureLayer(visible){//获得可见的featureLayer列表，geometryType还得是"polygon"类型的
            if(visible){
                let feaLayers=this.mapview.map.allLayers.items.filter(item=> item.type=="feature" && item.geometryType=="polygon" && item.url!=null);
                let fealayersGroup=feaLayers.map(function(layer){
                    let obj={value:layer.id,label:layer.title,url:`${layer.url}/${layer.layerId}`,type:layer.type};
                    return obj;
                })
                let layers=this.mapview.map.allLayers.items.filter(function(layer){
                    return (layer.type== "map-image" || layer.type== "tile") && layer.url!=null && layer.capabilities.operations.supportsQuery;
                });
                let LayersGroup=layers.map(layer=>{
                    return{
                        value:layer.id,label:layer.title,url:layer.url,type:layer.type,
                        children:layer.sublayers.items.map(sublayer=>{
                            return {
                                value:`${layer.id}/${sublayer.id}`,label:sublayer.title,url:sublayer.url,type:'sublayer',
                            }
                        })
                    }
                })
                this.featureLayersOptions=[...fealayersGroup,...LayersGroup]
            }
        },
        finish(){//开始分析
            this.removeLayersFormShpOfMapview();
            if( this.layerId===""){
                this.$message({showClose: true,message:'没有叠加图层',type:'warning'});
            }else{
                let obj=this.getTitleAndUrl()
                if(this.intersetGraphsLayer.graphics.items[0] && obj.title && obj.url){
                    this.openFullscreenLoading();
                    let tempmainJson={
                        "geometryType": "esriGeometryPolygon",
                        "spatialReference":{
                            "wkid": this.intersetGraphsLayer.graphics.items[0].geometry.spatialReference.wkid,
                            "latestWkid": this.intersetGraphsLayer.graphics.items[0].geometry.spatialReference.wkid.latestWkid,
                        },
                        "features":this.intersetGraphsLayer.graphics.items.map((item)=>
                                    {
                                        return { "geometry":{"rings":item.geometry.rings}}
                                    }),
                    };
                    let re=/[^\u4e00-\u9fa5a-zA-Z0-9]/g;
                    // let tempTitle=this.featureLayers[this.layerId].title.trim().replace(re,"");
                    let prama={
                        "geographicDataList":[{
                            "name": obj.title.trim().replace(re,""),//去除除中英文数字外的符号//this.featureLayers[this.layerId].title.trim().replace(/\s/g,""),//传给后台生成shp文件名
                            "path":`${obj.url}/query`,
                            "workSpaceType": 3,//表示web服务

                        },],
                        "mainAreaData":[{
                            "name":"main",
                            "workSpaceType":4,
                            "dataJSON":JSON.stringify(tempmainJson),
                        }]
                        // "mainJson": JSON.stringify(tempmainJson),
                    };
                    this.analyse(this.analyseUrl,prama);
                    this.toggleVisible(2);
                }else{
                    this.$message({showClose: true,message:'没有源图层',type:'warning'});
                }
            }
        },
        getTitleAndUrl(){
            let selectObj={title:'',url:''}
            try {
                if(this.layerId.length>1){
                let parentLayer=this.featureLayersOptions.find(item=>item.value==this.layerId[0])
                let layer=parentLayer.children.find(sublayer=>sublayer.value==this.layerId[this.layerId.length-1])
                selectObj.title=layer.label
                selectObj.url=layer.url
                }else{
                    let obj=this.featureLayersOptions.find(item=>item.value==this.layerId)
                    selectObj.title=obj.label
                    selectObj.url=obj.url
                }
            } catch (error) {
                console.log(error)
            }
            return selectObj
        },
        openFullscreenLoading(){//Loading加载
            loading = this.$loading({
            lock: true,
            text: '分析中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
            });
        },
        analyse(url,prama){//从后台获取分析结果
            axios.post(url, prama)
            .then((response)=> {
                if(response.data.code=="-1"){//后台错误码
                    this.$message.error(`${response.data.message} 请检查坐标系统等！`);
                }else{
                    this.describeOfInterset=`经分析，源图形与${this.getTitleAndUrl().title}重叠要素共：<b>${response.data.data[0].geoGraphicJson.features.length}</b>个，重叠总面积合计：<b>${response.data.data[0].area.toFixed(3)}</b>平方米。`
                    //`叠加总面积:${response.data.data[0].area}平方米`//缺少一个坐标转换
                    this.getLayersFromShp(response.data.data);
                }
                loading.close();
                this.dtAnalyseAttFromShp=this.dtresult.length==0?[]:this.dtresult;
                this.$emit('showAnalyseTable',this.describeOfInterset,this.dtAnalyseAttFromShp,true);
            })
            .catch(function (error) {
                loading.close();
                console.log(error);
            });
        },
        getLayersFromShp(dataCollection){//获得后台返回的shp数组
            let layerInfo=this.getTitleAndUrl()
            dataCollection.map((data,index)=>{
                let featureLayerObj=new layers.getFeatureLayerFromShp(`intersectAnalyseLyr${index}`,0,`${layerInfo.title.title}${index}叠加分析`,data.geoGraphicJson.features,data.geoGraphicJson.fields,"叠加分析结果",data.geoGraphicJson);
                this.featureLayersFromShp.push(featureLayerObj.featureLayer);
                this.featureLayersFromShpGraphics.concat(featureLayerObj.graphics);
                let gridFields = data.geoGraphicJson.fields.map((field)=>{return field.name});
                let intersectLayerAttributeData = featureLayerObj.graphics.map(function(feature, i) {
                    return (
                        Object.keys(feature.attributes).filter(function(key) {
                                return gridFields.indexOf(key) !== -1;
                            }) .reduce(function(obj, key) {
                                obj[key] = feature.attributes[key];
                                return obj;
                        }, {})
                    );
                });
                this.dtresult.push({id:`intersectAnalyseLyr${index}`,name:`${layerInfo.title.title}${index}叠加分析`,data:intersectLayerAttributeData});
            });
            this.addLayerFromShp();
        },
        addLayerFromShp(){//mapview添加分析后的叠加shp,并缩放
            this.mapview.map.addMany(this.featureLayersFromShp);
            this.mapview.goTo(this.featureLayersFromShpGraphics).catch(function(error) {
                if (error.name != "AbortError") {
                    console.error(error);
                }
            });
        },
        lookInfo(){//查看属性表信息
            this.$emit('showAnalyseTable',this.describeOfInterset,this.dtAnalyseAttFromShp,true);
        },
        exportResult(){//导出分析结果
            if(this.exportOutput=="SHP"){
                this.exportShp();
            }
        },
        exportShp(){//导出shp
            if(this.featureLayersFromShp.length<1){
                this.$message({showClose: true,message:'没有相交数据',type:'warning'});
            }
            this.featureLayersFromShp.map((layer)=>{
                this.$refs.downShpInput.value=JSON.stringify(layer.customBZ.data);
                this.$refs.downShpForm.submit();
            })
        },
        handClose(){
            this.$emit("handCloseMapTool",'intersectAnalyse')
        }
    },
    watch:{
        addShpDate:function (val, oldVal) {
            if(this.shpLayerId!="" && this.isAddShp){
                this.addShpPolygon();
            }
        },
        widgetShow :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
            this.setWidgetVisible("onemap-draw-analyse-button",val);
        },
    },
}
</script>
<style scoped>
    .box-card {
        width:350px; /*18vw;*/
        max-height:50vh;
        overflow: auto;
    }
    .dataSourceType{
        padding:10px 0px 0px 10px;
    }
    .dataSourceLayer{
        margin-top: 10px;
        margin-left: 10px;
        font-size: x-small;
    }
    .deleteAllPolygonContainer{
        float: right;
        cursor: pointer;
    }
    .footer{
        float: right;
    }
    .deleteAllPolygon{
        font-size:12px;
    }
    .resultDes{
        font-size:12px;
        margin-top: 10px;
    }
</style>
