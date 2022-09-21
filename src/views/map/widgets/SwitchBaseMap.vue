<!--切换底图 -->
<template>
 <div class="mapinfoGrid">
    <el-row>
      <template v-for="(item,index) in baseLayersInfo">
        <el-col :span="12" :key="index">
          <layout-card :data="item" :image="item.IMAGE" :text="item.TEXT" :checked="item.selectedCheck" :checkBoxVisible='false' @check="handleLayoutItemCheck(item)">
          </layout-card>
        </el-col>
      </template>
    </el-row>
  </div>
</template>
<script>
import LayoutCard from "../components/LayoutCard";
import configfunc from "../mapconfig/configfunc";
let Base64 = require("js-base64").Base64;
export default {
  components: {LayoutCard},
  data () {
    return {
      baseLayersInfo:[],//myAppconfig.baseMapGroup,//底图服务或图层详细信息
      selectBasemap:{},//选择的底图
    }
  },
  created() {
    this.getBaseLayerInfo();//获取地图组数据
  },
  methods: {
    getBaseLayerInfo(){//获取底图服务信息
      this.$axios.post(`/siteServiceInfo/selectSiteServiceInfoById/`).then(response => {//获取服务或图层详细信息
        if (response.data && response.data.code == 200) {
          let info= configfunc.jsonKeysToCase(response.data.data,1);
          for (let i = 0; i < info.length; i++){
            let service=info[i];
            if(service.ASSA.toLowerCase()=="mapserver"||service.ASSA.toLowerCase()=="imageserver"){
              let type=configfunc.getType(service.ASSA?service.ASSA:"mapserver",JSON.parse(service.SINGLEFUSEDMAPCACHE),true);
              service.TYPE=type;
              service.IMAGE = Base64.decode(service.IMAGE);
              service.selectedCheck = false;
              let fullextentWkid = Number(service.FULLEXTENTWKID);
              let lastWkid= Number(service.FULLEXTENTWKID);
              service.WKT=service.FULLEXTENTWKT;
              if (!isNaN(fullextentWkid)) { //数字
                service.WKID=fullextentWkid;
              }else if(!isNaN(lastWkid)){
                service.WKID=lastWkid;
              }
              this.baseLayersInfo.push(service);
            }
          }
        }
      }).catch(error => {
        console.log(error);
      });
    },
    handleLayoutItemCheck(data){//选择底图
      if(this.selectBasemap!=data){
        this.$confirm('系统可能不会保存您之前所做的更改, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectBasemap=data;
          this.baseLayersInfo.map((item)=>{
          if(item.ID==data.ID){
            item.selectedCheck=true;
          }else{
              item.selectedCheck=false;
          }
          return true;
        })
        this.$emit('switchBaseMap',this.selectBasemap);
        })
      }
    },
  }
}
</script>
<style  scoped>
  .mapinfoGrid{
    margin-left:10px;
    margin-right:10px;
  }
</style>
