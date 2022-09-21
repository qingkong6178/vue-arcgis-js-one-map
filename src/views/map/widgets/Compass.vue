<!--指北针工具插件 -->  
<template>          
 <el-button plain icon="el-icon-top" class="maptoolbtn" id="compass"
    @click="setWidgetVisible('compass')">指北针
 </el-button>
</template>
<script>
import Compass from "esri/widgets/Compass"; //指北针工具
import myconfig from "../mapconfig/myconfig";
export default {
  props: {    
    mapview:{
      type:Object,
    },  
  },
  data () {
    return {   
     compass:{},
     position: myconfig.widgetOnScreen.compass.position,
     visible:myconfig.widgetOnScreen.compass.visible,
    }
  },
  methods: {
   setWidgetVisible(btnid){
     if(this.mapview.ui.find(this.compass))
     {
      this.mapview.ui.remove(this.compass);
     }
     else{
      this.mapview.ui.add(this.compass,this.position);
     }
    },
  },
  mounted: function () { 
    this.compass = new Compass({
      view: this.mapview
    });
    if(this.visible){
      this.mapview.ui.add(this.compass,this.position);
    }
  },
}
</script>