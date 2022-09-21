<!--添加搜索图层页-->
<template>
      <el-dialog title="搜索图层" append-to-body :visible.sync="dialogVisible" @open="openDialogGetViewsTree" @close="handleClose" width="50%">
         <!-- <el-tree :data="viewsTreeData" node-key="id" default-expand-all @node-click="clickViewsTree">
          <span  class="treeNode" slot-scope="{ node, data }">
            <span>{{ data.label }}</span>
          </span>
        </el-tree> -->
        <el-row class="selsetTree">
          <el-col :span="3" ><span class="selsetTreeTitle">图层组：</span></el-col>
          <el-col :span="21"><SelectTree :options="viewsTreeData" :value="selectTreeId" @getValue="clickViewsTree"/></el-col>
        </el-row>
        <div class="addSerchedImgCard" v-show="layoutData.length>0">
          <el-row>
            <template v-for="(item,index) in layoutData">
              <el-col :span="6" :key="index">
                  <layout-card :data="item" :text="item.text" :image="item.image" :imageStyle="item.imagestyle" :checked="item.addSearchedLayerSelected" :checkBoxVisible='true' @check="handleLayoutItemCheck(item)" >
                  </layout-card>
              </el-col>
            </template>
          </el-row>
        </div>
        <div v-show="layoutData.length==0" class="emptySerchedImgCard">暂无数据</div>
        <!-- <div>
          <el-checkbox v-model="checked1" label="全选" @change="selectAll"></el-checkbox>
        </div> -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSearchDone">确定</el-button>
        </span>
      </el-dialog>
</template>
<script>
import myconfig from "../mapconfig/myconfig";
import configfunc from "../mapconfig/configfunc";
import mylayers from "../mapconfig/layers";
import LayoutCard from "../components/LayoutCard";
import GroupLayer from "esri/layers/GroupLayer";
import SelectTree from "../components/TreeSelect";
export default {
  components: {LayoutCard,SelectTree},
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
      checked1: false,
      dialogVisible:false,
      viewsTreeData:[],//从web中添加图层页面，tree列表绑定数据
      layoutData: [],
      searchLayoutChecked: [],
      addviewType:{},//区分的views
      layerGroupType:"",//图层组id
      selectTreeId:"000",//我的地图id
    }
  },
  created() {
      let Base64 = require("js-base64").Base64;
      // this.$axiosWithToken.post("/resourceCatalogSiteMenu/selectSiteServiceInfoAll", {userId: parseInt(localStorage.getItem("userId"))}).then(response => {//是查询所有的资源的
      this.$axios.post("/selectSiteServiceInfoByDataSetId/",{}).then(response => {//只查询当前用户的
        if (response.code == 200) {
          let tempData=response.data.filter((item)=>item.type.toLowerCase()=="mapserver"||item.type.toLowerCase()=="imageserver"||item.type.toLowerCase()=="featureserver"||item.type.toLowerCase()=="wmsserver"||item.type.toLowerCase()=="wmtsserver");
          for (let i = 0; i < tempData.length; i++) {
            tempData[i].image = Base64.decode(tempData[i].image);
            tempData[i].imagestyle = "height :120px ";
            tempData[i].addSearchedLayerSelected=false;
          }
          this.layoutData=tempData;
        }
      }).catch(function (error) {
          console.log(error);
      });
  },
  methods: {
    handleClose(){//关闭窗体
        let timestamp = new Date().getTime();
        this.$emit('handleCloseDialog',timestamp)
    },
    openDialogGetViewsTree(){//获取从web中添加图层的tree数据
      this.addviewType=this.mapview;
      this.searchLayoutChecked.map((item)=>{
        item.addSearchedLayerSelected=false;
        return true
      });
      this.searchLayoutChecked=[];
      this.layerGroupType="";
      this.selectTreeId="000";
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
    handleLayoutItemCheck(data){//多选服务
      data.addSearchedLayerSelected=!data.addSearchedLayerSelected;
      let index= this.searchLayoutChecked.indexOf(data);
      if(index!=-1){
        this.searchLayoutChecked.splice(index,1)
      }
      if(data.addSearchedLayerSelected){
        this.searchLayoutChecked.push(data);
      }
    },
    handleSearchDone(formName) {//从web添加图层
      if(this.searchLayoutChecked.length>0){
        this.openFullScreen(3000);
        for (let i = 0; i < this.searchLayoutChecked.length; i++) {
          let item = this.searchLayoutChecked[i];
          this.$axios.get("/siteMenu/findSiteMneuServiceById/"+item.id,{}).then(response => {//添加服务
          if (response.code == 200) {
              let data=response.data;
              if(data.TYPE.toLowerCase()=="mapserver"||data.TYPE.toLowerCase()=="imageserver"||data.TYPE.toLowerCase()=="featureserver"){
                let isEqualSprWithmap=data.FULLEXTENTWKID==this.mapview.spatialReference.wkid;
                let type=configfunc.getType(data.TYPE,JSON.parse(data.SINGLEFUSEDMAPCACHE),isEqualSprWithmap);
                mylayers.addTempLayer(this.addviewType, "arc_gis_server_rest", data.SERVICEADDRESS, type,this.layerGroupType);
              }else if(data.TYPE.toLowerCase()=="wmsserver"){
                mylayers.addTempLayer(this.mapview, 'wmsserver', data.SERVICEADDRESS, 'wms',this.layerGroupType);
              }else if(data.TYPE.toLowerCase()=="wmtsserver"){
                mylayers.addTempLayer(this.mapview, 'wmtsserver', data.SERVICEADDRESS, 'wmts',this.layerGroupType);
              }
            } else {
              this.$message.error(response.data);
            }
          })
          .catch(error => {
            console.log(error);
         });
        }
        this.dialogVisible=false;
      }else{
        this.$message({showClose: true,message: '请选择数据',type: 'warning'});
      }
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
 .addSerchedImgCard{
   width:100%;
   height:35vh;
   overflow:auto;
 }
 .emptySerchedImgCard{
    display: flex;
    justify-content: center;
    align-items: center;
    height:60px;
    color: #909399;
    font-size: 14px;
 }
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
