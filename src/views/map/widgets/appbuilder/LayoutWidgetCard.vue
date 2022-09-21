<!--微件card-->
<template>
  <div style="position:relative">
    <div class="mapBaseWidget" @click="handleClick">
        <i class="iconfont desctibe" v-html="describe"></i>
        <i class="iconfont success" v-if="rightTickVisible">&#xe653;</i>
        <div v-if="hoverDivVisible" class="hoverDiv">
          <div class="widget">
            <i class="iconfont icon" v-if="rightTopVisible" v-html="rightTopDescribe" @click="(e)=>handleDelete(e)"></i>
            <i class="iconfont icon" v-if="rightBottomVisible" v-html="rightBottomDescribe" @click="(e)=>handleEdit(e)"></i>
          </div>
        </div>
    </div>
    <slot name="content"></slot>
  </div>
</template>
<script>
export default {
  props: {
    name:{
      type:String
    },
    describe:{//卡片中心描述
      type:String
    },
    hoverDivVisible:{//鼠标悬浮div可见性
      type:Boolean,
      default:true
    },
    rightTickVisible:{//右上角对号√可见性
      type:Boolean,
    },
    rightTickDescribe:{//右上角对号√
      type:String,
    },
    rightTopVisible:{//悬浮div右上角可见性
     type:Boolean
    },
    rightTopDescribe:{//悬浮div右上角描述
     type:String
    },
    rightBottomVisible:{//悬浮div有下角可见性
     type:Boolean
    },
    rightBottomDescribe:{//悬浮div右下角描述
     type:String
    },
  },
  methods: {
    handleDelete(e){//删除
      e.stopPropagation();
      this.$emit("handleDelete");
    },
    handleEdit(e){//修改
      e.stopPropagation();
      this.$emit("handleEdit");
    },
    handleClick(){//点击
      this.$emit("handleClick");
    }
  },
}
</script>
<style scoped>
  .mapBaseWidget{
    width:70px;
    height:70px;
    background-color:rgb(23,175,247);
    margin:0 10px 10px 0;
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .hoverDiv{
    display:none;
    position: absolute;
    width:100%;
    height:100%;
    top:0;
    left:0;
  }
  .widget{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    width:100%;
    height:100%;
  }
  .mapBaseWidget:hover .hoverDiv{
    display:block;
    background-color:rgba(101, 101, 101, 0.6);
  }
  .icon{
    margin-right: 3px;
    color: white;
  }
  .desctibe{
    font-size: 28px;
    color: white;
  }
  .success{
    margin-right: 3px;
    color: white;
    position: absolute;
    top:0;
    right:0;
  }
</style>
