<!--卷帘工具插件-->
<template>
  <el-card title="卷帘工具" class="swipe" id="bkExpandSwipe">
    <div slot="header">
        <span>卷帘</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0;cursor: pointer;font-size: 16px" @click="handClose"></i>
    </div>
    <el-form :model="groupAddForm" ref="groupAddForm" label-width="5px" >
        <el-form-item label-width="95px" label="请选择图层" prop="leftLayer" :rules="[{ required: true, message: '请选择图层', trigger: 'blur' }]">
          <el-select  v-model="groupAddForm.leftLayer" placeholder="请选择图层" @focus="opengAddSwipDialog" style="width: 100%">
            <template v-for="item in layerGroup">
              <el-option :label="item.label" :value="item.value" :key="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label-width="95px" label="请选择图层" prop="rightLayer" :rules="[{ required: true, message: '请选择图层', trigger: 'blur' }]">
          <el-select v-model="groupAddForm.rightLayer" placeholder="请选择图层" @focus="opengAddSwipDialog" style="width: 100%">
            <template v-for="item in layerGroup">
              <el-option :label="item.label" :value="item.value" :key="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="direction">
            <el-radio :label="horizontal">垂直条块</el-radio>
            <el-radio :label="vertical">水平条块</el-radio>
            <!-- <el-radio disabled :label="spyglass">望远镜</el-radio> -->
          </el-radio-group>
        </el-form-item>
        <div style="text-align: right;">
          <el-button size="small" @click="handleCancle">取消</el-button>
          <el-button size="small" type="primary" @click="handleDone('groupAddForm')">确定</el-button>
        </div>
    </el-form>
  </el-card>
</template>
<script>
import Swipe from "esri/widgets/Swipe"; //卷帘工具
import Expand from "esri/widgets/Expand"; //expand可以将插件收起来
import myconfig from "../mapconfig/myconfig";
import layers from "../mapconfig/layers"
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
      position: myconfig.widgetOnScreen.swipe.position,
      visible: myconfig.widgetOnScreen.swipe.visible,
      horizontal:"horizontal",
      vertical:"vertical",
      spyglass:"spyglass",
      swipe:{},
      direction:"horizontal",
      groupAddForm: {
        leftLayer: '',
        rightLayer: '',
      },
      infrared:[],
      nearInfrared:[],
      layerGroup:[],
    }
  },
  methods: {
    setWidgetVisible(btnid,visible){//控制书签组件显隐
      if(this.mapview.ui.find(this.bkExpand)){
        this.mapview.ui.remove(this.bkExpand);
      }
      if(visible){
        this.bkExpand.expanded=true
        this.mapview.ui.add(this.bkExpand,this.position);
      }else{
        this.removeSwip();
      }
    },
    opengAddSwipDialog(){
      if(this.mapview.map.layers){
       let layers=this.mapview.map.allLayers.items.filter(function(layer){
            return layer.type!= "group" && layer.type!= "graphics";
        });
       this.layerGroup=layers.map(function(layer) {
           var obj={value:layer.id,label:layer.title};
           return obj;
        }).reverse();
      }
    },
    handleCancle() {//取消卷帘
      this.removeSwip()
      this.$emit('handleCancleClick','swipeWidget')
    },
    handleDone(formName) {//添加卷帘
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.createSwip();
          this.addSwip();
        } else {
          console.log('error submit!!卷帘所选图层不正确');
          return false;
        }
      });
    },
    createSwip(){
      this.removeSwip()
      let leftLayerId=this.groupAddForm.leftLayer;
      let rightLayerId=this.groupAddForm.rightLayer;
      this.infrared=this.mapview.map.allLayers.items.filter(function(layer){
            return layer.id==leftLayerId;
        });
      this.nearInfrared=this.mapview.map.allLayers.items.filter(function(layer){
            return layer.id==rightLayerId;
        });
      this.swipe = new Swipe({
          leadingLayers: this.infrared,
          trailingLayers: this.nearInfrared,
          position: 35, // set position of widget to 35%
          direction:this.direction,
          view: this.mapview
        });
    },
    addSwip(){
      this.mapview.ui.add(this.swipe);
    },
    removeSwip(){
      if(this.mapview.ui.find(this.swipe)){
        this.mapview.ui.remove(this.swipe);//光以此种方式取消卷帘时，卷帘图层被切割没被还原
        this.swipe.destroy();
      }
    },
    handClose(){
        this.$emit("handCloseMapTool",'swipe')
    }
  },
  mounted: function () {
    this.bkExpand = new Expand({
      view: this.mapview,
      content: document.getElementById("bkExpandSwipe"),
      expanded: true
    });
    if(this.visible){
      this.mapview.ui.add(this.bkExpand,this.position);
    }
  },
  watch:{
    widgetShow :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
      this.setWidgetVisible("bkExpandSwipe",val);
    },
  },
}
</script>
<style scoped>
.swipe{
  width:18vw;
  height:35vh;
  overflow:auto;
}
</style>
