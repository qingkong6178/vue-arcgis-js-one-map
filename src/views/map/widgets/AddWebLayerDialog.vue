<!--添加weblayer页-->
<template>
    <el-dialog title="从web添加图层" append-to-body :visible.sync="dialogVisible" @open="openDialogGetViewsTree" width="50%" @close="handleClose">
        <!-- <el-tree :data="viewsTreeData" node-key="id" default-expand-all @node-click="clickViewsTree">
          <span  class="treeNode" slot-scope="{ node, data }">
            <span>{{ data.label }}</span> 
          </span>
        </el-tree> -->
        <!-- <el-row class="selsetTree">
          <el-col :span="3" ><span class="selsetTreeTitle">图层组：</span></el-col>
          <el-col :span="21"><SelectTree :options="viewsTreeData" :value="selectTreeId" @getValue="clickViewsTree"/></el-col>
        </el-row> -->
        
        <el-form :model="dynamicValidateForm" ref="dynamicValidateForm" label-width="5px" >
          <el-form-item label-width="95px" label="图层组" >
            <SelectTree :options="viewsTreeData" :value="selectTreeId" @getValue="clickViewsTree"/>
          </el-form-item>
          <el-form-item  label-width="95px" label="服务类型" prop="webLayoutUrl" :rules="[{ required: true, message: '请选择服务类型', trigger: 'blur' }]">
            <el-select v-model="webLayoutType"  placeholder="请选择" style="width: 100%;">
                <template v-for="item in webLayoutTypeOption">
                  <el-option :label="item.label" :value="item.value" :key="item.value"></el-option>
                </template>
              </el-select>
          </el-form-item>
          <el-form-item  label-width="95px" label="服务URL" prop="webLayoutUrl" :rules="[{ required: true, message: '请输入url，比如：http://172.16.171.242:6443/arcgis/rest/services/SampleWorldCities/MapServer', trigger: 'blur' },{ min: 10,message: 'url不合法', trigger: 'blur' }]">
            <el-input placeholder="请输入url" v-model="dynamicValidateForm.webLayoutUrl" class="input-with-select">
                <el-select v-if='webLayoutType=="arc_gis_server_rest"' v-model="layerType" slot="append" placeholder="请选择" style="width: 150px">
                  <template v-for="item in layerTypeOption">
                    <el-option :label="item.label" :value="item.value" :key="item.value"></el-option>
                  </template>
                </el-select>
            </el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleWebDone('dynamicValidateForm')">确定</el-button>
        </span>
      </el-dialog>
</template>
<script>
import myconfig from "../mapconfig/myconfig";
import mylayers from "../mapconfig/layers";
import GroupLayer from "esri/layers/GroupLayer";
import SelectTree from "../components/TreeSelect";
import urlUtils from "@/utils/urlUtils";
import { clone } from '@/utils/base'
let loading;
export default {
  components: {SelectTree},
  props: {
    mapview:{
      type:Object,
    },
    visible: {//窗体开关状态
      type: Boolean,
      default: false
    },
    views: {//多屏mapview集合
      type: Array,
    },
  },
  data () {
    return {
      dialogVisible:false,
      viewsTreeData:[],//从web中添加图层页面，tree列表绑定数据
      dynamicValidateForm: {//从web中添加图层表单验证
        webLayoutUrl: ''
      },
      webLayoutType: "arc_gis_server_rest",//设置从web中添加图层服务类型
      webLayoutTypeOption: myconfig.webLayoutTypeOption,//web服务类型字典
      layerType:"",
      layerTypeOption: clone(myconfig.layerType),//arcgisserver服务类型
      addviewType:{},//区分的views
      layerGroupType:"",//图层组id
      selectTreeId:"000",//我的地图id
    }
  },
  methods: {
    handleClose(){//关闭窗体
        let timestamp = new Date().getTime();
        this.$emit('handleCloseDialog',timestamp)
    },
    openDialogGetViewsTree(){//获取从web中添加图层的tree数据
      this.addviewType=this.mapview;
      this.dynamicValidateForm.webLayoutUrl="";
      this.layerGroupType="";
      this.selectTreeId="000";
      if(this.mapview.type == "3d" && !this.layerTypeOption.find(item =>item.label == "场景图层")){
        this.layerTypeOption.push({label:"场景图层",value:"scene",prama:"?f=json"})
      }
      if(this.mapview.map.layers){
          let tempTreeData=this.views.map((view,index)=>{
            let screenNum=index==0?"":index;//id:`${index}${num}`,
            let tempViewtree={id:`${index}00`,label:`我的地图${screenNum}`,value:"",children:[]};
            for (let i = 0; i <view.map.layers.items.length; i++) {
              let layer= view.map.layers.items[i]
              if(layer instanceof GroupLayer){
                let temp=  mylayers.getAllLayerGroupTree(layer.layers,{id:`${index}${i}${1}`,label:layer.title,value:layer.id,children:[]},index,i,1);
                tempViewtree.children.push(temp);
              }
            }
          return tempViewtree
        });
        this.viewsTreeData=tempTreeData;
      }
    },
    clickViewsTree(data){//从web中添加图层，获取选中图层组树节点，获取图层组
      this.addviewType=this.views[data.id.substr(0,1)];
      this.layerGroupType=data.value;
      this.selectTreeId=data.id;
    },
    handleWebDone(formName) {//从web添加图层
      this.$refs[formName].validate((valid) => {
        if (valid && urlUtils.validURL(this.dynamicValidateForm.webLayoutUrl)) {
          this.openFullscreenLoading();
          mylayers.addTempLayer(this.addviewType, this.webLayoutType, this.dynamicValidateForm.webLayoutUrl, this.layerType,this.layerGroupType);
          loading.close();
          this.dialogVisible = false;
          this.$refs[formName].resetFields();
          this.layerType = ""
        } else {
          this.$message({showClose: true, type: 'warning', message: 'url不合法'});
          return false;
        }
      });
    },
    openFullscreenLoading(){//Loading加载
      loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
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
  .selsetTree{
    margin-left:5px;
    margin-bottom:10px;
  }
  .selsetTreeTitle{
    display: flex;
    align-items: center;
    height: 40px;
  }
</style>
