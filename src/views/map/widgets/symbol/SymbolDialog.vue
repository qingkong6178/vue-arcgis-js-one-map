<!--featurelayer符号渲染样式-->
<template>
  <el-dialog
    title="设置符号"
    :visible.sync="symbolDialogVisible"
    width="30%"
    append-to-body
    @close="handleClose"
    @open="getLayerProperty">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="单一符号" name="simple">
        <div>
          <div class="spaceBetween">
            <span class="text" >填充颜色，透明度</span>
            <el-color-picker v-model="symbolColor" show-alpha size="medium"></el-color-picker>
          </div>
          <template v-if='layer.geometryType=="polygon"||layer.geometryType=="point"'>
            <div class="spaceBetween">
              <span class="text">填充样式</span>
              <el-select v-model="symbolStyle" placeholder="请选择" @focus="getSymbolStyle">
                <el-option
                  v-for="item in symbolStyleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
          <div class="spaceBetween">
            <span class="text">轮廓线颜色，透明度</span>
            <el-color-picker v-model="outlineColor" show-alpha size="medium"></el-color-picker>
          </div>
          <template v-if='layer.geometryType=="polygon"||layer.geometryType=="polyline"'>
            <div class="spaceBetween">
              <span class="text">轮廓线样式</span>
              <el-select v-model="lineStyle" placeholder="请选择">
                <el-option
                  v-for="item in lineStyleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
          <div class="spaceBetween">
            <span class="text">轮廓线大小</span>
            <div style="width:70%"> 
              <el-slider v-model="outlineWidth" :max="20"  show-input></el-slider>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="文本符号" name="text">
          <div class="spaceBetween">
            <span class="text" >填充颜色，透明度</span>
            <el-color-picker v-model="symbolColor" show-alpha size="medium"></el-color-picker>
          </div>
          <div class="spaceBetween">
            <span class="text" >填充文本</span>
            <el-input type="text" placeholder="请输入内容" v-model="symbolText" show-word-limit style="width:260px"></el-input>
          </div>
          <div class="spaceBetween">
            <span class="text" >角度</span>
            <el-input-number v-model="angle" controls-position="right" :precision="2" :min="-360" :max="360" ></el-input-number>
          </div>
          <div class="spaceBetween">
            <span class="text" >X偏移量</span>
            <el-input-number v-model="xOffset" controls-position="right" :precision="2" :min="-32767" :max="32767" ></el-input-number>
          </div>
          <div class="spaceBetween">
            <span class="text" >Y偏移量</span>
            <el-input-number v-model="yOffset" controls-position="right" :precision="2" :min="-32767" :max="32767" ></el-input-number>
          </div>
          <div class="spaceBetween">
            <span class="text">样式</span>
            <el-radio-group v-model="isHalo">
              <el-radio :label="false">无</el-radio>
              <el-radio :label="true">光晕</el-radio>
            </el-radio-group>
          </div>
          <div v-if='isHalo' class="spaceBetween">
            <span class="text">光晕颜色</span>
            <el-color-picker v-model="haloColor" show-alpha size="medium"></el-color-picker>
          </div>
          <div v-if='isHalo' class="spaceBetween">
            <span class="text">光晕大小</span>
            <el-input-number v-model="haloSize" controls-position="right" :precision="2" :min="0" :max="32767" ></el-input-number>
          </div>
      </el-tab-pane>
      <el-tab-pane label="唯一值符号" name="unique-value">
        <div class="spaceBetween">
          <span class="text">轮廓线颜色，透明度</span>
          <el-color-picker v-model="outlineColor" show-alpha size="medium"></el-color-picker>
        </div>
        <div class="spaceBetween">
          <span class="text">轮廓线大小</span>
          <div style="width:70%"> 
            <el-slider v-model="outlineWidth" :max="20"  show-input></el-slider>
          </div>
        </div>
        <div class="spaceBetween">
          <span class="text">字段</span>
          <el-select v-model="field" placeholder="请选择">
            <el-option
              v-for="item in fieldOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <span style="margin-left: 20px;">色带</span>
        <div style="margin-top: 5px;margin-bottom: 10px;">
          <div class="selectRamp"  @click="selectColorRamp">
            <div class="selectRampContainter">
              <ColorRamp :styleObject="colorRamps[selectColorId].styleObject" :borderClassVisible="colorRamps[selectColorId].borderClassVisible" :colorRampClassVisible="false" :percentClassVisible="true" :id="colorRamps[selectColorId].id"></ColorRamp>
            </div>
            <el-button type="text" icon="el-icon-arrow-down"  size="small" style="margin-right:10px"></el-button>
          </div>
          <div class="ramp" v-show="colorRampsVisible">
            <template  v-for="item in colorRamps">
                <ColorRamp :styleObject="item.styleObject" :borderClassVisible="item.borderClassVisible" :colorRampClassVisible="true" :percentClassVisible="false" :id="item.id" :key="item.id" @check="checkRamp"></ColorRamp>
            </template>
          </div>
        </div>
        <el-table
          v-if="tableData && tableData.length>0"
          :data="tableData"
          height="250"
          style="width: 100%;">
            <template  v-for="(item,index) in symbolTableColoums">
              <el-table-column v-if="item.type=='el-color-picker'" :label="item.label" :key="index" :width="item.width">
                <template slot-scope="scope">
                  <el-color-picker v-model="scope.row[item.value]" size="small" show-alpha></el-color-picker>
                </template>
              </el-table-column>
              <el-table-column v-else :label="item.label" :key="index" :width="item.width">
                <template slot-scope="scope">
                  <span >{{ scope.row[item.value] }}</span>
                </template>
              </el-table-column>
            </template>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="分级符号" name="class-breaks">
        <div class="spaceBetween">
          <span class="text">轮廓线颜色，透明度</span>
          <el-color-picker v-model="outlineColor" show-alpha size="medium"></el-color-picker>
        </div>
        <div class="spaceBetween">
          <span class="text">轮廓线大小</span>
          <div style="width:70%"> 
            <el-slider v-model="outlineWidth" :max="20"  show-input></el-slider>
          </div>
        </div>
        <div class="spaceBetween">
          <span class="text">字段</span>
          <el-select v-model="field" placeholder="请选择">
            <el-option
              v-for="item in classfieldOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="spaceBetween">
          <span class="text">分段方法</span>
          <el-select v-model="classesFuncValue" placeholder="请选择">
            <el-option
              v-for="item in classesFuncOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div  class="spaceBetween">
          <span class="text">分段</span>
          <div style="width:50%"> 
            <el-slider v-model="classesValue" :min="1" :max="10"></el-slider>
          </div>
        </div>
        <span style="margin-left: 20px;;margin-bottom: 10px;">色带</span>
        <div style="margin-top: 5px;">
          <div class="selectRamp" @click="selectColorRamp">
            <div class="selectRampContainter">
              <ColorRamp :styleObject="colorRamps[selectColorId].styleObject" :borderClassVisible="colorRamps[selectColorId].borderClassVisible" :colorRampClassVisible="false" :percentClassVisible="true" :id="colorRamps[selectColorId].id"></ColorRamp>
            </div>
            <el-button type="text" icon="el-icon-arrow-down" size="small" style="margin-right:10px"></el-button>
          </div>
          <div class="ramp" v-show="colorRampsVisible">
            <template  v-for="item in colorRamps">
                <ColorRamp :styleObject="item.styleObject" :borderClassVisible="item.borderClassVisible" :colorRampClassVisible="true" :percentClassVisible="false" :id="item.id" :key="item.id" @check="checkRamp"></ColorRamp>
            </template>
          </div>
        </div>
        <el-table
          v-if="classTableData && classTableData.length>0"
          :data="classTableData"
          height="250"
          style="width: 100%;">
            <template  v-for="(item,index) in classTableColoums">
              <el-table-column v-if="item.type=='el-color-picker'" :label="item.label" :key="index" :width="item.width">
                <template slot-scope="scope">
                  <el-color-picker v-model="scope.row[item.value]" size="small" show-alpha></el-color-picker>
                </template>
              </el-table-column>
              <el-table-column v-else :label="item.label" :key="index" :width="item.width">
                <template slot-scope="scope">
                  <span >{{ scope.row[item.value] }}</span>
                </template>
              </el-table-column>
            </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <div v-if="pointVisible||activeName=='text'" class="spaceBetween">
        <span class="text">符号大小</span>
        <div style="width:70%"> 
          <el-slider v-model="pointSize" :min="1" :max="120" show-input></el-slider>
        </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button v-if='activeName=="unique-value"||activeName=="class-breaks"' size="small" type="primary" plain @click="setSymbol(0)">显示符号样式</el-button>
      <el-button size="small" type="primary" plain @click="setSymbol(1)">确 定</el-button>
      <el-button size="small" @click="symbolDialogVisible=false">取 消</el-button>
    </span>
    <slot name="layerContent"></slot>
  </el-dialog>
</template>
<script>
import RendererCreator from "../../core/RendererCreator";
import ColorRamp from "./ColorRamp";
import gradientColor from "./gradientColor";
import myconfig from "../../mapconfig/myconfig";
var loading;
export default {
  components: {ColorRamp},
  props: {
    mapview:{
      type:Object,
    },
    layer:{
      type:Object,
    },
    sublayer:{
      type:Object,
    },
    visible: {
      type: Boolean,
    },
    layerType: {
      type: String,
    },
  },
  data () {
    return {
      symbolDialogVisible:false,
      symbolColor: null,//符号填充颜色
      outlineColor: 'rgba(0,0,0,1)', //轮廓线颜色
      outlineWidth: 0.5,//轮廓线大小
      activeName:"simple",//tab页
      fieldOptions: [],//字段选择
      classfieldOptions:[],//分段字段选择字段类型需在（integer,small-integer,single,double）中
      field:"",//符号字段
      classesFuncOptions: [{value:"equal-interval",label:"相等法"},{value:"natural-breaks",label:"自然间断点分级法"},{value:"quantile",label:"分位数法"},{value:"standard-deviation",label:"标准差法"},],//分级方法选择
      classesFuncValue:"equal-interval",//分级方法
      classesValue:5,//级别个数
      activeVisible:[
        {name:"simple",item:{simpleVisible:true,fieldVisible:false,classesVisible:false},symbolTypeVisible:[{name:"point",type:"simple-marker",visible:true},{name:"multipoint",type:"simple-marker",visible:true},{name:"polyline",type:"simple-line",visible:false},{name:"polygon",type:"simple-fill",visible:false}]},
        {name:"unique-value",item:{simpleVisible:false,fieldVisible:true,classesVisible:false},symbolTypeVisible:[{name:"point",type:"simple-marker",visible:true},{name:"multipoint",type:"simple-marker",visible:false},{name:"polyline",type:"simple-line",visible:false},{name:"polygon",type:"simple-fill",visible:false}]},
        {name:"class-breaks",item:{simpleVisible:false,fieldVisible:true,classesVisible:true},symbolTypeVisible:[{name:"point",type:"simple-marker",visible:true},{name:"multipoint",type:"simple-marker",visible:false},{name:"polyline",type:"simple-line",visible:false},{name:"polygon",type:"simple-fill",visible:false}]},
        {name:"text",item:{simpleVisible:false,fieldVisible:false,classesVisible:false},symbolTypeVisible:[{name:"point",type:"simple-marker",visible:true},{name:"multipoint",type:"simple-marker",visible:true},{name:"polyline",type:"simple-line",visible:true},{name:"polygon",type:"simple-fill",visible:true}]},
      ],
      fieldVisible:false,//字段可见性
      classesVisible:false,//分级可见性
      simpleVisible:false,//简单符号可见性
      symbolType:[{name:"point",type:"simple-marker",visible:true},{name:"multipoint",type:"simple-marker",visible:true},{name:"polyline",type:"simple-line",visible:false},{name:"polygon",type:"simple-fill",visible:false}],//符号类型
      pointVisible:false,//符号大小可见性
      pointSize:12,//符号大小
      colorRamps:[//颜色色带
      {id:0,styleObject:{background: "linear-gradient(to right,rgb(255,0,0),rgb(255,255,0),rgb(0,255,0),rgb(0,255,255),rgb(0,0,255),rgb(255,0,255),rgb(255,0,0)"},borderClassVisible:true,intervalColors:[{startColor:[255,0,0],endColor:[0,0,255]},{startColor:[0,0,255],endColor:[0,255,255]},{startColor:[0,255,255],endColor:[0,0,255]},{startColor:[0,0,255],endColor:[255,0,255]},{startColor:[255,0,255],endColor:[255,0,0]}],},
      {id:1,styleObject:{background: "linear-gradient(to right,rgb(255,255,255), rgb(0,0,0)"},borderClassVisible:false,intervalColors:[{startColor:[255,255,255],endColor:[0,0,0]}]},
      {id:2,styleObject:{background: "linear-gradient(to right,rgb(203,245,235), rgb(48,207,146)"},borderClassVisible:false,intervalColors:[{startColor:[203,245,235],endColor:[48,207,146]}],},
      {id:3,styleObject:{background: "linear-gradient(to right,rgb(255,0,0),rgb(0,0,255)"},borderClassVisible:false,intervalColors:[{startColor:[255,0,0],endColor:[0,0,255]}],},
      {id:4,styleObject:{background: "linear-gradient(to right,rgb(242,241,162), rgb(245,5,165),rgb(12,28,173)"},borderClassVisible:false,intervalColors:[{startColor:[242,241,162],endColor:[245,5,165]},{startColor:[245,5,165],endColor:[12,28,173]}],},
      {id:5,styleObject:{background: "linear-gradient(to right,rgb(255,255,0), rgb(0,128,0)"},borderClassVisible:false,intervalColors:[{startColor:[255,255,0],endColor:[0,128,0]}],},
      {id:6,styleObject:{background: "linear-gradient(to right,rgb(255,255,255),rgb(0,0,255)"},borderClassVisible:false,intervalColors:[{startColor:[255,255,255],endColor:[0,0,255]}],},
      {id:7,styleObject:{background: "linear-gradient(to right,rgb(255,255,255),rgb(255,0,0)"},borderClassVisible:false,intervalColors:[{startColor:[255,255,255],endColor:[255,0,0]}],},
      {id:8,styleObject:{background: "linear-gradient(to right,rgb(0,255,255),rgb(0,255,0),rgb(255,0,0)"},borderClassVisible:false,intervalColors:[{startColor:[0,255,255],endColor:[0,255,0]},{startColor:[0,255,0],endColor:[255,0,0]}],},
      ],
      selectColorId:0,//选择的色带id
      colorRampsVisible:false,//颜色色带可见性
      symbolTableColoums:[
        {id:0,value:"color",label:"填充符号",width:"100",type:"el-color-picker"},
        {id:1,value:"outlineColor",label:"轮廓线符号",width:"100",type:"el-color-picker"},
        {id:2,value:"value",label:"值",width:"180",type:"span"},],
        // {id:3,value:"label",label:"标注",width:null,type:"span"},],
      tableData:[],//唯一值符号样式表
      classTableColoums:[
        {id:0,value:"color",label:"填充符号",width:"100",type:"el-color-picker"},
        {id:1,value:"outlineColor",label:"轮廓线符号",width:"100",type:"el-color-picker"},
        {id:2,value:"minValue",label:"最小值",width:"150",type:"span"},
        {id:3,value:"maxValue",label:"最大值",width:"150",type:"span"},],
        // {id:4,value:"label",label:"标注",width:null,type:"span"},],
      classTableData:[],//分级符号样式表
      bsm:1,//设置符号 0表示显示符号样式，1表示设置符号样式
      customRenderer:{},//通过gis计算得的分级渲染或者唯一值渲染
      symbolStyle:'',//面填充样式
      symbolStyleOptions:myconfig.simpleFillSymbolStyle,
      lineStyle:'solid',//线填充样式
      lineStyleOptions:myconfig.simpleLineSymbolStyle,
      selectRow:{},//选中行
      symbolText:'',//填充文本
      angle:0,//符号角度
      xOffset:0,//x偏移量
      yOffset:0,//y偏移量
      isHalo:false,//光晕
      haloColor:'rgba(255,255,255,1)',//光晕颜色
      haloSize:2,//光晕大小
    }
  },
  methods: {
    handleClose(){//关闭窗体
      this.$emit('handleCloseDialog')
      this.tableData=null;
      this.classTableData=null;
      this.tableData=[];//[{color: 'rgba(0, 0, 0, 0.7)',value: '所有值',label: '所有值'}];
      this.classTableData=[];
    },
    handleClick(tab, event) {//切换符号样式选择
     this.setFieldAndClassVisible(tab.name);
    },
    setFieldAndClassVisible(name){//设置符号设置项可见性
      let index=this.activeVisible.findIndex(field => field.name==name);
      this.setPointSizeVisible(index,this.layer.geometryType);
      this.field='';
    },
    setPointSizeVisible(activeTabindex,geometryType){//设置符号大小可见性
      let index=this.activeVisible[activeTabindex].symbolTypeVisible.findIndex( item => item.name==geometryType);
      this.pointVisible=this.activeVisible[activeTabindex].symbolTypeVisible[index].visible;
    },
    getLayerProperty(){//初始化属性信息
      this.removeSet();
      this.getLayerField();
      this.getLayerRender();
    },
    removeSet(){//清除设置
      this.symbolColor=null;
      this.outlineColor='rgba(0,0,0,1)';
      this.outlineWidth=0.5;
      this.selectColorId= 0;
      this.pointSize=12;
      this.fieldOptions=[]; 
      this.classesFuncValue="equal-interval";
      this.field="";
      if(this.layer.renderer){
        this.activeName=this.layer.renderer.type?this.layer.renderer.type:"simple";
        if(this.layer.renderer.type=='simple' && this.layer.renderer.symbol.type== 'text'){
          this.activeName='text';
        }
      }
      this.setFieldAndClassVisible(this.activeName);
      this.symbolStyle='';
      this.lineStyle='solid';
      this.symbolText='';
      this.angle=0;
      this.xOffset=0;
      this.yOffset=0;
      this.isHalo=false;
      this.haloColor='rgb(255,255,255,1)';
      this.haloSize=2;
    },
    getSymbolStyle(){//获取点，线，面options
      if(this.layer.geometryType=='polygon'){
        this.symbolStyleOptions=myconfig.simpleFillSymbolStyle
      }else if(this.layer.geometryType=='point'){
        this.symbolStyleOptions=myconfig.simpleMarkerSymbolStyle
      }else{
        this.symbolStyle=''
      }
    },
    getLayerRender(){//获取图层符号颜色等样式
      if(this.layer.renderer){ 
        let type=this.layer.renderer.type;
        if(type=="unique-value"){
          this.initUniquevalueSymbol();
        }else if(type=="class-breaks"){
          this.initClassbreaksSymbol();
        }else{
          this.initSimpleSymbol();
        }
      }
    },
    initUniquevalueSymbol(){//初始化唯一值符号
      this.field=this.layer.renderer.field;
      let initCorlor=this.getColor;
      this.tableData=this.layer.renderer.uniqueValueInfos.map((item,index)=>{
        return {color:initCorlor(item.symbol.color),outlineColor:initCorlor(item.symbol.outline.color), value: item.value, label: item.label}
      });
      if(this.layer.renderer.uniqueValueInfos&&this.layer.renderer.uniqueValueInfos.length>0){
        this.outlineWidth=this.layer.renderer.uniqueValueInfos[0].symbol.outline.width;
      }
      this.customRenderer=this.layer.renderer;
    },
    initClassbreaksSymbol(){//初始化分级符号
      this.field=this.layer.renderer.field;
      this.classesValue=this.layer.renderer.classBreakInfos.length<=10?this.layer.renderer.classBreakInfos.length:10;
      let initCorlor=this.getColor;
      this.classTableData=this.layer.renderer.classBreakInfos.map((item,index)=>{
        return {color:initCorlor(item.symbol.color),outlineColor:initCorlor(item.symbol.outline.color),minValue:item.minValue, maxValue: item.maxValue, label: item.label, pointSize:this.pointSize, symbolStyle:this.symbolStyle, lineStyle:"solid"}
      });
      if(this.layer.renderer.classBreakInfos&&this.layer.renderer.classBreakInfos.length>0){
        this.outlineWidth=this.layer.renderer.classBreakInfos[0].symbol.outline.width;
      }
      this.customRenderer=this.layer.renderer;
    },
    initSimpleSymbol(){//初始化简单类型符号
      let name=this.activeName;
      let index=this.activeVisible.findIndex(field => field.name==name);
      this.setPointSizeVisible(index,this.layer.geometryType);
      let symbol=this.layer.renderer.symbol;
      if(symbol){
        this.symbolColor=symbol.color && typeof(symbol.color)=="string"?symbol.color:this.getColor(symbol.color);
        if(symbol.type!='text'){
          this.outlineColor=symbol.outline.color && typeof(symbol.outline.color)=="string"?symbol.outline.color:this.getColor(symbol.outline.color);
          this.outlineWidth=symbol.outline.width;
          if(this.layer.geometryType=='polygon'){
            this.symbolStyle=symbol.style?symbol.style:'solid'
          }else if(this.layer.geometryType=='point'){
            this.symbolStyle=symbol.style?symbol.style:'circle'
          }
          this.lineStyle=symbol.outline.style?symbol.outline.style:'solid'
        }else{
          this.angle=symbol.angle?symbol.angle:0
          this.xOffset=symbol.xOffset?symbol.xOffset:0
          this.yOffset=symbol.yOffset?symbol.yOffset:0
          this.symbolText=symbol.text?symbol.text:''
          if(symbol.haloColor){
            this.haloColor=symbol.haloColor && typeof(symbol.haloColor)=="string"?symbol.haloColor:this.getColor(symbol.haloColor);
            this.isHalo=true
          }
          if(symbol.haloSize){
            this.haloSize=symbol.haloSize
          }
        }
        if(symbol.size){
          this.pointSize=symbol.size;
        }else if(symbol.font && symbol.font.size){
          this.pointSize=symbol.font.size;
        }
      }
    },
    getColor(colorObj){//获取颜色
     let color=""
      if(colorObj && colorObj.hasOwnProperty("r")&&colorObj.hasOwnProperty("g")&&colorObj.hasOwnProperty("b")&&colorObj.hasOwnProperty("a")){
        color=colorObj.r+','+colorObj.g+','+colorObj.b+','+colorObj.a;
      }
      return color==''?'rgba(0,0,0,1)':`rgba(${color})`
    },
    getLayerField(){//获取图层字段信息
      if(this.layer.fields){
        this.fieldOptions= this.layer.fields.map((field)=>{
          return {value:field.name,label:field.alias}
        })
        let filterFields = this.layer.fields.filter(function(field){
          return field.type=="small-integer" || field.type=="integer" || field.type=="single" || field.type=="double";
        });
        this.classfieldOptions= filterFields.map((field)=>{
          return {value:field.name,label:field.alias}
        });
      }
    },
    setSymbol(bsm){//设置符号 0表示显示符号样式，1表示设置符号样式
      this.bsm=bsm;
      if(this.activeName=="simple"){
        let renderer=this.setSimpleSymbol(this.layer.geometryType);
        this.setRender(renderer)
        this.symbolDialogVisible=false;
      }else if(this.activeName=="unique-value"){
        if(this.field==""){
          this.$message({ message:'请选择字段',type:'warning'});
        }else{
          if(bsm==1&&this.tableData.length>0){
            let renderer=this.getExistRender(this.customRenderer,this.tableData,this.pointSize,this.outlineWidth,0);
            this.setRender(renderer)
          }else{
            this.openFullscreenLoading();
            this.setUniquevalueSymbol(this.selectColorId,this.pointSize,this.getColorlist,this.getUniqueValueRenderer);
          }
          bsm==1?this.symbolDialogVisible=false:this.symbolDialogVisible=true;
        }
      }else if(this.activeName=="class-breaks"){
        if(this.field==""||this.classesValue==""){
          this.$message({ message:'请选择字段，分段',type:'warning'});
        }else{
          if(bsm==1&&this.classTableData.length>0){
            let renderer=this.getExistRender(this.customRenderer,this.classTableData,this.pointSize,this.outlineWidth,1);
            this.setRender(renderer)
          }else{
            this.openFullscreenLoading();
            this.setClassbreaksSymbol(this.selectColorId,this.pointSize,this.getColorlist,this.getClassBreakInfosRenderer);
          }
          bsm==1?this.symbolDialogVisible=false:this.symbolDialogVisible=true;
        }
      }else if(this.activeName=="text"){
        if(this.symbolText==""){
          this.$message({ message:'请输入填充文本',type:'warning'});
        }else{
          let renderer2=this.setTextSymbol(this.layer.geometryType);
          this.setRender(renderer2)
          this.symbolDialogVisible=false;
        }
      }
    },
    setRender(renderer){//设置图层样式
      if(this.layerType=="map-image"){
        this.sublayer.renderer=renderer;
      }else{
        this.layer.renderer=renderer;
      }
    },
    getExistRender(renderer,dataTable,size,outlineWidth,bs){//已存在的样式,bs：0表示唯一值，1表示分级
      let temprender=renderer;
      if(bs==0){
        temprender.uniqueValueInfos.map((item,index)=>{
          item.symbol.color=dataTable[index].color;
          item.symbol.size=size;
          item.symbol.style=dataTable[index].symbolStyle;
          item.symbol.outline.color=dataTable[index].outlineColor;
          item.symbol.outline.width=outlineWidth;
          item.symbol.outline.style=dataTable[index].lineStyle;
          return true
        });
      }else{
        temprender.classBreakInfos.map((item,index)=>{
          item.symbol.color=dataTable[index].color;
          item.symbol.size=size;
          item.symbol.style=dataTable[index].symbolStyle;
          item.symbol.outline.color=dataTable[index].outlineColor;
          item.symbol.outline.width=outlineWidth;
          item.symbol.outline.style=dataTable[index].lineStyle;
          return true
        });
      }
      return temprender
    },
    setSimpleSymbol(geometryType){//设置简单符号
      let index=this.symbolType.findIndex( item => item.name==geometryType);
      let tempRender={
        type: "simple",
        symbol: {
          type: this.symbolType[index].type,
          color: this.symbolColor,
          size:this.pointSize,
          style:this.symbolStyle,
          outline: {
            width: this.outlineWidth,
            color: this.outlineColor,
            style: this.lineStyle
          }
        }
      };
      if (geometryType.includes("point")){
        tempRender.symbol.size=this.pointSize;
      }
      return tempRender;
    },
    setTextSymbol(){
      let tempRender={
        type: "simple",
        symbol: {
          type: 'text',
          angle: this.angle,
          xOffset:this.xOffset,
          yOffset:this.yOffset,
          color: this.symbolColor,
          text: this.symbolText,
          font: {
            size: this.pointSize,
            family: "宋体",
          }
        }
      };
      if(this.isHalo){
        tempRender.symbol.haloColor =this.haloColor;
        tempRender.symbol.haloSize  =this.haloSize ;
      }
      return tempRender;
    },
    setUniquevalueSymbol(selectColorId,size,getColorCallback,getUniqueValueRendererCallback){//设置唯一值符号
      let typeParams = {
        layer: this.layer,
        view: this.mapview,
        field: this.field,
        numTypes:-1,
      };
      let that=this;
      let corlors=this.colorRamps.find(item=>item.id==selectColorId).intervalColors;
      RendererCreator.typeRendererCreator.createRenderer(typeParams)
      .then(function(response){
        let colorCount =response.renderer.uniqueValueInfos.length;
        let colors_list= getColorCallback(corlors,colorCount);
        let renderer= getUniqueValueRendererCallback(response.renderer,colors_list,size,that.outlineColor,that.outlineWidth);
        if(that.bsm==1){
          that.setRender(renderer);
        }
        loading.close();
      }).catch(function (error) {
        console.log(error);
        loading.close();
      });
    },
    //设置唯一值render
    getUniqueValueRenderer(renderer,colors_list,size,outlineColor,outlineWidth){
      this.customRenderer= renderer;
      if(this.bsm==0){
        this.tableData=this.customRenderer.uniqueValueInfos.map((item,index)=>{
          return {color:colors_list[index],outlineColor:outlineColor,value: item.value, label: item.label}
        });
      }
      this.customRenderer.uniqueValueInfos.map((item,index)=>{
        item.symbol.color=colors_list[index];
        item.symbol.size=size;
        item.symbol.outline.color=outlineColor;
        item.symbol.outline.width=outlineWidth;
        return true
      });
      return this.customRenderer;
    },
    setClassbreaksSymbol(selectColorId,size,getColorCallback,getClassBreakInfosRenderer){//设置分级符号
      let colorParams = {
        layer: this.layer,
        view: this.mapview,
        field: this.field,
        classificationMethod: this.classesFuncValue,
        numClasses: parseInt(this.classesValue),
      };
      let that=this;
      let corlors=this.colorRamps.find(item=>item.id==selectColorId).intervalColors;
      RendererCreator.colorRendererCreator.createClassBreaksRenderer(colorParams)
      .then(function(response){
        let colorCount =response.renderer.classBreakInfos.length;
        let colors_list= getColorCallback(corlors,colorCount);
        let renderer= getClassBreakInfosRenderer(response.renderer,colors_list,size,that.outlineColor,that.outlineWidth);
        if(that.bsm==1){
          that.setRender(renderer);
        }
        loading.close();
      }).catch(function (error) {
        console.log(error);
        loading.close();
      });
    },
    //设置分级符号render
    getClassBreakInfosRenderer(renderer,colors_list,size,outlineColor,outlineWidth){
      this.customRenderer= renderer;
      if(this.bsm==0){
        this.classTableData=this.customRenderer.classBreakInfos.map((item,index)=>{
          return {color:colors_list[index],outlineColor:outlineColor, minValue:item.minValue, maxValue: item.maxValue, label: item.label, pointSize:this.pointSize, symbolStyle:this.symbolStyle, lineStyle:"solid"}
        });
      }
      this.customRenderer.classBreakInfos.map((item,index)=>{
        item.symbol.color=colors_list[index];
        item.symbol.size=size;
        item.symbol.outline.color=outlineColor;
        item.symbol.outline.width=outlineWidth;
        return true
      });
      return this.customRenderer;
    },
    selectColorRamp(){//设置颜色条带可见性
      this.colorRampsVisible=!this.colorRampsVisible;
    },
    checkRamp(id){//选择色带
      this.selectColorId=id;
      this.colorRamps.map((ramp)=>{
        ramp.id==id?ramp.borderClassVisible=true:ramp.borderClassVisible=false;
        return true;
      });
      this.colorRampsVisible=false;
    },
    //获得颜色列表
    getColorlist(colors,sumCount){
      let step = Math.ceil(sumCount/colors.length);
      let colors_list=[];
      let temp=[];
      let tempCorlor= colors.map(color=>{
        let gc=new gradientColor.gradientColor(color.startColor, color.endColor, step);
        colors_list= colors_list.concat(gc);
        return true;
      });  
      return colors_list;
    },
    openFullscreenLoading(){//Loading加载
      loading = this.$loading({
        lock: true,
        text: '请等待',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
  },
  watch:{
   visible :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.symbolDialogVisible=true;
      }
    },
  },
}
</script>
<style scoped>
  .spaceBetween{
    display: flex;
    justify-content: space-between;
    width:70%;
    margin-left: 20px;
    margin-bottom: 10px;
  }  
  .text{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .ramp {
    margin-left: 20px;
    width:70%;
    max-height: 20vh;
    overflow: auto;
    border: 1px gray solid;
  }
  .selectRamp{
     display: flex;
     justify-content: space-between;
     margin-left: 20px;
     border: 1px gray solid;
     width:70%;
  }
  .selectRampContainter{
    width:100%;
    height: 30px;
    margin-top: 2px;
  }
</style>
