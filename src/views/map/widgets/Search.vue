<!--属性查询工具插件-->
<template>
 <el-card title="按属性选择" class="selectByAttributes" id="selectByAttributes">
    <div slot="header">
        <span>属性查询</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0;cursor: pointer;font-size: 16px" @click="handClose"></i>
    </div>
    <el-form :model="groupAddForm" ref="groupAddForm" label-width="5px">
        <el-form-item label-width="95px" label="请选择图层" prop="layer" :rules="[{ required: true, message: '请选择图层', trigger: 'blur' }]">
          <el-cascader v-model="groupAddForm.layer" :show-all-levels="false" :options="layerGroup" @visible-change="openAddSelectDialog" @change="gerLayerField" style="width: 100%"></el-cascader>
          <!-- <el-select   v-model="groupAddForm.layer" placeholder="请选择图层" ref="selectLayer" @focus="openAddSelectDialog" @change="gerLayerField" style="width: 100%">
             <el-option v-for="item in layerGroup"  :label="item.label" :value="item.value" :key="item.value"></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item label-width="95px" label="请选择字段" prop="field" :rules="[{ required: true, message: '请选择字段', trigger: 'blur' }]">
          <el-select v-model="groupAddForm.field" placeholder="请选择字段" ref="selectField"  @change="setCondition(groupAddForm.field,'field')" style="width: 100%">
            <el-option v-for="item in layerFieldGroup" :label="item.label" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-button size="mini" class="btn" v-for="item in items" :key="item.value" @click="setCondition(item.value,'operator')">
         {{ item.text }}
        </el-button>
        <div style="font-size:12px">
          SELECT * FROM 选中图层 WHERE
        </div>
        <el-form-item prop="textarea" :rules="[{ required: true, message: '请输入查询条件，并且输入符号必须是英文状态的', trigger: 'blur' }]">
          <el-input style="font-size:12px"  type="textarea"  :rows="2" v-model="groupAddForm.textarea"  placeholder="请输入查询条件">
          </el-input>
        </el-form-item>
        <div style="text-align: right;">
          <el-button @click="handleCancle" size="small" >取消</el-button>
          <el-button type="primary" @click="handleDone('groupAddForm')" size="small">确定</el-button>
        </div>
    </el-form>
  </el-card>
</template>
<script>
import myconfig from "../mapconfig/myconfig";
import searchData from "./searchData";
import Expand from "esri/widgets/Expand"; //expand可以将插件收起来
import axios from "axios";
export default {
  props: {
    mapview:{
      type:Object,
    },
     widgetShow:{//组件显隐状态
      type: Boolean,
    },
  },
  data () {
    return {
      bkExpand:{},
      position: myconfig.widgetOnScreen.search.position,
      visible: myconfig.widgetOnScreen.search.visible,
      groupAddForm: {
        layer: '',
        field: '',
        textarea: '',
      },
      layerGroup:[],
      layerFieldGroup:[],
      querrLabel:'',
      items:[
              {text: '=', value: '='},
              {text: '<>', value: '<>'},
              {text: '>', value: '>'},
              {text: '<', value: '<'},
              {text: '()', value: '()'},
              {text: '_', value: '_'},
              {text: '>=', value: '>='},
              {text: '<=', value: '<='},
              {text: '%', value: '%'},
              {text: 'Like', value: 'Like'},
              {text: 'And', value: 'And'}, 
              {text: 'Or', value: 'Or'},
              {text: 'Not', value: 'Not'},
              {text: 'Is', value: 'Is'},
              {text: 'In', value: 'In'},
              {text: 'Null', value: 'Null'},
            ]
    }
  },
  methods: {
    setWidgetVisible(btnid,visible){//控制查询组件显隐
      if(this.mapview.ui.find(this.bkExpand)){
        this.mapview.ui.remove(this.bkExpand);
      } 
      if(visible){
        this.bkExpand.expanded=true
        this.mapview.ui.add(this.bkExpand,this.position);
      }else{
        searchData.CancleSearch(this.mapview);
      }
    },
    openAddSelectDialog(visible){
      if(visible){
        if(this.mapview.map.layers){//获取查询图层信息
          let fealayers=this.mapview.map.allLayers.items.filter(function(layer){
                return layer.type== "feature" && layer.url!=null;
          });
          let layers=this.mapview.map.allLayers.items.filter(function(layer){
                return (layer.type== "map-image" || layer.type== "tile") && layer.url!=null && layer.capabilities.operations.supportsQuery;
          });
          let fealayersGroup=fealayers.map(function(layer) {
              let obj={value:layer.id,label:layer.title,url:layer.url,type:layer.type,layer:layer};
              return obj;
          }).reverse();
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
          this.layerGroup=[...fealayersGroup,...LayersGroup]
        }
      }
    },
    gerLayerField(id){//获取选中图层字段信息
      this.groupAddForm.field='';
      let layerId;
      let sublayerId;
      layerId=id[0]
      if(id.length>1){
        sublayerId=id[id.length-1].replace(`${layerId}/`,'')
      }
      if(this.groupAddForm.layer && layerId){
        let selectedLayer=this.mapview.map.allLayers.items.find(function(layer){
          return layer.id== layerId;
        });
        this.groupAddForm.layerType=selectedLayer.type;
        this.getLayerFields(selectedLayer,this.groupAddForm.layerType,sublayerId)
      }
    },
    getLayerFields(selectedLayer,type,sublayerId){
       if(type=='feature'){
        this.layerFieldGroup=selectedLayer.fields.filter(field=>field.type!="esriFieldTypeGeometry" && field.type!="geometry").map(function(field) {
          let obj={value:field.name,label:field.alias};
          return obj;
        });
       }else{
          axios({
            method:"get",
            url:`${selectedLayer.url}/${sublayerId}?f=pjson`,
          }).then((response)=> {
              if(response.status==200){
                this.layerFieldGroup=response.data.fields.filter(field=>field.type!="esriFieldTypeGeometry").map(function(field) {
                  let obj={value:field.name,label:field.alias};
                  return obj;
                });
              }
          })
       }
    },
    setCondition(condition,type){//设置文本域
      if(type=='field'){
        this.groupAddForm.textarea=`${this.groupAddForm.textarea} "${this.groupAddForm.field}"`
      }
      else{
        this.groupAddForm.textarea=`${this.groupAddForm.textarea} ${condition}`
      }
    },
    handleDone(formName) {//选择
     this.$refs[formName].validate((valid) => {
        if (valid) {
          let layerId=this.groupAddForm.layer[0]
          let selectedLayer=this.mapview.map.allLayers.items.find(function(layer){
            return layer.id== layerId;
          });
          if(this.groupAddForm.layerType=='feature'){
            searchData.SearchByAttribute(this.mapview,selectedLayer,this.groupAddForm.textarea);
          }else{
            let sublayerId=parseInt(this.groupAddForm.layer[this.groupAddForm.layer.length-1].replace(`${layerId}/`,''))
            searchData.SearchSublayerFeatures(this.mapview,selectedLayer.findSublayerById(sublayerId),this.groupAddForm.textarea,['*'],true,true)
          }
        } else {
          console.log('error submit!!表达式不合法');
          return false;
        }
      });
    },
    handleCancle() {//取消
     searchData.CancleSearch(this.mapview);
     this.$emit('handleCancleClick','attSearchWidget')
    },
    handClose(){
        this.$emit("handCloseMapTool",'property_search')
    }
  },
  mounted: function () {
    this.bkExpand = new Expand({
      view: this.mapview,
      content: document.getElementById("selectByAttributes"),
      expanded: true
    });
    if(this.visible){
      this.mapview.ui.add(this.bkExpand,this.position);
    }
  },
  watch:{
    widgetShow :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
      this.setWidgetVisible("selectByAttributes",val);
    },
  },
}
</script>
<style scoped>
.selectByAttributes{
  width:18vw;
  height:50vh;
  overflow: auto;
}
.selectByAttributes::-webkit-scrollbar {
  /*滚动条整体样式*/
    width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
    height: 1px;
  }
.selectByAttributes::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  background   : #535353;
}
.selectByAttributes::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow   : inset 0 0 5px rgba(0,0, 0, 0.2);
  border-radius: 10px;
  background   : #ededed;
}
.btn {
   width:60px;
   margin-left: 10px;
   margin-bottom: 3px;
}
</style>
