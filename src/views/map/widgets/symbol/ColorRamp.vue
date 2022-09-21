<!--layer符号渲染样式-->  
<template>  
    <div :style="styleObject" :class="{customBorder:borderClassVisible,colorRamp:colorRampClassVisible,percentColorRamp:percentClassVisible}" @click="check">        
    </div>
</template>
<script>
export default {
  props: {
    id:{
      type:Number,      
    },    
    styleObject:{
      type:Object,
      // default:()=>({background: "linear-gradient(red,lime,blue)"})
    },
    borderClassVisible:{
      type:Boolean,
      default:false,
    },
    percentClassVisible:{
      type:Boolean,
      default:false,
    },
    colorRampClassVisible:{
      type:Boolean,
      default:true,
    },
  }, 
  methods: {
    check(){//选中
      this.$emit('check',this.id)
    }
  } 
}
</script>
<style scoped>  
  .colorRamp {
    width: 100%;
    height: 20px;
    /* margin-left: 10px; */
    margin-top: 2px;
    /* background: linear-gradient(red,lime,blue); */
  }
  .percentColorRamp{
    width: 100%;
    height: 100%;
  }
  .customBorder{
    border:2px solid #bbe1f1;
   
  }
</style>