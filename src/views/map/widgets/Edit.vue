<!--编辑工具插件 -->
<template>
  <el-card class="editArea" id="editArea">
      <div slot="header">
        <span>编辑</span>
        <i class="el-icon-close" style="float: right; font-size:20px; cursor:pointer" @click="handleCancle" ></i>
      </div>
      <div id="addFeatureDiv" v-show="addFeatureVisble">
        <h3 class="list-heading">说明</h3>
        <ul style="font-size: 13px; padding-left: 1.5em">
          <li>从列表中选择模板</li>
          <li>点击地图以创建新要素</li>
          <li>更新关联的属性数据</li>
          <li>单击<i>更新要素属性信息</i></li>
        </ul>
        <div id="addTemplatesDiv"></div>
        <div id="updateInstructionDiv" style="text-align: center;">
          <p class="or-wrap"><span class="or-text">或者</span></p>
          <p id="selectHeader">选择一个要素后编辑或者删除</p>
        </div>
      </div>
      <div id="featureUpdateDiv" v-show="!addFeatureVisble">
        <h3 class="list-heading">输入要素信息</h3>
        <div id="attributeArea">
          <div id="formDiv"></div>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateFeature">更新要素</el-button>
            <el-button type="primary" size="mini" icon="el-icon-delete" @click="deleteFeature">删除要素</el-button>
        </div>
      </div>
  </el-card>
</template>
<script>
import Graphic from "esri/Graphic";
import Expand from "esri/widgets/Expand";
import FeatureForm from "esri/widgets/FeatureForm";
import FeatureTemplates from "esri/widgets/FeatureTemplates";
import myconfig from "../mapconfig/myconfig";
import FeatureLayer from "esri/layers/FeatureLayer";
let highlight;
let handleLisenters=[];
export default {
  props: {
    mapview:{
      type:Object,
    },
    layer:{
      type:Object,
    },
    widgetShow:{//组件显隐状态
      type: Boolean,
    },
  },
  data () {
    return {
      editExpand:{},
      position: myconfig.widgetOnScreen.edit.position,
      visible: myconfig.widgetOnScreen.edit.visible,
      addFeatureVisble: true,
      featureForm:{},
      templates:{},
      editFeature:{},
    
    }
  },
  methods: {
   setWidgetVisible(visible){
     this.removeEditWidget();
     if(visible){
      this.getFeatureForm();
      this.mapview.ui.add(this.editExpand,this.position);
      this.submitFeatureForm();
      this.selectExistingFeature();
      this.selectTemplate(this.templates);
     }
    },
    removeEditWidget(){
      if(this.mapview.ui.find(this.editExpand)){
          this.mapview.ui.remove(this.editExpand)
      }
      this.removeHandle()
      this.unselectFeature()
    },
    handleCancle(){
      this.removeEditWidget();
      this.$emit('handleCancleClick')
    },
    getFeatureForm(){
      if(this.featureForm && this.featureForm.layer){
        this.featureForm.layer=this.layer
        this.featureForm.fieldConfig=this.layer.fields.filter(field=>field.type!="esriFieldTypeGeometry" && field.name!=this.layer.objectIdField).map((field)=> {
              return {
                name:field.name,
                label:field.alias
              }
            })
      }else{
        this.featureForm = new FeatureForm({
          container: "formDiv",
          layer: this.layer,
          fieldConfig: this.layer.fields.filter(field=>field.type!="esriFieldTypeGeometry" && field.name!=this.layer.objectIdField).map((field)=> {
              return {
                name:field.name,
                label:field.alias
              }
            }),
        });
      }

      if(this.templates && this.templates.layers){
        this.templates.layers=[this.layer]
      }else{
        this.templates = new FeatureTemplates({
          container: "addTemplatesDiv",
          layers: [this.layer]
        });
      }
    },
    submitFeatureForm(){
      let handle= this.featureForm.on("submit", ()=> {
        if (this.editFeature) {
          let updated = this.featureForm.getValues();
          Object.keys(updated).forEach((name)=> {
            this.editFeature.attributes[name] = updated[name];
          });
          let edits = {
            updateFeatures: [this.editFeature]
          };
          this.applyEditsToIncidents(edits);
          document.getElementById("mapView").style.cursor = "auto";
        }
      });
      this.addHandle(handle)
    },
    selectTemplate(templates){
      let selectHandle=templates.on("select", (evtTemplate)=> {
          let attributes = evtTemplate.template.prototype.attributes;
          this.unselectFeature();
          document.getElementById("mapView").style.cursor = "crosshair";
          let handler = this.mapview.on("click",(event)=> {
            handler.remove();
            event.stopPropagation();
            this.featureForm.feature = null;

            if (event.mapPoint) {
              let point = event.mapPoint.clone();
              point.z = undefined;
              point.hasZ = false;

              this.editFeature = new Graphic({
                geometry: point,
              });

              let edits = {
                addFeatures: [this.editFeature]
              };
              this.applyEditsToIncidents(edits);
              document.getElementById("mapView").style.cursor = "auto";
            } else {
              console.error("event.mapPoint is not defined");
            }
          });
        });
        this.addHandle(selectHandle)
    },
    selectExistingFeature() {
      let handle = this.mapview.on("click",(event)=> {
        this.unselectFeature();
        if (document.getElementById("mapView").style.cursor != "crosshair") {
          this.mapview.hitTest(event).then((response)=> {
            if (response.results.length === 0) {
              this.addFeatureVisble=true;
            } else if (response.results[0].graphic && response.results[0].graphic.layer.id == this.layer.id) {
                if (this.addFeatureVisble) {
                  this.addFeatureVisble=false;
                }
               this.selectFeature(response.results[0].graphic.attributes[this.layer.objectIdField]);
            }
          });
        }
      });
      this.addHandle(handle)
    },
    addHandle(handle){
      if(!handleLisenters.includes(handle)){
        handleLisenters.push(handle)
      }
    },
    removeHandle(){
      handleLisenters.forEach((handleItem)=>{
        handleItem.remove();
        handleItem=null;
      })
    },
    updateFeature(){
      this.featureForm.submit();
    },
    deleteFeature(){
      let edits = {
        deleteFeatures: [this.editFeature]
      };
      this.applyEditsToIncidents(edits);
      document.getElementById("mapView").style.cursor = "auto";
    },
    applyEditsToIncidents(params) {
        this.layer.applyEdits(params).then((editsResult)=> {
            if (editsResult.addFeatureResults.length > 0 || editsResult.updateFeatureResults.length > 0) {
                this.unselectFeature();
                let objectId;
                if (editsResult.addFeatureResults.length > 0) {
                  objectId = editsResult.addFeatureResults[0].objectId;
                } else {
                  this.featureForm.feature = null;
                  objectId = editsResult.updateFeatureResults[0].objectId;
                }
                this.selectFeature(objectId);
                if (this.addFeatureVisble == true) {
                  this.addFeatureVisble=false;
                }
              }else if (editsResult.deleteFeatureResults.length > 0) {
                this.addFeatureVisble=true;
              }
            }).catch(function (error) {
              console.log("===============================================");
              console.error(
                "[ applyEdits ] FAILURE: ",
                error.code,
                error.name,
                error.message
              );
              console.log("error = ", error);
        });
    },
    unselectFeature() {
      if (highlight) {
        highlight.remove();
      }
    },
    selectFeature(objectId) {
      this.layer.queryFeatures({
        objectIds: [objectId],
        outFields: ["*"],
        returnGeometry: true
      }).then( (results) => {
        if (results.features.length > 0) {
          this.editFeature = results.features[0];
          this.featureForm.feature = this.editFeature;
          this.mapview.whenLayerView(this.editFeature.layer).then((layerView)=> {
            highlight = layerView.highlight(this.editFeature);
          });
        }
      });
    },
  },
  mounted: function () {
      this.editExpand = new Expand({
        expandIconClass: "esri-icon-edit",
        expandTooltip: "编辑要素",
        expanded: true,
        view: this.mapview.ui,
        content: document.getElementById("editArea")
      });
  },
  watch:{
    widgetShow :function (val) {//监视组件是否关闭，若关闭，取消组件
        this.setWidgetVisible(val);
    },
    'layer.id' :function (val,oldVal) {
      if(val && oldVal && val!=oldVal && this.widgetShow){
        this.setWidgetVisible(true);
      }
    },
  },
}
</script>
<style scoped>
.editArea{
  width:18vw;
  max-height:48vh;
  overflow: auto;;
}
.editArea::-webkit-scrollbar {
/*滚动条整体样式*/
  width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.editArea::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  background   : #535353;
}
.editArea::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow   : inset 0 0 5px rgba(0,0, 0, 0.2);
  border-radius: 10px;
  background   : #ededed;
}
.bookmarkItem {
  display: flex;
  justify-content: space-between;
}
.addBookmark{
  font-size: 14px;
  padding: 10px 0px;
}
.locateStar{
  color: red
}
.nameBox {
  display: flex;
  align-items: center;
  width:90%;
}
.editBox{
   width:10%;
}
.keepRight{
  float: right;
  padding: 3px 0;
}
</style>

