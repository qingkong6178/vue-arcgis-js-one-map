<!--定位工具插件 -->
<template>
 <el-button plain icon="el-icon-map-location" class="maptoolbtn" id="locate"
  @click="setWidgetVisible('locate')">定位
 </el-button>
</template>
<script>
import Locate from "esri/widgets/Locate"; //定位工具
import myconfig from "../mapconfig/myconfig";
export default {
  props: {
    mapview:{
      type:Object,
    },
  },
  data () {
    return {
      locate:{},
      position: myconfig.widgetOnScreen.locate.position,
      visible: myconfig.widgetOnScreen.locate.visible,
    }
  },
  methods: {
   setWidgetVisible(btnid){
      if(this.mapview.ui.find(this.locate))
      {
        this.mapview.ui.remove(this.locate);
      }else{
      this.mapview.ui.add(this.locate,this.position);
     }
    },
  },
  mounted: function () {
    this.locate = new Locate({
      view: this.mapview
    });
    if(this.visible){
      this.mapview.ui.add(this.locate,this.position);
    }
  },
}
</script>
