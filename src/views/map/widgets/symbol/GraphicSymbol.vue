<!--graphicslayer渲染样式-->
<template>
  <el-dialog
    title="设置符号"
    :visible.sync="symbolDialogVisible"
    append-to-body
    width="40%"
    @open="getLayerProperty"
    @close="handleClose">
    <div style="padding-left:20px;padding-right:20px;height:60vh;overflow:auto">
        <el-card style="margin-bottom:10px">
            <div slot="header">
              <span>点符号</span>
            </div>
            <div class="spaceBetween">
              <el-form :model="pointConfigForm" ref="pointConfigForm" label-width="100px" style="width:80%" size="small">
                <el-form-item label="填充颜色" prop="symbolColor">
                  <el-color-picker v-model="pointConfigForm.symbolColor" show-alpha></el-color-picker>
                </el-form-item>
                <el-form-item label="填充样式" prop="symbolStyle">
                  <el-select v-model="pointConfigForm.symbolStyle" placeholder="请选择">
                    <el-option
                      v-for="item in pointConfigForm.symbolStyleOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="轮廓线颜色" prop="outlineColor">
                  <el-color-picker v-model="pointConfigForm.outlineColor" show-alpha></el-color-picker>
                </el-form-item>
                <el-form-item label="轮廓线大小" prop="outlineWidth">
                  <el-slider v-model="pointConfigForm.outlineWidth" :max="20" show-input></el-slider>
                </el-form-item>
                <el-form-item label="符号大小" prop="pointSize">
                  <el-slider v-model="pointConfigForm.pointSize" :min="1" :max="120" show-input></el-slider>
                </el-form-item>
              </el-form>
              <!-- <span>
                <el-button type="primary" size="mini" @click="dialogVisible=true,selectType='point'">导入<i class="el-icon-upload el-icon--right"></i></el-button>
              </span> -->
            </div>
        </el-card>
        <el-card style="margin-bottom:10px">
            <div slot="header">
              <span>线符号</span>
            </div>
            <div class="spaceBetween">
              <el-form :model="polylineConfigForm" ref="polylineConfigForm" label-width="100px" style="width:80%" size="small">
                <el-form-item label="轮廓线颜色" prop="outlineColor">
                    <el-color-picker v-model="polylineConfigForm.outlineColor" show-alpha></el-color-picker>
                </el-form-item>
                <el-form-item label="轮廓线样式" prop="lineStyle">
                  <el-select v-model="polylineConfigForm.lineStyle" placeholder="请选择">
                    <el-option
                      v-for="item in polylineConfigForm.symbolStyleOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="轮廓线大小" prop="outlineWidth">
                  <el-slider v-model="polylineConfigForm.outlineWidth" :max="20" show-input></el-slider>
                </el-form-item>
              </el-form>
              <!-- <span>
                <el-button type="primary" size="mini" @click="dialogVisible=true,selectType='polyline'">导入<i class="el-icon-upload el-icon--right"></i></el-button>
              </span> -->
            </div>
        </el-card>
        <el-card>
            <div slot="header">
              <span>面符号</span>
            </div>
            <div class="spaceBetween">
              <el-form :model="polygonConfigForm" ref="polygonConfigForm" label-width="100px" style="width:80%" size="small">
                <el-form-item label="填充颜色" prop="symbolColor">
                  <el-color-picker v-model="polygonConfigForm.symbolColor" show-alpha></el-color-picker>
                </el-form-item>
                <el-form-item label="填充样式" prop="symbolStyle">
                  <el-select v-model="polygonConfigForm.symbolStyle" placeholder="请选择">
                    <el-option
                      v-for="item in polygonConfigForm.symbolStyleOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="轮廓线颜色" prop="outlineColor">
                  <el-color-picker v-model="polygonConfigForm.outlineColor" show-alpha></el-color-picker>
                </el-form-item>
                <el-form-item label="轮廓线样式" prop="lineStyle">
                  <el-select v-model="polygonConfigForm.lineStyle" placeholder="请选择">
                    <el-option
                      v-for="item in polygonConfigForm.symbolLineStyleOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="轮廓线大小" prop="outlineWidth">
                  <el-slider v-model="polygonConfigForm.outlineWidth" :max="20" show-input></el-slider>
                </el-form-item>
              </el-form>
              <!-- <span>
                <el-button type="primary" size="mini" @click="dialogVisible=true,selectType='polygon'">导入<i class="el-icon-upload el-icon--right"></i></el-button>
              </span> -->
            </div>
        </el-card>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleCancle">取 消</el-button>
        <el-button size="small" type="primary" @click="setSymbol">确 定</el-button>
    </span>
    <el-drawer title="符号详情" :visible.sync="dialogVisible" direction="rtl">
        <SymbolInfo @exportSymbol='exportSymbol'></SymbolInfo>
    </el-drawer>
  </el-dialog>
</template>
<script>
import RendererCreator from "../../core/RendererCreator";
import ColorRamp from "./ColorRamp";
import gradientColor from "./gradientColor";
import myconfig from "../../mapconfig/myconfig";
import SymbolInfo from "./SymbolInfo"
import { clone } from '@/utils/base'
var loading;
export default {
  components: {ColorRamp,SymbolInfo},
  props: {
    mapview:{
      type:Object,
    },
    layer:{
      type:Object,
    },
    visible: {
      type: Boolean,
    }
  },
  data () {
    return {
      symbolDialogVisible:false,
      dialogVisible:false,
      symbolType:[{name:"point",type:"simple-marker",visible:true},{name:"multipoint",type:"simple-marker",visible:true},{name:"polyline",type:"simple-line",visible:false},{name:"polygon",type:"simple-fill",visible:false}],//符号类型
      pointConfigForm:{
        symbolColor:null,
        symbolStyleOptions:myconfig.simpleMarkerSymbolStyle,
        symbolStyle:'circle',
        outlineColor: 'rgba(0,0,0,1)',
        outlineWidth: 0.5,
        pointSize: 6
      },
      polylineConfigForm:{
        outlineColor: 'rgba(0,0,0,1)',
        symbolStyleOptions:myconfig.simpleLineSymbolStyle,
        lineStyle:'solid',
        outlineWidth: 0.5
      },
      polygonConfigForm:{
        symbolColor:null,
        symbolStyleOptions:myconfig.simpleFillSymbolStyle,
        symbolStyle:'solid',
        symbolLineStyleOptions:myconfig.simpleLineSymbolStyle,
        lineStyle:'solid',
        outlineWidth: 0.5,
        outlineColor: 'rgba(0,0,0,1)',
      },
      selectType: null
    }
  },
  methods: {
    handleClose(){//关闭窗体
        this.$emit('handleCloseDialog')
    },
    handleCancle(){
        this.symbolDialogVisible=false
        this.removeSet()
    },
    removeSet(){//清除设置
        this.$refs['pointConfigForm'].resetFields();
        this.$refs['polylineConfigForm'].resetFields();
        this.$refs['polygonConfigForm'].resetFields();
    },
    getLayerProperty(){//初始化属性信息
      if(this.layer.renderer){
          this.pointConfigForm = this.layer.renderer.pointSymbol
          this.polylineConfigForm = this.layer.renderer.polylineSymbol
          this.polygonConfigForm = this.layer.renderer.polygonSymbol
      }
    },
    setSymbol(){
        let renderer = {
            pointSymbol:this.pointConfigForm,
            polylineSymbol:this.polylineConfigForm,
            polygonSymbol:this.polygonConfigForm
        }
        this.layer.renderer = clone(renderer)
        this.layer.graphics.filter(graphic => graphic.geometry.type == 'point').forEach(item =>{
           item.symbol = {
            type: "simple-marker",
            style: this.layer.renderer.pointSymbol.symbolStyle,
            size: this.layer.renderer.pointSymbol.pointSize,
            color: this.layer.renderer.pointSymbol.symbolColor,
            outline: {
                color: this.layer.renderer.pointSymbol.outlineColor,
                width: this.layer.renderer.pointSymbol.outlineWidth
            }
           }
        })
        this.layer.graphics.filter(graphic => graphic.geometry.type == 'polyline').forEach(item =>{
            item.symbol = {
                type: "simple-line",
                color: this.layer.renderer.polylineSymbol.outlineColor,
                width: this.layer.renderer.polylineSymbol.outlineWidth,
                style: this.layer.renderer.polylineSymbol.lineStyle
            }
        })
        this.layer.graphics.filter(graphic => graphic.geometry.type == 'polygon').forEach(item =>{
            item.symbol = {
              type: "simple-fill",
              style: this.layer.renderer.polygonSymbol.symbolStyle,
              color: this.layer.renderer.polygonSymbol.symbolColor,
              outline: {
                  color: this.layer.renderer.polygonSymbol.outlineColor,
                  width: this.layer.renderer.polygonSymbol.outlineWidth,
                  style: this.layer.renderer.polygonSymbol.lineStyle
              }
            }
        })
        this.symbolDialogVisible=false;
        this.removeSet()
    },
    exportSymbol(symbol){
      if(this.selectType != symbol.mapDescriptionInformation.geometryType){
         this.$message({message: `您选择的符号类型与图层类型不一致，请选择${myconfig.geometryType[this.selectType]}符号`,type: 'warning'});
      }else{
          if(this.selectType=='point'){
            this.pointConfigForm.symbolColor = symbol.mapDescriptionInformation.symbolColor
            this.pointConfigForm.symbolStyle = symbol.mapDescriptionInformation.symbolStyle
            this.pointConfigForm.outlineColor = symbol.mapDescriptionInformation.outlineColor
            this.pointConfigForm.outlineWidth = symbol.mapDescriptionInformation.outlineWidth
            this.pointConfigForm.pointSize = symbol.mapDescriptionInformation.pointSize
          }else if(this.selectType=='polyline'){
            this.polylineConfigForm.outlineColor = symbol.mapDescriptionInformation.outlineColor
            this.polylineConfigForm.outlineWidth = symbol.mapDescriptionInformation.outlineWidth
            this.polylineConfigForm.lineStyle = symbol.mapDescriptionInformation.lineStyle

          }else if(this.selectType=='polygon'){
            this.polygonConfigForm.symbolColor = symbol.mapDescriptionInformation.symbolColor
            this.polygonConfigForm.symbolStyle = symbol.mapDescriptionInformation.symbolStyle
            this.polygonConfigForm.outlineColor = symbol.mapDescriptionInformation.outlineColor
            this.polylineConfigForm.lineStyle = symbol.mapDescriptionInformation.lineStyle
            this.polygonConfigForm.outlineWidth = symbol.mapDescriptionInformation.outlineWidth
          }
        this.dialogVisible=false;
      }
    }
  },
  watch:{
    visible :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
        if(val){
           this.symbolDialogVisible=true
        }
    }
  },
}
</script>
<style scoped>
  .spaceBetween{
    display: flex;
    justify-content: space-between;
  }
</style>
