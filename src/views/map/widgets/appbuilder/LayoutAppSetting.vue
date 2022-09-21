<!--设置标题设置-->
<template>
  <div>
    <h3 style="font-weight:bold;">更改标题图片</h3>
    <img style="width: 60px; height: 60px" src='../../../../img/map.png' alt>
    <h3 style="font-weight:bold;">主标题</h3>
    <el-input v-model="info[0].name" placeholder="请输入主标题" maxlength="20" show-word-limit class="mapSetupMarginBottom" @input="handleInputDescribe(0)"></el-input>
    <h3 style="font-weight:bold;">副标题</h3>
    <el-input v-model="info[1].name" placeholder="请输入副标题" maxlength="20" show-word-limit class="mapSetupMarginBottom" @input="handleInputDescribe(0)"></el-input>
    <h3 style="font-weight:bold;">描述</h3>
    <el-input v-model="info[2].name" type="textarea" :rows="3" placeholder="暂无描述信息" class="mapSetupMarginBottom" @input="handleInputDescribe(2)"></el-input>
  </div>
</template>
<script>
export default {
  data () {
    return {
      info:[{name:""},{name:""},{name:""}],//主标题、副标题、描述
    }
  },
  methods: {
    handleInputDescribe(id){//设置标题0：主标题，1副标题，2描述
      this.$emit("setTitle",this.info);
    },
  },
}
</script>
<style scoped>
  .mapSetupMarginBottom{
    margin-bottom:10px
  }
</style>
