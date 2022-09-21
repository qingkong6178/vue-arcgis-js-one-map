<template>
  <el-select :value="valueTitle" ref="selectBtn" class="selectTree">
    <el-option :value="valueTitle" :label="valueTitle" class="options">
      <el-tree
        id="tree-option"
        ref="selectTree"
        :data="options"
        node-key="id"
        default-expand-all
        @node-click="handleNodeClick">
      </el-tree>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "el-tree-select",
  props:{
    // 选项列表数据(树形结构的对象数组)
    options:{ type: Array, default: [] },
    // 初始值
    value:{type: String},
    // 可清空选项
    clearable:{type:Boolean, default: true },
   
  },
  data() {
    return {
      valueId: '',
      valueTitle:'',
    }
  },
  mounted(){
    this.valueId = this.value,// 初始值
    this.initHandle()
  },
  methods: {
    // 初始化值
    initHandle(){
      this.initSelect()
      this.initScroll()
    }, 
    initSelect(){//设置默认选中
      if(this.valueId){
        this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data.label   // 初始化显示
        this.$refs.selectTree.setCurrentKey(this.valueId)// 设置默认选中        
      }
    },
    expandedNodes(){//默认展开节点
      for(var i=0;i<this.$refs.tree.store._getAllNodes().length;i++){//默认展开
        this.$refs.selectTree.store._getAllNodes()[i].expanded = true;
      }
    },
    // 初始化滚动条
    initScroll(){
      this.$nextTick(()=>{
        let scrollWrap = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')[0]
        let scrollBar = document.querySelectorAll('.el-scrollbar .el-scrollbar__bar')
        scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;'
        scrollBar.forEach(ele => ele.style.width = 0)
      })
    },
    // 切换选项
    handleNodeClick(node){
      this.valueTitle = node.label
      this.valueId = node.id
      this.$emit('getValue',node) 
      this.$refs.selectBtn.blur()//隐藏下拉框
      // this.expandedNodes()
    },

    // 清除选中
    clearHandle(){
      this.valueTitle = ''
      this.valueId = ''   
      this.clearSelected()
      this.$emit('getValue',null)
    },
    // 清空选中样式
    clearSelected(){
      let allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach((element)=>element.classList.remove('is-current'))
    }

  },
  watch: {
    value(){
      this.valueId = this.value
      this.initSelect()
    }
  },
}
</script>

<style scoped>
  .selectTree{
    width:100%;    
  }
  .el-scrollbar .el-scrollbar__view .el-select-dropdown__item{
    height: auto;
    max-height: 274px;
    padding: 0;
    overflow: hidden;
    overflow-y: auto;
  }
  .el-select-dropdown__item.selected{
    font-weight: normal;
  }
  ul li >>>.el-tree .el-tree-node__content{
    height:auto;
    padding: 0 20px;
  }
  .el-tree-node__label{
    font-weight: normal;
  }
  .el-tree >>>.is-current .el-tree-node__label{
    color: #409EFF;
    font-weight: 700;
  }
  .el-tree >>>.is-current .el-tree-node__children .el-tree-node__label{
    color:#606266;
    font-weight: normal;
  }
</style>
