<!--图例工具插件 -->  
<template>
 <el-button plain icon="el-icon-s-data" class="maptoolbtn" id="legend"
   @click="setWidgetVisible('legend')">图例
 </el-button>
</template>
<script>
import Legend from "esri/widgets/Legend"; //图例
import myconfig from "../mapconfig/myconfig";
export default {
  props: {
    mapview:{
      type:Object,
    },
  },
  data () {
    return {
     legend:{},
     info:{},
     position: myconfig.widgetOnScreen.legend.position,
     visible: myconfig.widgetOnScreen.legend.visible,
    }
  },
  methods: {
    setWidgetVisible(btnid){
     if(this.mapview.ui.find(this.legend))
     {
      this.mapview.ui.remove(this.legend);
     }else{
      //  this.changelegendItem();即使手动修改lengend项，但当地图变化时，图例项目又恢复了，
      this.mapview.ui.add(this.legend,this.position);
     }
    },
    changelegendItem(){
      this.legend.activeLayerInfos.items.every((actioveLayerInfo)=>{
          actioveLayerInfo.legendElements.every((legendElement)=>{
            if(legendElement.title=="辽阳乡镇"){
              let temp1=Array.from([...new Set(legendElement.infos)]);
              let obj = {};
              let temp=   legendElement.infos.reduce((cur,next) => {
                obj[next.label] ? "" : obj[next.label] = true && cur.push(next);
                return cur;},[]) ;
              legendElement.infos=temp;
              return  true;
            }else{
              return  false;
            };
         })
         return true
       });
    }
  },
  mounted: function () {
    this.legend = new Legend({
      view: this.mapview
    });
    if(this.visible){
      this.mapview.ui.add(this.legend,this.position);
    }
  },
}
</script>
