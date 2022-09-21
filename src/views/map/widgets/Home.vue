<!--回到初始地图工具插件 -->  
<template>          
 <el-button plain icon="el-icon-setting" class="maptoolbtn" id="home"
   @click="setWidgetVisible('home')">回到初始地图
</el-button>
</template>
<script>
import Home from "esri/widgets/Home"; //返回初始状态工具
import myconfig from "../mapconfig/myconfig";
export default {
  props: {    
    mapview:{
      type:Object,
    },  
  },
  data () {
    return {    
     home:{},
     position: myconfig.widgetOnScreen.home.position,
     visible: myconfig.widgetOnScreen.home.visible,
    }
  },
  methods: {
   setWidgetVisible(btnid){
     if(this.mapview.ui.find(this.home))
     {
      this.mapview.ui.remove(this.home);
     }
     else{
      this.mapview.ui.add(this.home,this.position);
     }
    },
  },
  mounted: function () { 
    this.home = new Home({
      view: this.mapview
    });
    if(this.visible){
      this.mapview.ui.add(this.home,this.position);
    }
  },
}
</script>