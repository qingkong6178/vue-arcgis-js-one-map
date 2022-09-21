<!-- 鼠标悬浮地图上显示的文字 -->
<template>
  <span v-show="visible" :id ="id" class="maptip">
    {{content}}
  </span>
</template>
<script>
export default {
  props: {
    visible: {
      type:Boolean,
    },
    id:{
      type:String
    },
    content:{
      type:String
    }
  },
}
</script>
<style scoped>
  .maptip{
    position: fixed;
    top: 0;
    font-size: 24px;
    box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
    /* border: 1px rgb(255, 1, 3) solid; */
    background-color: #fff;
    border-radius: 1px;
    padding: 3px 5px;
    font-size: 12px;
    white-space: nowrap;
  }
</style>
