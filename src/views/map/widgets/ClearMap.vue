<!--清除地图工具插件 -->
<template>
 <el-button plain icon="el-icon-brush" class="maptoolbtn" id="clearmap"
  @click="setWidgetVisible('clearmap')">清除地图
</el-button>
</template>
<script>
export default {
  props: {
    mapview:{
      type:Object,
    },
  },
  methods: {
    setWidgetVisible(btnid){ //地图清除
      this.mapview.graphics.removeAll();
      let groupLayers=this.mapview.map.layers.items.filter((layer)=>layer.type=="graphics" && !layer.id.includes("myplotting"));
      groupLayers.map((layer)=>{
        layer.graphics.removeAll();
        return true;
      });
      this.clearExportMapMark()
      document.documentElement.style.cursor = ''
      this.$emit('clearMap')
    },
    clearExportMapMark(){
      let parentDiv = document.getElementById("gtkjghMyMap")
      let childDiv = document.getElementById("gtkjghExportMapByExtent")
      if(childDiv){
        parentDiv.removeChild(childDiv)
      }
    }
  },
}
</script>
