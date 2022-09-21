<!--自定义布局样式2-->
<template>
  <split-pane :split="adjustableLayout.direction" :min-percent='adjustableLayout.minPercent' :default-percent='adjustableLayout.defaultPercent'>
    <template slot="paneL">
        <slot name="map"></slot>
    </template>
    <template slot="paneR">
      <split-pane :split="adjustableLayout.children.panR.direction" :min-percent='adjustableLayout.children.panR.minPercent' :default-percent='adjustableLayout.children.panR.defaultPercent'>
        <template slot="paneL">
          <split-pane :split="adjustableLayout.children.panR.children.panL.direction" :min-percent='adjustableLayout.children.panR.children.panL.minPercent' :default-percent='adjustableLayout.children.panR.children.panL.defaultPercent'>
            <template slot="paneL">
              <slot name="mapWidget"></slot>
            </template>
            <template slot="paneR">
              <slot name="customMapWidget"></slot>
            </template>
          </split-pane>
        </template>
        <template slot="paneR">
          <slot name="mapAttributeTable"></slot>
        </template>
      </split-pane>
    </template>
  </split-pane>
</template>
<script>
export default {
  data () {
    return {
     adjustableLayout:{direction:"vertical","minPercent":20, "defaultPercent":80,isLeaf:false,children:{
        panL:{isLeaf:true},
        panR:{direction:"horizontal","minPercent":30, "defaultPercent":50,isLeaf:false,children:{
          panL:{direction:"horizontal","minPercent":15,"defaultPercent":20,isLeaf:false,children:{
            panL:{isLeaf:true},
            panR:{isLeaf:true},
          },},
          panR:{isLeaf:true},}
        }}
      },
    }
  },
}
</script>
