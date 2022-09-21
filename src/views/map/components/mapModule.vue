<!--地图-->
<template>
  <div>
    <h3 style="font-weight:bold;">{{title}}</h3>
    <el-input placeholder="请输入搜索内容" v-model="inputMapName" clearable @clear="searchMap">
      <el-button slot="append" icon="el-icon-search" @click="searchMap"></el-button>
    </el-input>
    <div class="addSerchedImgCard" v-show="layoutData.length>0">
      <el-row>
        <template v-for="(item,index) in layoutData">
          <el-col :span="6" :key="index">
              <layout-card :data="item" :text="item.title" :image="item.image" :imageStyle="item.imagestyle" :class="{'active':item.addSearchedLayerSelected}" :checked="item.addSearchedLayerSelected" :checkBoxVisible='true' @check="handleLayoutItemCheck(item)" >
              </layout-card>
          </el-col>
        </template>
      </el-row>
    </div>
    <el-pagination v-show="layoutData.length>0" small layout="total, prev, pager, next" :page-size="pageSize" :page-sizes="[8, 10, 20]" :pager-count="5" :total="pageSum" @current-change="handleCurrentChange">
    </el-pagination>
    <div v-show="pageSum==0" class="emptySerchedImgCard">暂无数据</div>
    <div style="display: flex;justify-content: flex-end;">
      <el-button size="mini" @click="handleCanle">取消</el-button>
      <el-button size="mini" type="primary" @click="handleBtnOK">确定</el-button>
    </div>
  </div>
</template>
<script>
import LayoutCard from "./LayoutCard";
import configfunc from "../mapconfig/configfunc";
let Base64 = require("js-base64").Base64;
export default {
  components: {LayoutCard},
  props: {
    title:{
      type:String
    },
    resultType:{//1：二维地图；2：三维地图；3：应用；4：符号；5：成果页面模板;6：我的数据
      type:Number
    },
    visible: {//窗体开关状态
      type: Boolean,
    }
  },
  data () {
    return {
      inputMapName:"",//输入条件
      layoutData: [],//所有的地图数据
      pageSum:0,//总条数
      pageSize:8, //每页条数
    }
  },
  created() {
    this.getMapInfoByPaging(1,this.pageSize,"CREATE_TIME desc","",this.resultType);
  },
  methods: {
    handleCurrentChange(val) {//切换当前页时
      this.getMapInfoByPaging(val,this.pageSize,"CREATE_TIME desc",this.inputMapName.trim(),this.resultType);
    },
    getMapInfoByPaging(pageNum,pageSize,order,param,type){//第几页，每页数量，排序字段，地图类型（2D:1,3D：2）
      let body = {pageNum:pageNum,pageSize:pageSize,order:order,type:type};
      if(param!=""){
        body.searchFiled=param;
      }
      this.$axios.post("/thematicMapInfomation/getAllThematicMapInfomations/", body).then(response => {
        if(response.data.code==200){
          if(response.data && response.data.data){
           let tempData=response.data.data
            for (let i = 0; i < tempData.length; i++) {
              tempData[i].image = Base64.decode(tempData[i].thumbnail);
              tempData[i].imagestyle = "height :120px ";
              tempData[i].addSearchedLayerSelected=false;
            }
            this.pageSum=response.total
            this.layoutData=tempData;
          }else{
            this.pageSum=0;
            this.layoutData = [];
          }
        }else{
          this.$message({showClose: true,message: '获取数据失败'});
          this.pageSum=0;
        }
      }).catch(error=> {
        this.$message({showClose: true,message: `获取数据失败 ${error}`,type: 'error'});
        this.pageSum=0;
      });
    },
    handleLayoutItemCheck(data){//单选服务
        let index= this.layoutData.indexOf(data);
        data.addSearchedLayerSelected = !data.addSearchedLayerSelected;
        for (let i = 0; i < this.layoutData.length; i++) {
          if(i!=index){
            this.layoutData[i].addSearchedLayerSelected = false;
          }
        }
    },
    searchMap(){//搜索服务
      this.getMapInfoByPaging(1,this.pageSize,"CREATE_TIME desc",this.inputMapName.trim(),this.resultType);
    },
    handleCanle(){
      this.layoutData.forEach(item => item.addSearchedLayerSelected = false)
      this.$emit("handleCloseDialog");
    },
    handleBtnOK(){
      let data = this.layoutData.find(item => item.addSearchedLayerSelected)
      if(data){
        this.$emit("check",data.id);
        data.addSearchedLayerSelected = false
      }else{
        this.$message({showClose: true,message: '请选择数据',type: 'warning'});
      }
    },
    
  },
  watch:{
    visible :function (val) {//监视组件打开时的状态
      if(val){
        this.getMapInfoByPaging(1,this.pageSize,"CREATE_TIME desc","",this.resultType)
      }else{
        this.layoutData = [];
      }
    },
  },
}
</script>
<style scoped>
  .layout_map_title{
    display: flex;
    justify-content: space-between;
  }
  .active{
    border:1px solid #17aff7;
  }
  .addSerchedImgCard{
    margin:10px 0 10px 0;
    width:100%;
    height:40vh;
    overflow:auto;
  }
  .addSerchedImgCard::-webkit-scrollbar {
  /*滚动条整体样式*/
    width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
    height: 1px;
  }
  .addSerchedImgCard::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 10px;
    box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
    background   : #535353;
  }
  .addSerchedImgCard::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    box-shadow   : inset 0 0 5px rgba(0,0, 0, 0.2);
    border-radius: 10px;
    background   : #ededed;
  }
  .emptySerchedImgCard{
    display: flex;
    justify-content: center;
    align-items: center;
    height:60px;
    color: #909399;
    font-size: 14px;
 }
</style>
