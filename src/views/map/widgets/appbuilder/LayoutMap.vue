<!--地图-->
<template>
  <div>
    <h3 style="font-weight:bold;">我的地图</h3>
    <el-input placeholder="请输入内容" v-model="inputMapName">
      <el-button slot="append" icon="el-icon-search" @click="searchMap"></el-button>
    </el-input>
    <div class="addSerchedImgCard" v-show="layoutData.length>0">
      <el-row>
        <template v-for="(item,index) in layoutData">
          <el-col :span="24" :key="index">
              <layout-card :data="item" :text="item.text" :image="item.image" :imageStyle="item.imagestyle" :class="{'active':item.addSearchedLayerSelected}" :checked="item.addSearchedLayerSelected" :checkBoxVisible='true' @check="handleLayoutItemCheck(item)" >
              </layout-card>
          </el-col>
        </template>
      </el-row>
      <!-- <el-pagination small layout="prev, pager, next" :page-size="3" :total="layoutData.length">
      </el-pagination> -->
    </div>
    <div v-show="layoutData.length==0" class="emptySerchedImgCard">暂无数据</div>
    </div>
</template>
<script>
import LayoutCard from "../../components/LayoutCard";
import configfunc from "../../mapconfig/configfunc";
export default {
  components: {LayoutCard},
  data () {
    return {
      inputMapName:"",//输入条件
      allMapData:[],//所有的地图数据
      layoutData: [],//所有的地图数据
      selectData:[],//符合查询条件的地图数据
      switchData:{},
    }
  },
  created() {
    let Base64 = require("js-base64").Base64;
    this.$axios.post("/selectSiteServiceInfoByDataSetId/",{}).then(response => {//只查询当前用户的
      if (response.code == 200) {
        let tempData=response.data.filter((item)=>item.type.toLowerCase()=="mapserver"||item.type.toLowerCase()=="imageserver");
        for (let i = 0; i < tempData.length; i++) {
          tempData[i].image = Base64.decode(tempData[i].image);
          tempData[i].imagestyle = "height :120px ";
          tempData[i].addSearchedLayerSelected=false;
        }
        this.layoutData=tempData;
        this.allMapData=tempData;
      } else {
        this.$message.error("没有符合的数据");
      }
    }).catch(function (error) {
        console.log(error);
    });
    // this.$axiosWithToken.post("/siteServiceInfo/selectSiteServiceInfoById/").then(response => {//获取服务或图层详细信息,//对应地区的底图
    //     if (response.code == 200) {
    //       let infotemp= configfunc.jsonKeysToCase(response.data,1);
    //       let info=infotemp.filter((item)=>item.ASSA.toLowerCase()=="mapserver"||item.ASSA.toLowerCase()=="imageserver");
    //       for (let i = 0; i < info.length; i++){
    //         let service=info[i];
    //         let type=configfunc.getType(service.ASSA?service.ASSA:"mapserver",JSON.parse(service.SINGLEFUSEDMAPCACHE),true);
    //         service.TYPE=type;
    //         service.IMAGE = Base64.decode(service.IMAGE);
    //         service.selectedCheck = false;
    //         service.imagestyle = "height :120px "
    //         let fullextentWkid = Number(service.FULLEXTENTWKID);
    //         let lastWkid= Number(service.FULLEXTENTWKID);
    //         service.WKT=service.FULLEXTENTWKT;
    //         if (!isNaN(fullextentWkid)) { //数字
    //           service.WKID=fullextentWkid;
    //         }else if(!isNaN(lastWkid)){
    //           service.WKID=lastWkid;
    //         }
    //       }
    //       this.layoutData=info;
    //       this.allMapData=info;
    //     }
    //   }).catch(error => {
    //     console.log(error);
    //   });
  },
  methods: {
    handleLayoutItemCheck(data){//单选服务
      if(this.switchData!=data){
        let index= this.layoutData.indexOf(data);
        data.addSearchedLayerSelected=true;
        for (let i = 0; i < this.layoutData.length; i++) {
          if(i!=index){
            this.layoutData[i].addSearchedLayerSelected =false;
          }
        }
        this.switchData=data;
        this.$emit("selectMap",data);
      }
    },
    searchMap(){//搜索服务
      if(this.inputMapName.trim()==""){
        this.layoutData=this.allMapData;
      }else{
        let sql=this.inputMapName;
        this.selectData=this.layoutData.filter(item=>item.text.includes(sql));
        this.layoutData=this.selectData;
      }
    }
  },
}
</script>
<style  scoped>
  .layout_map_title{
    display: flex;
    justify-content: space-between;
  }
  .active{
    border:2px solid #17aff7;
  }  
  .addSerchedImgCard{
    margin:10px 0 10px 0;
    width:100%;
    height:calc(100vh - 270px);
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
</style>
