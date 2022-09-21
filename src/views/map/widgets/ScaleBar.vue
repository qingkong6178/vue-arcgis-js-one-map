<!--比例尺工具插件 -->  
<template>          
<el-button plain icon="el-icon-c-scale-to-original" class="maptoolbtn" id="scalebar"
  @click="setWidgetVisible('scalebar')">比例尺
</el-button>
</template>
<script>
import ScaleBar from "esri/widgets/ScaleBar"; //比例尺工具
import myconfig from "../mapconfig/myconfig";
export default {
  props: {    
    mapview:{
      type:Object,
    },  
  },
  data () {
    return {    
     scalebar:{},
     position: myconfig.widgetOnScreen.scalebar.position,
     visible: myconfig.widgetOnScreen.scalebar.visible,
    }
  },
  methods: {
   setWidgetVisible(btnid){    
     if(this.mapview.ui.find(this.scalebar))
     {
      this.mapview.ui.remove(this.scalebar);
     }
     else{
      this.mapview.ui.add(this.scalebar,this.position);
     }
   },
  },
  mounted: function () { 
    this.scalebar = new ScaleBar({
      view: this.mapview,
      unit: myconfig.widgetOnScreen["scalebar"]["unit"]
    });
    if(this.visible){
      this.mapview.ui.add(this.scalebar,this.position);
    }
  },
}
</script>