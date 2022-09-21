<template>
  <!-- <router-view/> -->
  <div style="width:100%;height:100%">
    <div v-if="!visible" id="loader-wrapper">
      <div id="loader"></div>
      <div class="loader-section section-left"></div>
      <div class="loader-section section-right"></div>
      <div class="load_title">正在加载我的地图应用,请耐心等待</div>
    </div>
    <mapApp v-show="visible" :layout="selectLayout" :isinitMap="isinitMap" :bs="bs" :widgets="widgets" :btnControlWidgets="btnControlWidgets"
      :appTitle="appTitle" :mapInfomation="mapInfomation" class="map_app">
    </mapApp>
  </div>
</template>

<script>
import mapApp from "../map/mapApp";
import myAppconfig from "../../config/myAppconfig";
export default {
  components:{mapApp},
  name: 'home',
  data () {
    return {
      selectLayout:myAppconfig.selectLayout,//应用的页面布局
      widgets:myAppconfig.widgets,//地图上的微件
      btnControlWidgets:[],//通过按钮控制，在地图上展示的工具
      appTitle:myAppconfig.appTitle,//应用标题，副标题，描述
      mapInfomation:myAppconfig.mapInfomation,//地图信息
      isinitMap:true,//是否初始化底图
      bs:0,
      visible:false,
    }
  },
  created(){
    this.openFullScreen(1000)
  },
  methods: {
    openFullScreen(time) {//加载遮罩等待
      const loading = this.$loading({
        lock: true,
        text: '加载中......',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      setTimeout(() => {
        loading.close();
        this.visible=true;
      }, time);
    },
  }
}
</script>
<style scoped>
.map_app{
  width:100%;
  height:100%;
  position: relative;
}
</style>
