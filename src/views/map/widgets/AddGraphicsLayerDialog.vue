<!--添加标绘图层graphicsLayer -->
<template>
  <el-dialog title="添加标绘图层" append-to-body :visible.sync="dialogVisible" @open="openLayerDialog" @close="handleClose" width="50%">
      <el-form :model="groupAddForm" ref="groupAddForm" label-width="5px" style="margin-top:10px">
        <el-form-item label-width="95px" label="图层组" >
          <SelectTree :options="viewsTreeData" :value="selectTreeId" @getValue="clickViewsTree"/>
        </el-form-item>
        <el-form-item label-width="95px" label="图层名称" prop="groupName" :rules="[{ required: true, message: '请输入图层名称', trigger: 'blur' }]">
          <el-input placeholder="请输入图层名称" v-model="groupAddForm.groupName" class="input-with-select"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false,groupAddForm.groupName=''">取消</el-button>
        <el-button type="primary" @click="handleGroupDone('groupAddForm')">确定</el-button>
      </span>
  </el-dialog>
</template>
<script>
import mylayers from "../mapconfig/layers";
import GroupLayer from "esri/layers/GroupLayer";
import SelectTree from "../components/TreeSelect";
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
      groupAddForm: {//添加图层组窗体表单选中绑定值
        groupName: ''
      },
      setLayerGroupType:"",//添加图层组选中图层组绑定值
      layerGroup:[],//添加图层组窗体表单验证
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
    openLayerDialog(){//添加图层功能，获取地图已有图层
      this.addviewType=this.mapview;
      this.layerGroupType="";
      this.selectTreeId="000";
      if(this.mapview.map.layers){
          let tempTreeData=this.views.map((view,index)=>{
            let screenNum=index==0?"":index;
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
    handleGroupDone(formName){//添加图层组
      if(this.groupAddForm.groupName.trim()!=""){
          this.$refs[formName].validate((valid) => {
          if (valid) {
              let layerId = `myplotting${new Date().getTime()}`;
              mylayers.addGraphicsLayerToMap(this.addviewType,this.groupAddForm.groupName,layerId.toString(),this.layerGroupType);
              this.dialogVisible = false;
              this.$refs["groupAddForm"].resetFields()
          } else {
            console.log('error submit!!图层名称不正确');
            return false;
          }
        });
      }
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
