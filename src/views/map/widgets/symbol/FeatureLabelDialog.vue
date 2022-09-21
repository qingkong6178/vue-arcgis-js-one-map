<!--featurelayer符号渲染样式-->
<template>
  <el-dialog
    title="标注"
    :visible.sync="dialogVisible"
    width="30%"
    @close="handleClose"
    @open="getLayerProperty">
    <div>
      <el-checkbox v-model="labelChecked"  class="leftClass">在图层中标注要素</el-checkbox>
      <div class="spaceBetween">
        <span class="text" >标注字段</span>
          <el-select v-model="field" placeholder="请选择">
            <el-option
              v-for="item in fieldOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
      </div>
      <div class="spaceBetween">
        <span class="text">字体大小</span>
        <el-select v-model="fontSize" placeholder="请选择">
            <el-option
              v-for="item in fontSizeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
      </div>
      <div class="spaceBetween">
        <span class="text">符号颜色</span>
        <el-color-picker v-model="fontColor" show-alpha size="medium"></el-color-picker>
      </div>
      <div class="spaceBetween">
        <span class="text" >角度：</span>
        <el-input-number v-model="angle" controls-position="right" :precision="2" :min="-360" :max="360" ></el-input-number>
      </div>
      <div class="spaceBetween">
        <span class="text" >X偏移量：</span>
        <el-input-number v-model="xOffset" controls-position="right" :precision="2" :min="-32767" :max="32767" ></el-input-number>
      </div>
      <div class="spaceBetween">
        <span class="text" >Y偏移量：</span>
        <el-input-number v-model="yOffset" controls-position="right" :precision="2" :min="-32767" :max="32767" ></el-input-number>
      </div>
      <div class="spaceBetween">
        <span class="text">样式：</span>
        <el-radio-group v-model="isHalo">
          <el-radio :label="false">无</el-radio>
          <el-radio :label="true">光晕</el-radio>
        </el-radio-group>
      </div>
      <div v-if='isHalo' class="spaceBetween">
        <span class="text">光晕颜色：</span>
        <el-color-picker v-model="haloColor" show-alpha size="medium"></el-color-picker>
      </div>
      <div v-if='isHalo' class="spaceBetween">
        <span class="text">光晕大小：</span>
        <el-input-number v-model="haloSize" controls-position="right" :precision="2" :min="0" :max="32767" ></el-input-number>
      </div>
    </div>
    <!--<div class="leftClass">斜体和加粗不好用，没有对应的字体
      <el-tooltip class="item" effect="dark" content="加粗" placement="bottom">
        <el-button  size="mini" :class="{labelFontStyle:isFontBold}" @click="isFontBold=!isFontBold">B</el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="斜体" placement="bottom">
        <el-button  size="mini"  :class="{labelFontStyle:isFontItalic,labelFontItalicStyle:true}" @click="isFontItalic=!isFontItalic">I</el-button>
      </el-tooltip> 
    </div>-->
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible=false">取 消</el-button>
      <el-button type="primary" @click="setFeatureLayerLabel">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import myconfig from "../../mapconfig/myconfig";
export default {
  props: {
    mapview:{
      type:Object,
    },
    layer:{
      type:Object,
    },
    visible: {
      type: Boolean,
    },
  },
  data () {
    return {
      dialogVisible:false,//窗体显隐
      fieldOptions:[],//字段集合
      field:"",//标注字段
      labelChecked:true,//是否标注
      fontSizeOptions: [{//字体大小集合
        value: 5,
        label: 5
        },{
          value: 6,
          label: 6
        },{
          value: 7,
          label: 7
        },{
          value: 8,
          label: 8
        },{
          value: 9,
          label: 9
        },{
          value: 10,
          label: 10
        },{
          value: 11,
          label: 11
        },{
          value: 12,
          label: 12
        },{
          value: 14,
          label: 14
        },{
          value: 16,
          label: 16
        },{
          value: 18,
          label: 18
        },{
          value: 20,
          label: 20
        },{
          value: 22,
          label: 22
        },{
          value: 24,
          label: 24
        },{
          value: 26,
          label: 26
        },{
          value: 28,
          label: 28
        },{
          value: 36,
          label: 36
        },{
          value: 48,
          label: 48
        },{
          value: 72,
          label: 72
        }
      ],
      fontSize:8,//字体大小
      fontColor:'rgba(0,0,0,1)',//字体颜色
      isFontBold:true,//加粗
      isFontItalic:false,//斜体
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
    },  
    getLayerProperty(){//初始化属性信息
      let isLabel=this.layer.labelingInfo?true:false;
      this.setProperty(isLabel);
    },
    setProperty(isLabel){
      this.labelChecked=true;
      this.fieldOptions=this.getFieldsOptions();
      this.field=isLabel?this.getField():(this.fieldOptions.length>0?this.fieldOptions[0].value:"");
      this.fontSize=isLabel?(this.layer.labelingInfo[0].symbol.font.size?this.layer.labelingInfo[0].symbol.font.size:8):8;
      this.fontColor=isLabel?(this.layer.labelingInfo[0].symbol.color?this.getColor(this.layer.labelingInfo[0].symbol.color):'rgba(0,0,0,1)'):'rgba(0,0,0,1)';
      this.isFontBold=isLabel?(this.layer.labelingInfo[0].symbol.font.weight=="bold"?true:false):false;
      this.isFontItalic=isLabel?(this.layer.labelingInfo[0].symbol.font.style=="italic"?true:false):false;
      this.angle=isLabel?(this.layer.labelingInfo[0].symbol.angle?this.layer.labelingInfo[0].symbol.angle:0):0;
      this.xOffset=isLabel?(this.layer.labelingInfo[0].symbol.xOffset?this.layer.labelingInfo[0].symbol.xOffset:0):0;
      this.yOffset=isLabel?(this.layer.labelingInfo[0].symbol.yOffset?this.layer.labelingInfo[0].symbol.yOffset:0):0;
      if(isLabel){
        if(this.layer.labelingInfo[0].symbol.haloColor){
          this.haloColor=this.layer.labelingInfo[0].symbol.haloColor && typeof(this.layer.labelingInfo[0].symbol.haloColor)=="string"?this.layer.labelingInfo[0].symbol.haloColor:this.getColor(this.layer.labelingInfo[0].symbol.haloColor);
          this.isHalo=true
        }
        if(this.layer.labelingInfo[0].symbol.haloSize){
          this.haloSize=this.layer.labelingInfo[0].symbol.haloSize
        }
      }
    },
    getFieldsOptions(){//获取字段集合
     let fields=this.layer.fields.map((field)=>{
       return {
          value: field.name,
          label: field.alias
        }
     });
     return fields
    },
    getField(){//获取标注字段
      let field="";
      let str=this.layer.labelingInfo[0].labelExpressionInfo.expression;
      if(str!=""){
        field=str.replace(`$feature.`,"");
      }else{
        field=this.fieldOptions.length>0?this.fieldOptions[0].value:"";
      }
      return field
    },
    getColor(colorObj){//获取颜色
     let color=""
      if(colorObj.hasOwnProperty("r")&&colorObj.hasOwnProperty("g")&&colorObj.hasOwnProperty("b")&&colorObj.hasOwnProperty("a")){
        color=colorObj.r+','+colorObj.g+','+colorObj.b+','+colorObj.a;
      }      
      return color==''?'rgba(0,0,0,1)':`rgba(${color})`
    },
    setFeatureLayerLabel(){//设置图层标注
      if(this.labelChecked){
        let labelClass=this.getFeatureLayerLabelClass();
        this.layer.labelingInfo=[labelClass];
        this.openFullScreen(3000);
      }else{
        this.layer.labelingInfo=[];
      }
      this.dialogVisible=false;
    },
    getFeatureLayerLabelClass(){//设置标注labelClass
      let labelClass ={
        symbol: {
          type: "text",  // autocasts as new TextSymbol()
          angle:this.angle,
          xOffset:this.xOffset,
          yOffset:this.yOffset,
          color: this.fontColor,
          font: {  // autocast as new Font()
            family: "宋体",
            size: this.fontSize,
            weight:this.isFontBold?"bold":"normal",
            style:this.isFontItalic?"italic":"normal",
          }
        },
        labelPlacement: myconfig.labelPlacement[this.layer.geometryType],
        labelExpressionInfo: {
          expression:this.field!=""?`$feature.${this.field}`:`$feature.${this.fieldOptions[0].value}`
        },
      };
      if(this.isHalo){
        labelClass.symbol.haloColor =this.haloColor;
        labelClass.symbol.haloSize  =this.haloSize ;
      }
      return labelClass
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
  },
  watch:{
   visible :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.dialogVisible=true;
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
  .leftClass{
    margin-left: 20px;
    margin-bottom: 10px;
  }
  .labelFontStyle{
    /* padding: 10px; */
    background-color:rgb(204,232,255);
  }
  .labelFontItalicStyle{
    font-style: italic
  }
</style>
