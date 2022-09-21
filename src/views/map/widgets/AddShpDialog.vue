<!--从shp文件中添加layer图层页-->
<template>
    <el-dialog
    title="图层属性"
    append-to-body
    :visible.sync="dialogVisible"
    width="50%"
    @open="openDialogGetViewsTree"
    @close="handleClose">
        <!-- <el-tree :data="viewsTreeData" node-key="id" default-expand-all @node-click="clickViewsTree">
          <span  class="treeNode" slot-scope="{ node, data }">
            <span>{{ data.label }}</span> 
          </span>
        </el-tree> -->
        <el-row class="selsetTree">
          <el-col :span="3" ><span class="selsetTreeTitle">图层组：</span></el-col>
          <el-col :span="21"><SelectTree :options="viewsTreeData" :value="selectTreeId" @getValue="clickViewsTree"/></el-col>
        </el-row>

        <input type="file" id="file" value="选择文件" single accept="application/zip,.csv" style="margin-top:10px">
        <div class="el-upload__tip" style="margin-top:10px">
                Shapefile (包含所有 shapefile 文件直接形成的 ZIP 归档，不能包含多层文件夹)
                <br/>
                含可选地址、地点或坐标位置的 CSV 或 TXT 文件(以逗号、分号或制表符分隔)
                <br/>
                GPX (GPS 交换格式)
                <br/>
                GeoJSON (适用于简单地理要素的开放标准格式)
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addShp">确定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import GroupLayer from "esri/layers/GroupLayer";
import myconfig from "../mapconfig/myconfig";
import layers from "../mapconfig/layers";
import searchData from "./searchData";
import axios from 'axios';
import SelectTree from "../components/TreeSelect";
var loading;
export default {
  components: {SelectTree},
  props: {
    mapview:{
      type:Object,
    },
    visible: {
      type: Boolean,
      default: false
    },
    views: {//多屏mapview集合
      type: Array,
    },
    hightlightFeaturesFromshp: {//高亮显示从shp文件中添加的要素
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      dialogVisible:false,
      viewsTreeData:[],//从web中添加图层页面，tree列表绑定数据
      fileName:"",
      isUploadSuccess:false,
      JsonFromShpUrl:myconfig.getJsonFromShpUrl,
      StreamFromUrl:myconfig.getStreamFromUrl,
      csvLayerUrl:myconfig.csvLayerUrl,
      addviewType:{},//区分的views
      layerGroupType:"",//图层组id
      addlayerTime:0,//添加图层时间戳
      selectTreeId:"000",//我的地图id
    }
  },
  methods: {
    handleClose(){//关闭窗体
      // let timestamp = this.fileName==""?0:new Date().getTime();
      this.$emit('handleCloseDialog',this.addlayerTime.toString(),this.addlayerTime)
    },
    openDialogGetViewsTree(){//获取从web中添加图层的tree数据
      this.addviewType=this.mapview;
      this.layerGroupType="";
      this.selectTreeId="000";

      if(this.mapview.map.layers){
          let tempTreeData=this.views.map((view,index)=>{
            let screenNum=index==0?"":index;//id:`${index}${num}`,
            let tempViewtree={id:`${index}00`,label:`我的地图${screenNum}`,value:"",children:[]};
            for (let i = 0; i <view.map.layers.items.length; i++) {
              let layer= view.map.layers.items[i]
              if(layer instanceof GroupLayer){
                let temp= layers.getAllLayerGroupTree(layer.layers,{id:`${index}${i}${1}`,label:layer.title,value:layer.id,children:[]},index,i,1);
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
    addShp(){//添加shp
      if(file.files.length<1){
        this.$message({showClose: true, type: 'warning', message:'请选择.zip文件'});
      }
      else{
        this.openFullscreenLoading();
        let formData = new FormData();
        formData.append("file", file.files[0]);// HTML 文件类型input，由用户选择
        this.fileName=file.files[0].name.substr(0,file.files[0].name.length-4);
        let prama=formData;
        if(file.files[0].name.endsWith(".csv")){
          formData.append("fileType", "csv");
          this.addCsvLayer(this.StreamFromUrl,prama);
        }else{
          formData.append("fileType", "shp");
          this.getJsonFromShp(this.JsonFromShpUrl,prama);
        }
      }
    },
    getJsonFromShp(url,prama){
      let that=this;
        axios.post(url, prama).then(function (response) {
          if(response.data.code=="-1"){//后台错误码
              that.$message.error(`${response.data.message}，或者zip中包含多层文件夹，zip结构应该是直接由所有shapefile文件形成的压缩包`);
          }else{
              that.addlayerTime = new Date().getTime();
              let featureLayerObj=new layers.getFeatureLayerFromShp(that.addlayerTime.toString(),0,`${that.fileName}`,response.data.data.features,response.data.data.fields,"从文件中添加",response.data.data);
              that.AddLayer(featureLayerObj.featureLayer);
              // searchData.SearchFeatures(that.mapview,featureLayerObj.featureLayer,"1=1",featureLayerObj.featureLayer.outFields,true,that.hightlightFeaturesFromshp);
          }
          loading.close();
          that.dialogVisible=false;
        }).catch(function (error) {
          loading.close();
          that.dialogVisible=false;
          that.$message.error(`数据加载失败 ${error}`);
          console.log(error);
       });
    },
    addCsvLayer(url,prama){
      axios.post(url, prama).then( (response)=> {
        if(response.data && response.data.code==200){
          let url=`${this.csvLayerUrl}/?filePath=${response.data.data.filePath}&fileName=${response.data.data.fileName}&isDelete=false`
          let layer=layers.getLayerFromType("csv",url);
          this.AddLayer(layer);
        }else{
          this.$message.error(`${response.data.message}`)
        }
          loading.close();
          this.dialogVisible=false;
      }).catch(function (error) {
          loading.close();
          this.dialogVisible=false;
          this.$message.error(`数据加载失败 ${error}`);
          console.log(error);
       });
    },
    AddLayer(layer){
      let grouplyr= this.mapview.map.findLayerById(this.layerGroupType);
      if(grouplyr){
        grouplyr.add(layer);
      }else{
        this.mapview.map.add(layer);
        // layer.when(()=>{/**2021.2.1孟哥提出新增图层去掉缩放， 想要缩放，自己手动点击缩放（防止改变当前视图） */
        //     let transExtent=layers.transformationProjection(layer.fullExtent,this.mapview.spatialReference);
        //     this.mapview.goTo({target: transExtent});
        // })
      }
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
