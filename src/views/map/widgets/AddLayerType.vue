<!--添加各类图层 -->
<template>
  <span class="layer">
    <el-popover placement="bottom" width="200" trigger="click">
      <div>
        <!-- <div class="buttonItem" @click="addTypeLayers('search')">通过搜索添加</div> -->
        <div class="buttonItem" @click="addTypeLayers('web')">通过Web添加</div>
        <div class="buttonItem" @click="addTypeLayers('file')">通过文件添加</div>
        <div class="buttonItem" @click="addTypeLayers('group')">添加图层组</div>
        <div class="buttonItem" @click="addTypeLayers('plot')">添加标绘图层</div>
        <!-- <div class="buttonItem" @click="addTypeLayers('result')">通过我的数据添加</div> -->
      </div>
      <el-button type="text" slot="reference" style="margin-bottom: 5px" size="mini">新增图层
        <i style="margin-left: 5px" class="el-icon-arrow-down"></i>
      </el-button>
    </el-popover>
    <slot name="shadeBtn"></slot>
  </span>
</template>
<script>
export default {
  methods: {
    addTypeLayers(addType){
      this.$emit('addLayers',addType)
    },
  },
}
</script>
<style scoped>
  .layer{
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  } 
  .buttonItem {
    cursor: pointer;
    padding: 10px 0;
  }
  .buttonItem:hover {
    background: #F5F5F5;
  }
</style>
