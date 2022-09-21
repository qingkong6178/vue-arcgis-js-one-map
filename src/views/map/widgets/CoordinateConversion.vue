<!--坐标工具插件 -->  
<template>          
 <el-button plain icon="el-icon-coordinate" class="maptoolbtn" id="coordinateconversion"
   @click="setWidgetVisible('coordinateconversion')">坐标
 </el-button>
</template>
<script>
import CoordinateConversion from "esri/widgets/CoordinateConversion";//显示坐标工具
import myconfig from "../mapconfig/myconfig";
export default {
  props: {    
    mapview:{
      type:Object,
    },  
  },
  data () {
    return {     
     coordinateConversion:{},
     position: myconfig.widgetOnScreen.coordinateconversion.position,
     visible:myconfig.widgetOnScreen.coordinateconversion.visible,
    }
  },
  methods: {
   setWidgetVisible(btnid){    
     if(this.mapview.ui.find(this.coordinateConversion))
     {
      this.mapview.ui.remove(this.coordinateConversion);
     }
     else{      
      this.mapview.ui.add(this.coordinateConversion,this.position);
     }
    },
  }, 
  mounted: function () { 
    this.coordinateConversion = new CoordinateConversion({
      view: this.mapview
    });
   if(this.visible){
      this.mapview.ui.add(this.coordinateConversion,this.position);
    }
  },
}
</script>