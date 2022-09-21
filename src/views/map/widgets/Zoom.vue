<!--缩放工具插件 -->  
<template>          
 <el-button plain icon="el-icon-zoom-in" class="maptoolbtn" id="fullscreen"
  @click="setWidgetVisible('fullscreen')">缩放
</el-button>
</template>
<script>
import Zoom from "esri/widgets/Zoom"; //缩放工具
import myconfig from "../mapconfig/myconfig";
export default {
  props: {    
    mapview:{
      type:Object,
    },  
  },
  data () {
    return {     
     zoom:{},
     position: myconfig.widgetOnScreen.zoom.position,
    }
  },
  methods: {
   setWidgetVisible(btnid){ 
     if(this.mapview.ui.find(this.zoom))
     {
      this.mapview.ui.remove(this.zoom);
     }
     else{
      this.mapview.ui.add(this.zoom,this.position);
     }
    },
  },
  mounted: function () { 
    this.zoom = new Zoom({
      view: this.mapview
    });
  },
}
</script>