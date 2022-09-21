<template>
  <el-card shadow="hover" :body-style="{ padding: '10px' }" style="margin: 5px;cursor: pointer;box-shadow: 1px 1px 3px 3px #EEE;" :class="{checkedClass:checked}" > 
    <div style="width:100%,height:100%,position:relative" @click="handleClick">    
      <el-checkbox v-if="checkBoxVisible" v-model="checked" class="checkedCard" @change="handleClick"></el-checkbox>
      <div class="cardContentClass">
        <div class="addSerchedData labelContFont">{{text}}</div>
      </div>
       <div class="cardImgClass">
        <el-image :src="image" fit="scale-down" class="addSerchedData" :style="imageStyle">
        <!-- <el-image :src="image" class="addSerchedData">  -->
          <div slot="error" class="image-slot" style="display: flex;align-items: center;justify-content: center;">
             <img height="100" width="100" src="../../../img/service.png" alt />
          </div>
        </el-image>
      </div>
      <slot name="content"></slot>
    </div>
  </el-card>
</template>
<script>
  export default {
    name: "LayoutCard",
    props: {
      data:Object,
      checked:Boolean,//是否选中
      checkBoxVisible:Boolean,//多选框可见性
      text:String,//标题
      image:String,//图片
      imageStyle:String,//图片样式
    },
    methods:{
      handleClick(){
        this.$emit('check')
      }
    }
  }
</script>
<style scoped>
  .checkedCard{
    position:absolute;
  }  
  .image{
    width: 60px;
    border-radius: 5px;
  }
  .checkedClass{
    border-style: solid;
    border-width: 1px;
    border-color: #0054a6;
  }
  .cardImgClass{
    width:100%;
    height:80%;
  } 
  .cardContentClass{
    width:100%;
    height:20%;
  }
  .addSerchedData{
   width:100%;
   height:100%;
 }
  .labelContFont{
    display: flex;
    justify-content: center;
    font-weight: bold;
    word-break:keep-all;/* 不换行 */
    white-space:nowrap;/* 不换行 */
    overflow:hidden;/* 内容超出宽度时隐藏超出部分的内容 */
    text-overflow:ellipsis;
 }
</style>
