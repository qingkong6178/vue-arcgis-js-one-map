<!--前一视图，后一视图 -->
<template>
    <div :id="id" class="esri-component esri-widget">
      <div id="priveriousExtent" title="前一视图" class="esri-widget esri-widget--button esri-interactive esri-icon-left-arrow-circled" @click="toggleViewExtent(-1)"/>
      <div id="nextExtent" title="后一视图" class="esri-widget esri-widget--button esri-interactive esri-icon-right-arrow-circled" @click="toggleViewExtent(1)"/>
    </div>
</template>
<script>
import myconfig from "../mapconfig/myconfig";
export default {
  props: {
    mapview:{
      type:Object,
    },

  },
  data () {
    return {
      id: myconfig.widgetOnScreen.navigationExtent.id,
      visible: myconfig.widgetOnScreen.navigationExtent.visible,
      position: myconfig.widgetOnScreen.navigationExtent.position,
    }
  },
  methods: {
    setWidgetVisible(btnid){
        if(this.mapview.ui.find(this.home)){
            this.mapview.ui.remove(this.id);
        }
        else{
            this.mapview.ui.add(this.id,this.position)
        }
    },
    toggleViewExtent(step){
        this.$emit("toggleExtent",step)
    }
  },
  mounted: function () {
    if(this.visible){
      this.mapview.ui.add(this.id,this.position)
    }
  },
}
</script>
<style scoped>
.esri-icon-right-arrow-circled {
    border-top: solid 1px rgba(110,110,110,0.3);
}
</style>
