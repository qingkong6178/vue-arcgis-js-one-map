<!--全屏工具插件 -->  
<template>          
 <el-button plain icon="el-icon-full-screen" class="maptoolbtn" id="fullscreen"
  @click="setWidgetVisible('fullscreen')">全图
</el-button>
</template>
<script>
import Fullscreen from "esri/widgets/Fullscreen"; //全屏工具
import myconfig from "../mapconfig/myconfig";
export default {
  props: {    
    mapview:{
      type:Object,
    },  
  },
  data () {
    return {     
     fullscreen:{},
     position: myconfig.widgetOnScreen.fullscreen.position,
     visible: myconfig.widgetOnScreen.fullscreen.visible,
    }
  },
  methods: {
   setWidgetVisible(btnid){ 
     if(this.mapview.ui.find(this.fullscreen))
     {
      this.mapview.ui.remove(this.fullscreen);
     }
     else{
      this.mapview.ui.add(this.fullscreen,this.position);
     }
    },
  },
  mounted: function () { 
    this.fullscreen = new Fullscreen({
      view: this.mapview
    });
    if(this.visible){
      this.mapview.ui.add(this.fullscreen,this.position);
    }
  },
}
</script>