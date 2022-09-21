<!--导出地图 -->
<template>
 <div>
    <div v-show="visible">
        <!-- <div style="display: flex; justify-content: flex-end;">
            <div>
                <el-button type="text" @click="restore">恢复默认</el-button>
                <el-button type="primary" size="mini" style="margin-right:10px" @click="showDialog">导入模板</el-button>
            </div>
        </div> -->
        <div v-show="initVisible">
            <span>专题图设置</span>
            <el-card class="settingsCard">
                <div class="mapWidgetSettings">
                    <span>显示设置：</span>
                    <template v-for="(widget,index) in thematicMapSettings">
                        <el-checkbox class="mapSettings" :key="index" v-model="widget.value" @change="setCheck(index)">{{widget.lable}}</el-checkbox>
                    </template>
                </div>
                <div class="extentSettings">
                    <span>输出范围：</span>
                    <el-radio-group v-model="selectExtentValue">
                        <template v-for="(item,index) in options">
                            <el-radio class="extentRadioSettings" :key="index" :label="item.value">{{item.label}}</el-radio>
                        </template>
                    </el-radio-group>
                    <el-button v-if='selectExtentValue == 2' type="primary" size="mini" style="margin-top:5px" @click="selectExtent">选择地图范围</el-button>
                </div>
                <div class="extentSettings">
                    <span>比例尺：</span>
                    <el-select v-model="scale" size="small" placeholder="请选择" @change='changeScale'>
                        <el-option
                        v-for="item in scaleOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        </el-option>
                    </el-select>
                </div>
            </el-card>
            <span >打印设置</span>
            <el-card class="settingsCard">
                <template v-for="(printSettingsItem,index) in printSettings">
                    <el-row :key="index" class="pringtSettintRows">
                        <template v-for="(item,itemIndex) in printSettingsItem.child">
                                <el-col v-if="item.type=='span'" :key="itemIndex" class="pringtSettintFont" :span="item.spanWidth">
                                    <span>{{item.label}}</span>
                                </el-col>
                                <el-col v-else-if="item.type=='input'" :key="itemIndex" class="pringtSettingInput" :span="item.spanWidth">
                                    <el-input v-model="item.value" placeholder="请输入内容"></el-input>
                                </el-col>
                                <el-col v-else-if="item.type=='datePicker'" :key="itemIndex" class="pringtSettingInput" :span="item.spanWidth">
                                    <el-date-picker  v-model="item.value" type="date" placeholder="选择日期"  format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd" style="width:100%">
                                    </el-date-picker>
                                </el-col>
                        </template>
                    </el-row>
                </template>

                <template v-for="(infoItem,index) in infoSize">
                    <el-row :key="index" class="pringtSettintRows">
                        <el-col  class="pringtSettintFont" :span="8">
                            <span>{{infoItem.text}}</span>
                        </el-col>
                        <el-col class="pringtSettintFont" :span="16">
                        <el-select v-model="infoItem.fontValue" placeholder="请选择">
                            <el-option v-for="item in infoItem.fontSize" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                    </el-row>
                </template>
                <el-row class="pringtSettintRows">
                    <el-col  class="pringtSettintFont" :span="8">
                        <span>图片格式：</span>
                    </el-col>
                    <el-col class="pringtSettintFont" :span="16">
                    <el-radio-group v-model="selectPictureValue">
                        <template v-for="(item,index) in pictureOptions">
                            <el-radio class="extentRadioSettings" :key="index" :label="item.value">{{item.label}}</el-radio>
                        </template>
                    </el-radio-group>
                    </el-col>
                </el-row>
            </el-card>
        </div>

        <div v-show="!initVisible" style="margin-right:10px">
            <div>
                <h3>页面大小</h3>
                <div class="pringtSettintRows">
                    <span>页面宽度：</span>
                    <el-input-number size="mini" v-model="moduleData.width" :disabled="true"></el-input-number>
                </div>
                <div>
                    <span>页面高度：</span>
                    <el-input-number size="mini" v-model="moduleData.height" :disabled="true"></el-input-number>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['map-2d'].items.length > 0">
                <h3>{{moduleConfig['map-2d'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['map-2d'].items">
                        <div :key="index" style="margin-bottom:10px">
                            <div style="display:flex">
                                <div class="title">{{item.name}}</div>
                                <el-radio-group v-model="item.options.focusMap" @change="handleMapExtend">
                                    <el-radio :label="1">当前地图</el-radio>
                                    <el-radio :label="2">自定义范围</el-radio>
                                    <el-radio :label="3">专题图</el-radio>
                                </el-radio-group>
                            </div>
                            <el-button v-if='item.options.focusMap == 2' type="primary" size="mini" style="margin-left:5px" @click="selectExtent">选择地图范围</el-button>
                            <el-button v-if='item.options.focusMap == 3' type="primary" size="mini" style="margin-left:5px">专题图</el-button>
                        </div>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['legend'].items.length > 0">
                <h3>{{moduleConfig['legend'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['legend'].items">
                        <el-button type="primary" disabled :key="index" size="mini" style="margin-left:5px;margin-top:5px">{{item.name}}</el-button>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['scale'].items.length > 0">
                <h3>{{moduleConfig['scale'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['scale'].items">
                        <!-- <el-button type="primary" disabled :key="index" size="mini" style="margin-left:5px;margin-top:5px">{{item.name}}</el-button> -->

                        <div :key="index" style="margin-bottom:10px;display:flex">
                            <div class="title">{{item.name}}</div>
                            <!-- <el-input v-model="item.options.content" placeholder="请输入内容" size="mini"></el-input> -->
                            <el-select v-model="item.options.scale" :key="index" size="small" placeholder="请选择" @change='changeScale'>
                                <el-option
                                v-for="item in scaleOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                                </el-option>
                            </el-select>
                        </div>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['compass'].items.length > 0">
                <h3>{{moduleConfig['compass'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['compass'].items">
                        <div :key="index" >
                            <el-button type="primary" disabled :key="index" size="mini" style="margin-left:5px;margin-top:5px">{{item.name}}</el-button>
                            <el-image :src="item.options.imageURL" :id='"exportMapcompass_" + index' fit="scale-down"
                                style="width: 30px;height: 30px;">
                            </el-image>
                        </div>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['text'].items.length > 0">
                <h3>{{moduleConfig['text'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['text'].items">
                        <div :key="index" style="margin-bottom:10px;display:flex">
                            <div class="title">{{item.name}}</div>
                            <el-input v-model="item.options.content" placeholder="请输入内容" size="mini"></el-input>
                        </div>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['rich-text'].items.length > 0">
                <h3>{{moduleConfig['rich-text'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['rich-text'].items">
                        <div :key="index" style="margin-bottom:10px;" v-html = "item.options.content">
                            <!-- <div class="title">{{item.name}}</div>
                            <el-input v-model="item.options.content" :disabled="true" placeholder="请输入内容" type="textarea" :rows="2" size="mini"></el-input> -->
                        </div>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['time-shower'].items.length > 0">
                <h3>{{moduleConfig['time-shower'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['time-shower'].items">
                        <div :key="index" style="margin-bottom:10px;display:flex">
                            <div class="title">{{item.name}}</div>
                            <el-date-picker
                                v-model="item.options.date.content"
                                size="mini"
                                type="date"
                                placeholder="请选择日期"
                                :format="item.options.date.format"
                                value-format="timestamp">
                            </el-date-picker>
                        </div>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['bg1'].items.length > 0">
                <h3>{{moduleConfig['bg1'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['bg1'].items">
                        <div :key="index" >
                            <el-button type="primary" disabled :key="index" size="mini" style="margin-left:5px;margin-top:5px">{{item.name}}</el-button>
                            <el-image :src="item.options.imageURL" :id='"exportMapbg1_" + index' fit="scale-down"
                                style="width: 96px;height: 54px;">
                            </el-image>
                        </div>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['background-gradient'].items.length > 0">
                <h3>{{moduleConfig['background-gradient'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['background-gradient'].items">
                        <el-button type="primary" disabled :key="index" size="mini" style="margin-left:5px;margin-top:5px">{{item.name}}</el-button>
                    </template>
                </div>
                <el-divider/>
            </div>
            <div v-if="moduleConfig['border-frame'].items.length > 0">
                <h3>{{moduleConfig['border-frame'].name}}</h3>
                <div>
                    <template v-for="(item,index) in moduleConfig['border-frame'].items">
                        <el-button type="primary" disabled :key="index" size="mini" style="margin-left:5px;margin-top:5px">{{item.name}}</el-button>
                    </template>
                </div>
                <el-divider/>
            </div>
            <el-row class="pringtSettintRows">
                <el-col  class="pringtSettintFont" :span="6">
                    <span>图片格式：</span>
                </el-col>
                <el-col class="pringtSettintFont" :span="18">
                <el-radio-group v-model="selectPictureValue">
                    <template v-for="(item,index) in pictureOptions">
                        <el-radio class="extentRadioSettings" :key="index" :label="item.value">{{item.label}}</el-radio>
                    </template>
                </el-radio-group>
                </el-col>
            </el-row>
        </div>

        <span class="outBtn">
            <el-button  size="small" type="primary" @click="exportMap"><i class="el-icon-download" ></i> 导出</el-button>
            <el-button  size="small" type="primary" @click="preViewMap"><i class="el-icon-printer" ></i> 预览</el-button>
        </span>
    </div>
    <div v-show="!visible" class="screenshotDiv" ref="screenshotDiv"><!--输出图片打印预览照片-->
        <img class="js-screenshot-image" ref="screenshotImage"/>
        <el-button id="closeBtn" class="action-button" title="Back to webscene" size="small" type="primary" @click="closePreview">返回地图</el-button>
     </div>
  
 </div>
 
</template>
<script>
import Legend from "esri/widgets/Legend";
import drawShape from "@/views/map/core/drawShape"
import axios from 'axios';
let initLoading;
const configType=['map-2d','legend','scale','compass','text','rich-text','time-shower','bg1','background-gradient','border-frame']
const scaleVal=[10000,20000,50000,100000,200000,500000,1000000]
let Base64 = require("js-base64").Base64;
let shape= new drawShape.ShapeFactory;
let canvasSize = 100;
let dragHandler
export default {
  props: {
    mapview:{
      type:Object,
    },
    showDialog:{
        type: Function
    },
    moduleId:{
        type: Number
    }
  },
  data () {
    return {
        compassCheck:false,//指北针
        options: [{//输出范围选择
            value: '1',
            label: '当前范围'
        }, {
            value: '2',
            label: '自定义范围'
        }],
        selectExtentValue: '1',//绑定的输出范围
        thematicMapSettings:[{id:0,lable:"图廓",value:true},{id:1,lable:"图例",value:false},{id:2,lable:"指北针",value:false},],//专题图设置
        printSettings:[//打印设置
                        {id:0,child:[{ type:"span",spanWidth:8,label:"地图标题："},{ type:"input",spanWidth:16,label:"请输入内容",value:"",},]},
                        {id:1,child:[{ type:"span",spanWidth:8,label:"制作单位："},{ type:"input",spanWidth:16,label:"请输入内容",value:"",},]},
                        {id:2,child:[{ type:"span",spanWidth:8,label:"制作时间："},{ type:"datePicker",spanWidth:16,label:"请输入内容",value:"",},]},],
        pictureOptions: [{//图片格式选择
            value: 'png',
            label: 'png'
        }, {
            value: 'jpg',
            label: 'jpg'
        }],
        selectPictureValue:"png",
        screenshot:{},
        visible:true,
        fullArea:{},
        legend:{},
        lengendLayer:{},
        infoSize:[{text:"标题大小：",fontSize:[{value: '16px',label: 16},{value: '20px',label: 20},{value: '24px',label: 24}, {value: '28px',label: 32}, {value: '36px',label: 36},],fontValue:'20px'},
                  {text:"制作信息大小：",fontSize:[{value: '16px',label: 16},{value: '20px',label: 20}, {value: '24px',label: 24},{value: '28px',label: 32}, {value: '36px',label: 36},],fontValue:'20px'},],
        scaleOptions:[{value: 10000,label: '1:10,000'},{value: 20000,label: '1:20,000'},{value: 50000,label: '1:50,000'},{value: 100000,label: '1:100,000'},{value: 200000,label: '1:200,000'},{value: 500000,label: '1:500,000'}, {value: 1000000,label: '1:1,000,000'}, {value: this.mapview.scale ,label: '当前比例尺'},],
        scale:this.mapview.scale,
        initScale:this.mapview.scale,
        initVisible: true,
        moduleData:{},
        moduleConfig:{
            'map-2d': {type:'map-2d', name:'地图',drawMethod:'drawMap', items:[]},
            legend: {type:'legend', name:'图例',drawMethod:null, items:[]},
            scale: {type:'scale', name:'比例尺',drawMethod:'drawText2', items:[]},
            compass: {type:'compass',name:'指北针',drawMethod:'', items:[]},
            text: {type:'text', name:'文本',drawMethod:'drawText2', items:[]},
            'rich-text': {type:'rich-text', drawMethod:null, name:'富文本',items:[]},
            'time-shower': {type:'time-shower', name:'日期',drawMethod:'drawText2', items:[]},
            bg1: {type:'bg1', name:'背景图',drawMethod:'', items:[]},
            'background-gradient': {type:'background-gradient', name:'背景色块',drawMethod:'drawGradient', items:[]},
            'border-frame': {type:'border-frame', name:'边框',drawMethod:'drawFrame2', items:[]},
        },
        area: null,
    }

  },
  methods: {
    openFullscreenLoading(){//Loading加载
      initLoading = this.$loading({
        lock: true,
        text: '请等待',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
    exportMap(){//导出地图
        if(this.initVisible){
            this.exportMapDefault()
        }else{
            this.exportMapFromModule()
        }
    },
    exportMapDefault(){
        let parameters={format:this.selectPictureValue};
        if(this.selectExtentValue == 2 && this.area !=null){
            parameters.area = this.area
        }
        this.openFullscreenLoading();
        this.mapview.takeScreenshot(parameters).then((screenshot)=> {
            this.screenshot=screenshot;
            let mapTitle= this.printSettings[0].child[1].value==""?"xxx图":this.printSettings[0].child[1].value;
            let dataUrl =this.getImageWithText(screenshot,mapTitle);
            this.downloadImage(`${mapTitle}.${this.selectPictureValue}`,dataUrl);
            this.removeLegend();
            this.thematicMapSettings[1].value=false;
            this.thematicMapSettings[2].value=false;
            this.setMaskPosition(null,document.getElementById("gtkjghExportMapByExtent"),document.getElementById("gtkjghMyMap"))
            initLoading.close();
        }).catch(error => {
            initLoading.close();
            this.$message({showClose: true,message: `导出失败 ${error}`,type: 'error'});
        });
    },
    async exportMapFromModule(){
        let parameters={format:this.selectPictureValue};
        if(this.moduleConfig['map-2d'].items.length > 0 && this.moduleConfig['map-2d'].items[0].options.focusMap == 2 && this.area !=null){
            parameters.area = this.area
        }
        this.openFullscreenLoading();
        let dataUrl
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        await this.mapview.takeScreenshot(parameters).then((screenshot)=> {
            this.screenshot=screenshot;
            this.getModuleImage(screenshot,canvas);
        }).catch(error => {
            this.$message({showClose: true,message: `导出失败 ${error}`,type: 'error'});
        });

        let legendItems
        if( this.moduleConfig['legend'].items.length > 0){//绘制legend
            let layer = this.getLegendLayer()
            if(layer){
                if(layer.type =='feature'){
                    legendItems = this.getFeatureLegend(layer)
                }else{
                    legendItems = await axios({method:"get",url: `${layer.url}/legend?f=pjson`}).then((response)=> {
                        let childrenArr=[];
                        if(response.status==200){
                            response.data.layers.map(layer=>{
                                layer.legend.map(item=>{
                                    let src= `data:image/png;base64,${item.imageData} `;
                                    let newChild = {label: item.label||layer.layerName, imageData: src };
                                    childrenArr.push(newChild)
                                })
                            })
                        }
                        return childrenArr
                    })
                }
                let arr=legendItems.map(item => this.getLegendImg(item.imageData))
                if(this.moduleConfig['legend'].items.length > 0){
                    let item = this.moduleConfig['legend'].items[0]
                    let i = 0
                    let j = 0
                    let range = item.options.column ? Math.ceil(arr.length / item.options.column) : arr.length
                    for await(let img of arr) {
                        let legendImgSize = item.options.legendImgSize ? item.options.legendImgSize : 15
                        let gap = legendImgSize + 5
                        if(i >= 0 && i < range){
                            if(img){
                                context.drawImage(img, item.x, item.y + i * 15,legendImgSize,legendImgSize)
                            }
                            this.drawText(context,item.x + gap, item.y + (i + 1) * 15, legendItems[i].label,item.options.color,`${item.options.fontWeight} ${item.options.fontSize}px ${item.options.fontFamily}`)
                        }else if(i >= range && i < 2 * range ){
                            if(img){
                                context.drawImage(img, item.x + item.options.space, item.y + j * 15,legendImgSize,legendImgSize)
                            }
                            this.drawText(context,item.x + gap + item.options.space, item.y + (j + 1) * 15, legendItems[i].label,item.options.color,`${item.options.fontWeight} ${item.options.fontSize}px ${item.options.fontFamily}`)
                            j++
                        }else{
                            if(i == 2 * range){
                                j = 0
                            }
                            if(img){
                                context.drawImage(img, item.x + item.options.space * 2, item.y + j * 15,legendImgSize,legendImgSize)
                            }
                            this.drawText(context,item.x + gap + item.options.space * 2, item.y + (j + 1) * 15, legendItems[i].label,item.options.color,`${item.options.fontWeight} ${item.options.fontSize}px ${item.options.fontFamily}`)
                            j++
                        }
                        i++
                    }
                }
            }
        }

        dataUrl = canvas.toDataURL()
        let mapTitle= "成果图"
        this.downloadImage(`${mapTitle}.${this.selectPictureValue}`,dataUrl);
        this.setMaskPosition(null,document.getElementById("gtkjghExportMapByExtent"),document.getElementById("gtkjghMyMap"))
        initLoading.close();
    },
    getLegendImg(src) {
        return new Promise(function (resolve, reject) {
            let img = new Image();
            img.src = src
            img.onload = function () {
                resolve(img);
            };
            img.onerror = function () {
                resolve(null);
            };
        });
    },
    drawLengendItem(context,item,img,i){
        let legendImgSize = item.options.legendImgSize ? item.options.legendImgSize : 15
        let gap = legendImgSize + 5
        context.drawImage(img, item.x, item.y + i*15,legendImgSize,legendImgSize)
        this.drawText(context,item.x + gap, item.y + (i + 1) * 15, legendItems[i].label,item.options.color,`${item.options.fontWeight} ${item.options.fontSize}px ${item.options.fontFamily}`)
    },
    getFeatureLegend(layer){
      if(layer.renderer){
        let childrenArr=[];
        let type=layer.renderer.type;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if(type=="unique-value"){
          childrenArr= this.initUniquevalueSymbol(layer,canvas,context);
        }else if(type=="class-breaks"){
          childrenArr= this.initClassbreaksSymbol(layer,canvas,context);
        }else{
          childrenArr= this.initSimpleSymbol(layer,canvas,context);
        }
        return childrenArr
      }
    },
    initUniquevalueSymbol(layer,canvas,ctx){//唯一值符号
      let childrenArr=layer.renderer.uniqueValueInfos.map((item,index)=>{
        if(item.symbol.type== "picture-marker"){
          return  {label: item.label, imageData:item.symbol.url };
        }else{
          ctx.save();
          ctx.clearRect(0,0,canvasSize,canvasSize)//清空画布，重新绘制
          let obj={symbolColor:item.symbol.color,outlineColor:item.symbol.outline.color,size:canvasSize,dash:3}
          shape.Product(layer.geometryType).Product(item.symbol.style,item.symbol.outline.style).draw(obj,ctx);
          let src=canvas.toDataURL();
          ctx.restore();
          let newChild = {label: item.label, imageData:src };
          return  newChild
        }
      });
      return childrenArr
    },
    initClassbreaksSymbol(layer,canvas,ctx){//分级符号
      let childrenArr=layer.renderer.classBreakInfos.map((item,index)=>{
        if(item.symbol.type== "picture-marker"){
          return  { label: item.label,imageData:item.symbol.url };
        }else{
          ctx.save();
          ctx.clearRect(0,0,canvasSize,canvasSize)//清空画布，重新绘制
          let obj={symbolColor:item.symbol.color,outlineColor:item.symbol.outline.color,size:canvasSize,dash:3}
          shape.Product(layer.geometryType).Product(item.symbol.style,item.symbol.outline.style).draw(obj,ctx);
          let src=canvas.toDataURL();
          ctx.restore();
          let newChild = {label: item.label, imageData:src };
          return  newChild
        }
      });
      return childrenArr
    },
    initSimpleSymbol(layer,canvas,ctx){//简单类型符号
      let childrenArr=[]
      if(layer.geometryType!= 'text'){
        ctx.save();
        let obj={symbolColor:layer.renderer.symbol.color,outlineColor:layer.renderer.symbol.outline.color,size:canvasSize,dash:2}
        shape.Product(layer.geometryType).Product(layer.renderer.symbol.style,layer.renderer.symbol.outline.style).draw(obj,ctx);
        let src=canvas.toDataURL();
        ctx.restore();
        let newChild = { label: layer.renderer.label||layer.title,imageData:src };
        childrenArr.push(newChild)
      }
      return childrenArr
    },
    preViewMap(){//打印预览
        this.openFullscreenLoading();
        this.mapview.takeScreenshot().then((screenshot) => {
            this.screenshot=screenshot;
            this.showPreview();
            initLoading.close();
        });
    },
    showPreview() {//打印预览
        this.visible=false;
        const canvas = document.createElement("canvas");
        const cxt = canvas.getContext("2d");
        canvas.width = this.screenshot.data.width;
        canvas.height = this.screenshot.data.height;
        this.drawFillFrame(cxt,0,0,canvas.width,canvas.height,"#fff");//绘制背景色
        cxt.putImageData(this.screenshot.data, 0, 0);//绘制地图 
        this.$refs["screenshotImage"].src = canvas.toDataURL();//this.screenshot.dataUrl;
    },
    closePreview(){//关闭打印预览
        this.visible=true;
    },
    getImageWithText(screenshot, text) {//绘制带标题，图阔等的图片，
        const imageData = screenshot.data;
        // to add the text to the screenshot we create a new canvas element
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = imageData.width+100;
        canvas.height = imageData.height+100;
        if(this.thematicMapSettings[1].value){//勾选图例，重新计算打印宽度高度 
            if(this.legend.activeLayerInfos.items[0]){
                let size=this.caculateCanvasSize(canvas);
                canvas.width=size.width;
                canvas.height=size.height; 
            }
        }
        this.drawFillFrame(context,0,0,canvas.width,canvas.height,"#fff");//绘制背景色
        context.putImageData(imageData, 40, 40);//绘制地图
        if(this.thematicMapSettings[1].value){//绘制图例
            this.drawLegend(context,canvas.width-220,canvas.height-80,canvas); 
        }
        if(this.thematicMapSettings[0].value){//绘制图框
            this.drawFrame(context,5,35,canvas.width-5-30,canvas.height-35-60,"#000");//外图框
            this.drawFrame(context,15,45,canvas.width-25-30,canvas.height-55-60,"#000");//内图框
        }
        if(this.thematicMapSettings[2].value){//绘制指北针
            this.drawArrow(context,canvas.width-65,120,"#000");
        }
        this.drawText(context,canvas.width/2 - Math.floor(text.length / 2 - 2) * this.infoSize[0].fontValue.replace('px',''),30,text,"#000",`${this.infoSize[0].fontValue} 宋体 bolder`);//绘制标题
        let date=this.printSettings[2].child[1].value==""?"":this.formatDate(this.printSettings[2].child[1].value,'yyyy-MM-dd');
        this.drawText(context,10,canvas.height-40,`制作单位:${this.printSettings[1].child[1].value}`,"#000",`${this.infoSize[1].fontValue} 宋体`);//制作单位
        this.drawText(context,10,canvas.height-10,`制作时间:${date}`,"#000",`${this.infoSize[1].fontValue} 宋体`);//制作时间
        let outputScale=this.scale!=500000 && this.scale!=1000000?this.mapview.scale:this.scale
        this.drawText(context,canvas.width/2,canvas.height-30,`1:${outputScale}`,"#000",`20px 宋体`);//比例尺
        return canvas.toDataURL();
    },
    drawFillFrame(context,x,y,width,height,color){//绘制背景色
        context.fillStyle = color;
        context.fillRect(x,y,width,height);
    },
    drawText(context,x,y,title,color,font){//绘制标题
        context.font = font;
        context.fillStyle = color;
        context.fillText(title, x, y);
    },
    drawText2(context,item){//绘制标题
        context.font = `${item.options.fontStyle} ${item.options.fontWeight} ${item.options.fontSize}px ${item.options.fontFamily}`;
        context.fillStyle = item.options.color;
        context.fillText(item.options.content, item.x, item.y);
    },
    drawFrame(context,x,y,width,height,color){//绘制图框
        context.strokeStyle=color;
        context.save();
        context.strokeRect(x,y,width,height);
        context.restore();
    },
    drawFrame2(context, item){//绘制图框
        context.save();
        context.lineWidth = item.options.thickness;
        context.strokeStyle=item.options.color;
        context.strokeRect(item.x,item.y,item.width,item.height);
        context.restore();
    },
    drawGradient(context,item){//绘制渐变色
        let my_gradient;
        if(item.options.direction ==='horizontal'){//水平
            my_gradient = context.createLinearGradient(item.x,item.y,item.x + item.width,item.y);
        }else{//direction=='vertical'垂直
            my_gradient = context.createLinearGradient(item.x,item.y,item.x,item.y + item.height);
        }
        my_gradient.addColorStop(0,item.options.colors[0]);
        my_gradient.addColorStop(1,item.options.colors[1]);
        context.fillStyle=my_gradient;
        context.fillRect(item.x,item.y,item.width,item.height);
    },
    drawArrow(context,arrowCenterPointX,arrowCenterPointY,color) {//画箭头指北针
        this.drawText(context,arrowCenterPointX-6,arrowCenterPointY-50,"N","#000","24px 宋体 bolder");//制作时间
        context.beginPath();
        context.moveTo(arrowCenterPointX+3, arrowCenterPointY-16);
        context.lineTo(arrowCenterPointX+3, arrowCenterPointY-24-24);
        context.lineTo(arrowCenterPointX-9, arrowCenterPointY);
        context.moveTo(arrowCenterPointX-9, arrowCenterPointY);
        context.closePath();
        context.fillStyle = color;
        context.strokeStyle = color;
        context.fill();
        context.beginPath();
        context.moveTo(arrowCenterPointX+3, arrowCenterPointY-16);
        context.lineTo(arrowCenterPointX+6+9, arrowCenterPointY);
        context.lineTo(arrowCenterPointX+3, arrowCenterPointY-24-24);
        context.lineTo(arrowCenterPointX+3, arrowCenterPointY-24-24);
        context.closePath();
        context.stroke();
    },
    setCheck(index){
      if(index==1)
      {
        if(this.thematicMapSettings[1].value){
            this.removeLegend();
            this.addLegend();
            this.mapview.ui.add(this.legend,"bottom-left");
        }else{
            this.removeLegend();
        }
      }
    },
    addLegend(){//添加图例
        let layerGroup=this.mapview.map.layers.items.find((layerGroup)=>layerGroup.id=="zymlGroupLayer"||layerGroup.title=='资源目录图层组');
        if(layerGroup){
            this.lengendLayer=layerGroup.layers.items[layerGroup.layers.items.length-1];
        }
        this.legend = new Legend({
            view: this.mapview,
            layerInfos: [{
                layer: this.lengendLayer,
                title: "图例"
            }]
        });
    },
    removeLegend(){//移除图例
        if(this.mapview.ui.find(this.legend)){
            this.mapview.ui.remove(this.legend);
        }
    },
    drawLegend(context,width,height,canvas){//绘制图例 
        let legendSymType=this.lengendLayer?this.lengendLayer.type:"";
        let infoCount=0;//服务所有图层所有legend项和
        let lastCount=0;//服务中当前图层之前的legend项和
        if(this.legend.activeLayerInfos.items[0]){
            this.legend.activeLayerInfos.items[0].legendElements.map((item,index)=>{
                infoCount+=item.infos.length;
            })
        }
        this.drawFrame(context,width-25,height-(infoCount*15+20+20+5),190,infoCount*15+20+20+5,"#000");//绘制图例框
        this.drawText(context,width-20,height-infoCount*15-20,"图例","#000","20px 宋体");//绘制图例文字
        if(this.legend.activeLayerInfos.items[0]){
            for (let j = 0; j<this.legend.activeLayerInfos.items[0].legendElements.length;j++) {
                let legendInfo=  this.legend.activeLayerInfos.items[0].legendElements[j].infos;
                for (let i = 0; i<legendInfo.length; i++) {
                    if(legendSymType=="tile"||legendSymType=="map-image"){
                    context.drawImage(this.basetoCanvas(legendInfo[i].src), width-20, height-(infoCount-i+1-lastCount)*15,15,15);//绘制图例中符号 
                    }else if(legendSymType=="feature"){
                        this.drawFillFrame(context,width-20,height-(infoCount-i+1-lastCount)*15,14,14,legendInfo[i].symbol.color);//绘制背景色
                    }
                    this.drawText(context,width,height-(infoCount-i-lastCount)*15,legendInfo[i].label,"#000","15px 宋体");
                }
                lastCount+=legendInfo.length;
            }
        }
    },
    getLegendLayer(){
        let layer
        let layerGroup=this.mapview.map.layers.items.find((layerGroup)=>layerGroup.id=="zymlGroupLayer"||layerGroup.title=='资源目录图层组');
        if(layerGroup){
            layer = layerGroup.layers.items[layerGroup.layers.items.length-1];
        }
        return layer
    },
    basetoCanvas(imgbase64){//base64位图片转到img中
      let img=new Image();
      img.src=imgbase64;
      return img
    },
    caculateCanvasSize(canvas){//计算canvas大小
        let count=0
        this.legend.activeLayerInfos.items[0].legendElements.map((item,index)=>{
            count+=item.infos.length;
        })
        let height=count*20>canvas.height?count*20:canvas.height
        return {
            width:canvas.width+150,
            height:height,
        }
    },  
    downloadImage(filename, dataUrl) {//下载图片
          // the download is handled differently in Microsoft browsers
          // because the download attribute for <a> elements is not supported
          if (!window.navigator.msSaveOrOpenBlob) {
            // in browsers that support the download attribute
            // a link is created and a programmatic click will trigger the download
            const element = document.createElement("a");
            element.setAttribute("href", dataUrl);
            element.setAttribute("download", filename);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          } else {
            // for MS browsers convert dataUrl to Blob
            const byteString = atob(dataUrl.split(",")[1]);
            const mimeString = dataUrl
              .split(",")[0]
              .split(":")[1]
              .split(";")[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            // download file
            window.navigator.msSaveOrOpenBlob(blob, filename);
          }
    },
    formatDate(date, fmt) {//格式化日期
        date = new Date(date);
        if (typeof(fmt) === "undefined") {
            fmt = "yyyy-MM-dd HH:mm:ss";
        }
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + ''
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : ('00' + str).substr(str.length));
            }
        }
        return fmt
    },
    getFullArea(){
        let extent=this.mapview.extent;
        let leftBottomPoint =this.getMapPoint(extent.xmin,extent.ymin,this.mapview.spatialReference);
        let leftTopPoint =this.getMapPoint(extent.xmin,extent.ymax,this.mapview.spatialReference);
        let rightBottomPoint =this.getMapPoint(extent.xmax,extent.ymin,this.mapview.spatialReference);
        let rightTopPoint =this.getMapPoint(extent.xmax,extent.ymax,this.mapview.spatialReference);
        let screenleftBottomPoint = this.mapview.toScreen(leftBottomPoint);
        let screenleftTopPoint = this.mapview.toScreen(leftTopPoint);
        let screenrightBottomPoint = this.mapview.toScreen(rightBottomPoint);
        let screenrightTopPoint = this.mapview.toScreen(rightTopPoint);
        this.fullArea={
            x: 0,
            y: 0,
            width: this.mapview.width,
            height: this.mapview.height,
        }
    },
    getMapPoint(xx,yy,spr){
        return  {
            x: xx,
            y: yy,
            spatialReference:spr,
        };
    },
    changeScale(val){//修改比例尺
        if(val!=this.initScale){
            this.mapview.scale = val
        }
    },
    setMoudle(id){
        this.$axios.get("/thematicMapInfomation/getThematicMapInfomationById/?id=" + id).then(response => {
            if(response.code == 200){
                this.initVisible=false
                this.moduleData = JSON.parse(response.data.mapDescriptionInformation)
                configType.forEach(item=>{
                    this.moduleConfig[item].items = this.moduleData.items.filter(i => i.type === item)
                })
                this.moduleConfig['scale'].items.forEach(item=>{
                    if(!item.options.scale || item.options.scale === -1 ){
                        item.options.scale = this.mapview.scale
                    }
                })
            }
        })
    },
    getModuleImage(screenshot,canvas) {//绘制带标题，图阔等的图片，
        const imageData = screenshot.data;
        const context = canvas.getContext("2d");
        canvas.width = this.moduleData.width;
        canvas.height = this.moduleData.height;
        this.drawFillFrame(context,0,0,canvas.width,canvas.height,this.moduleData.backgroundColor);//绘制背景色
        for (let index = this.moduleData.items.length -1 ; index >= 0; index--) {
            let item = this.moduleData.items[index];
            if(item.type === 'map-2d'){
                context.putImageData(imageData, item.x, item.y, 0, 0, item.width, item.height);
            }else if(item.type === 'scale'){
                let outputScale= scaleVal.includes(item.options.scale) ? item.options.scale : this.mapview.scale
                this.drawText(context, item.x, item.y, `1:${outputScale}`, item.options.color,`${item.options.fontWeight} ${item.options.fontSize}px ${item.options.fontFamily}`);
            }else if(item.type === 'compass' || item.type === 'bg1' ){
                let idName = `exportMap${item.type}_`
                let i= this.moduleConfig[item.type].items.findIndex(i=>i.idx===item.idx)
                if(i!= -1){
                    let img =document.getElementById(idName + i);
                    context.drawImage(img, item.x, item.y, item.width, item.height)
                }
            }else if(item.type === 'legend' ){
            }else if(configType.includes(item.type)){
                if(this.moduleConfig[item.type].drawMethod){
                    this[this.moduleConfig[item.type].drawMethod](context,item)
                }
            }
        }
        return canvas.toDataURL();
    },
    selectExtent(){
        this.area = null
        let parentDiv = document.getElementById("gtkjghMyMap");
        let childDiv = document.getElementById("gtkjghExportMapByExtent");
        if(childDiv){
            parentDiv.removeChild(childDiv)
        }else{
            childDiv = document.createElement("div");
        }
        childDiv.id = "gtkjghExportMapByExtent"
        childDiv.style.position = "absolute"
        childDiv.style.backgroundColor = "rgba(255, 51, 0, 0.1)"
        childDiv.style.border = "2px dashed rgb(255, 51, 0)"
        childDiv.style.display="none";
        parentDiv.appendChild(childDiv);
        document.documentElement.style.cursor = 'crosshair';
        dragHandler=this.mapview.on("drag", (event) => {
            event.stopPropagation();
            if (event.action !== "end") {
                const xmin = this.clamp(Math.min(event.origin.x, event.x), 0, this.mapview.width);
                const xmax = this.clamp(Math.max(event.origin.x, event.x), 0, this.mapview.width);
                const ymin = this.clamp(Math.min(event.origin.y, event.y), 0, this.mapview.height);
                const ymax = this.clamp(Math.max(event.origin.y, event.y), 0, this.mapview.height);
                this.area = {
                    x: xmin,
                    y: ymin,
                    width: xmax - xmin,
                    height: ymax - ymin
                };
                this.setMaskPosition(this.area, childDiv, parentDiv)
            }else {
                dragHandler.remove();
                document.documentElement.style.cursor = '';
            }
        });
    },
    setMaskPosition(area,childDiv,parentDiv) {
        if (area) {
            childDiv.style.left = area.x + "px";
            childDiv.style.top = area.y + "px";
            childDiv.style.width = area.width + "px";
            childDiv.style.height = area.height + "px";
            childDiv.style.display = "";
        } else {
            document.documentElement.style.cursor = '';
            this.area = null
            if(childDiv){
                parentDiv.removeChild(childDiv)
            }
        }
    },
    clamp(value, from, to) {
        return value < from ? from : value > to ? to : value;
    },
    restore(){
        this.initVisible = true
        this.setMaskPosition(null,document.getElementById("gtkjghExportMapByExtent"),document.getElementById("gtkjghMyMap"))
    },
    handleMapExtend(val){
        if(val!=2){
            this.setMaskPosition(null,document.getElementById("gtkjghExportMapByExtent"),document.getElementById("gtkjghMyMap"))
        }
    }

  },
    destroyed () {
        if(dragHandler){
            dragHandler.remove();
            dragHandler = null
        }
        this.setMaskPosition(null,document.getElementById("gtkjghExportMapByExtent"),document.getElementById("gtkjghMyMap"))
    },
    watch:{
        moduleId :function (val) {
            if(val){
                this.setMoudle(val);
            }
        },
    },
}
</script>
<style scoped>
.settingsCard{
    margin-bottom:10px
}
.extentSettings{
    margin-top:20px
}
.pringtSettintFont{
    margin-top:8px
}
.pringtSettintRows{
    margin-bottom:10px
}
.outBtn{
    margin-right:10px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.js-screenshot-image {
    border: 10px solid white;
    box-shadow: 2px 2px 5px 0 rgba(0, 0, 0, 0.5);
    width:100%;
    background-color: #FFF;
}
.screenshotDiv > * {
    margin-top : 0.75em;
}
.title {
    width:100px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
</style>
