<!--打印插件 -->
<template>
 <el-button plain icon="el-icon-printer" class="maptoolbtn" id="print"
   @click="setWidgetVisible('print')">打印
</el-button>
</template>
<script>
import Print from "esri/widgets/Print"; //返回初始状态工具
import myconfig from "../mapconfig/myconfig";
export default {
  props: {
    mapview:{
      type:Object,
    },
  },
  data () {
    return {
     print:{},
     position: myconfig.widgetOnScreen.print.position,
     printServiceUrl:myconfig.widgetOnScreen.print.printServiceUrl,
     visible: myconfig.widgetOnScreen.print.visible,
    }
  },
  methods: {
   setWidgetVisible(btnid){
     if(this.mapview.ui.find(this.print))
     {
      this.mapview.ui.remove(this.print);
     }
     else{
      this.mapview.ui.add(this.print,this.position);
     }
    },
  },
  mounted: function () {
    this.print = new Print({
      view: this.mapview,
      printServiceUrl:this.printServiceUrl,
    });
    if(this.visible){
      this.mapview.ui.add(this.print,this.position);
    }
  },
}
</script>
