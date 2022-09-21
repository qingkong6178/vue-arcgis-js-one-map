<!--微件card-->
<template>
  <div :style="toolboxStyle">
    <template v-for="(widget,index) in widgets">
      <div v-if="widget.visible && widget.type === 'button'" :key="index" :class="{toolbox:true,shadowToolbox:toolBoxBackgroud}" :style="toolStyle" @click="clickMapTool(widget)" :id="widget.btnid">
          <el-tooltip :content="widget.alt" placement="bottom">
            <i class="iconfont icon" :style="{ color: iconColor}" v-html="widget.icon"></i>
          </el-tooltip>
      </div>
    </template>
    <slot name="tool"></slot>
  </div>
</template>
<script>
export default {
  props: {
    widgets:{
      type:Array,
    },
    toolboxStyle:{
      type:String,
    },
    iconColor:{
      type:String,
    },
    toolBoxBackgroud:{
      type:Boolean,
      default:false
    },
    toolStyle:{
      type:Object
    }
  },
  methods: {
    clickMapTool(tool){//点击工具
      this.$emit("clickMapTool",tool);
    }
  },
}
</script>
<style scoped>
  .toolbox{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .shadowToolbox{
    /* background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); */
    margin:2px;
  }
  /* .shadowToolbox:hover {
    background-color: #f0f0f0;
    color: #2e2e2e;
  } */
  .icon{
    font-size: 18px;
    margin: 4px 8px;
    cursor: pointer;
  }
</style>
