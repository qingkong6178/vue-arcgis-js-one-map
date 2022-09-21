<!--制作专题图侧边栏左侧按钮 -->
<template>
    <div class="asideBtn">
       <template v-for="(menu,index) in asideMenu">
        <span class="menuBtn" @click='pickUpAsideMenu("350px",true,menu.id)' :class="{'span_active':menu.display}" :key="index">
            <el-tooltip :content="menu.alt" placement="right">
            <i class="iconfont icon pickUp" :class="{'icon_active':menu.display}" v-html="menu.icon"></i>
            </el-tooltip>
        </span>
     </template>
    </div>
</template>
<script>

export default {
  props: {
    asideMenu:{//菜单按钮
       type:Array,
    },
  },
  methods: {
    pickUpAsideMenu(width,visible,btnId){//当点击菜单按钮触发事件
      this.$emit("pickUpAsideMenu",width);//改变侧边栏宽度
      this.$emit("clickMenubtn",visible,btnId)//控制菜单栏右侧内容显隐
    }
  },
}
</script>
<style scoped>
    .asideBtn{
        width:50px;
        cursor: pointer;
    }
    .menuBtn{
        height:50px;
        /* border: rgb(153,187,219) 1px solid; */
        width:100%;display: flex;
        justify-content: center;
        align-items: center;
    }
    .pickUp{
        font-size: 18px;
    }
    .icon_active {
        color: rgb(26, 11, 238);
    }
    .span_active {
        background-color: rgb(255, 255, 255);
    }
</style>
