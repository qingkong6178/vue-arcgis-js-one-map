<!--表格插件-->
<template>
   <span class="vtablebContainer">
    <el-table class="customTable" :key="tablecolumns.length"
        highlight-current-row
        :height="tableHeight"
        @row-dblclick="handleCurrentChange"
        :data.sync="tableData"
        border>
        <template v-for="(tablecolumn,index) in tablecolumns">
            <el-table-column v-if="index==0" fixed="left" :key="index" :prop="tablecolumn.prop" :label="tablecolumn.label" :width="tablecolumn.width" show-overflow-tooltip>
            </el-table-column>
            <el-table-column v-else :key="index" :prop="tablecolumn.prop" :label="tablecolumn.label" :width="tablecolumn.width" show-overflow-tooltip>
              <template slot-scope="scope">
                  <el-input v-if="tablecolumn.type =='string'" v-model="scope.row[tablecolumn.label]" size="mini" :disabled="editdisAble" :maxlength="tablecolumn.length" show-word-limit @change="handleSave(scope.row[tablecolumn.label],tablecolumn.label,scope.row)"></el-input>
                  <el-input-number v-else v-model="scope.row[tablecolumn.label]" size="mini" :disabled="editdisAble" @change="handleSave(scope.row[tablecolumn.label],tablecolumn.label,scope.row)"></el-input-number>
              </template>
            </el-table-column>
        </template>
    </el-table>
    <span class="block">
        <span class="layerList" v-show="layerListVisible">
          <template v-for="(layerItem,index) in layerItems">
            <span class="layerItem" :key="index">
             {{layerItem.name}}
            </span>
          </template>
        </span>
        <slot name="content"></slot>
        <span v-show="totalCountVisible">共{{tableData.length}}条</span>
    </span>
  </span>
</template>
<script>
export default {
  props: {
      mapview:{
        type:Object,
      },
      tableDatas:{//表格数据数组
        type:Array,
      },
      tableHeight:{//表格高度
        type:String,
        default: '38vh'
      },
      layerListVisible:{//图层列表项目可见性
        type:Boolean,
        default: true
      },
      totalCountVisible:{//总条数可见性
        type:Boolean,
        default: true
      },
      totalCount:{//总条数
        type:Number,
        default: 0
      },
      editdisAble:{
          type:Boolean,
          default: true
      }
  },
  data () {
    return {
        tableDataFromChild:[],
        tableData: [],
        tablecolumns:[],
        layerItems:[],
        activeLayerName:"",
    }
  },
  methods: {
    handleCurrentChange(val) {//双击某行缩放到此要素
        if(val){
          this.mapview.goTo({target: val.geometry})
        }
    },
    handleSave(val,columName,row){
      row.attributes[columName] = val
    },
    changeLayerItem(index){//切换图层显示列表
      this.activeLayerName=this.tableDataFromChild[index].name;
      this.tablecolumns=this.tableDataFromChild[index].fields.map(item=>{
            return {
              prop:item.name,
              label:item.name,
              width:180,
              alias:item.alias,
              type: item.type,
              length:item.length
            }
          });
      this.tableData=this.tableDataFromChild[index].data;
    },
    changeData(data){//获取查询数据
      this.tableDataFromChild=data;
      this.tablecolumns=data.length==0?[]:data[0].fields.map((item,index)=>{//Object.keys()并非顺序取出的对象属性值
        return {
            prop:item.name,
            label:item.name,
            width:180,
            alias:item.alias,
            type: item.type,
            length:item.length
          }
        });
      this.layerItems=data.length==0?[]:data.map((item)=>{
        return{
          id:item.id,
          name:item.name,
        }
      })
      this.activeLayerName=data.length==0?"":data[0].name
      this.tableData=data.length==0?[]:data[0].data
    },
  },
  watch: {
      tableDatas :{
        handler:function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
            if(val){
              this.changeData(val);
            }
          },
        deep: true
      },
    },
}
</script>
<style scoped>
.vtablebContainer{
   width:100%
}
.customTable{
  position: relative;
  width:100%;
}
.block{
  position: relative;
  background-color: #FFF;
  color:black;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.layerList{
  display: flex;
  justify-content: space-between; 
}
.layerItem{
  margin-right: 10px;
  font-size: 14px;
}
</style>
