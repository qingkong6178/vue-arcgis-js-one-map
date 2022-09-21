<!--布局样式-->
<template>
  <div>
    <h3 style="font-weight:bold;">布局</h3>
    <el-row :gutter="20">
      <el-col :span="12">
        <img style="width: 100%; height:100%" src='../../../img/classicsLayout.png' alt :class="{'active':layoutSample[0].visible}" @click="handleSelectLayout(0)"/>
        <div class="demonstration">经典</div>
      </el-col>
      <el-col :span="12">
        <img style="width: 100%; height: 100%" src='../../../img/siderLayout.png' alt :class="{'active':layoutSample[1].visible}" @click="handleSelectLayout(1)"/>
        <div class="demonstration">侧面栏</div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <img style="width: 100%; height: 100%" src='../../../img/taskbarLayout.png' alt :class="{'active':layoutSample[2].visible}" @click="handleSelectLayout(2)">
        <div class="demonstration">任务台</div>
      </el-col>
    <el-col :span="12">
        <img style="width: 100%; height: 100%" src='../../../img/classicsLayout.png' alt :class="{'active':layoutSample[3].visible}" @click="handleSelectLayout(3)">
        <div class="demonstration">自定义1</div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <img style="width: 100%; height: 100%" src='../../../img/siderLayout.png' alt :class="{'active':layoutSample[4].visible}" @click="handleSelectLayout(4)">
        <div class="demonstration">自定义2</div>
      </el-col>
      <el-col :span="12">
        <img style="width: 100%; height: 100%" src='../../../img/taskbarLayout.png' alt :class="{'active':layoutSample[5].visible}" @click="handleSelectLayout(5)">
        <div class="demonstration">自定义3</div>
      </el-col>
    </el-row>
    <h3 style="font-weight:bold;">颜色</h3>
    <div style="display:flex;flex-wrap: wrap">
      <template v-for="(item,index) in themeColors">
        <div :key="index" :style="item.style" :class="{'active_color':item.visible,themeColor:true}" @click="selectThemeColor(index)">
        </div>
      </template>
    </div>
    <el-color-picker v-model="customizeThemeColor" style="margin:10px 10px 10px 0" @change="handleSelectThemeColor(customizeThemeColor)"></el-color-picker>
    <h3 style="font-weight:bold;">背景颜色</h3>
    <div style="display:flex;flex-wrap: wrap">
      <template v-for="(item,index) in backGroundColors">
        <div :key="index" :style="item.style" :class="{'active_color':item.visible,themeColor:true}" @click="selectBackgroundColor(index)">
        </div>
      </template>
    </div>
     <el-color-picker v-model="customizeBackGroundColor" style="margin:10px 10px 10px 0" @change="handleSelectBackGroundColor(customizeBackGroundColor)"></el-color-picker>
  </div>
</template>
<script>
export default {
  data () {
    return {
      layoutSample:[
        {id:0,name:"classicsLayout",lable:"经典",visible:true},
        {id:1,name:"siderLayout",lable:"侧面栏",visible:false},
        {id:2,name:"taskbarLayout",lable:"任务台",visible:false},
        {id:3,name:"customLayout1",lable:"自定义1",visible:false},
        {id:4,name:"customLayout2",lable:"自定义2",visible:false},
        {id:5,name:"customLayout3",lable:"自定义3",visible:false},],
      themeColors:[
        {id:0,style:"background-color:rgb(57,162,237)",label:"rgb(57,162,237)",visible:true},
        {id:1,style:"background-color:rgb(102,102,102)",label:"rgb(102,102,102)",visible:false},
        {id:2,style:"background-color:rgb(106,118,180)",label:"rgb(106,118,180)",visible:false},
        {id:3,style:"background-color:rgb(90,183,131)",label:"rgb(90,183,131)",visible:false},
        {id:4,style:"background-color:rgb(247,136,112)",label:"rgb(247,136,112)",visible:false},
        {id:5,style:"background-color:rgb(235,84,209)",label:"rgb(235,84,209)",visible:false},],
      customizeThemeColor:'rgb(0,84,166)',
      backGroundColors:[
        {id:0,style:"background-color:rgb(255,255,255)",label:"rgb(255,255,255)",visible:true},
        {id:1,style:"background-color:rgb(102,102,102)",label:"rgb(102,102,102)",visible:false},
        {id:2,style:"background-color:rgb(0,0,0)",label:"rgb(0,0,0)",visible:false},
        ],
      customizeBackGroundColor:'rgb(255,255,255)',
    }
  },
  methods: {
    handleSelectLayout(id){//选择布局样式
      for (let i = 0; i < this.layoutSample.length; i++) {
        if(this.layoutSample[i].id==id){
          this.layoutSample[i].visible =true;
        }else{
          this.layoutSample[i].visible =false;
        }
      }
      this.$emit("selectAppLayout",this.layoutSample[id].name);
    },
    selectThemeColor(id){//选择布局颜色
      for (let i = 0; i < this.themeColors.length; i++) {
        if(this.themeColors[i].id==id){
          this.themeColors[i].visible =true;
        }else{
          this.themeColors[i].visible =false;
        }
      }
      this.handleSelectThemeColor(this.themeColors[id].label);
    },
    handleSelectThemeColor(color){//提交颜色
      this.$emit("selectThemeColor",color);
    },
    selectBackgroundColor(id){//选择主体部分背景颜色
      for (let i = 0; i < this.backGroundColors.length; i++) {
        if(this.backGroundColors[i].id==id){
          this.backGroundColors[i].visible =true;
        }else{
          this.backGroundColors[i].visible =false;
        }
      }
      this.handleSelectBackGroundColor(this.backGroundColors[id].label);
    },
    handleSelectBackGroundColor(color){//提交主体部分背景颜色
      this.$emit("selectBackGroundColor",color);
    },
  },
}
</script>
<style scoped>
  .demonstration{
    margin-top:10px;
    margin-bottom:10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .active{
    border:2px solid #17aff7;
  }
  .active_color{
    border:2px solid #000000;
  }
  .themeColor{
    width :70px;
    height:30px;
    margin:10px 10px 0 0;
  }
</style>
