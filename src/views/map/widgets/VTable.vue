<!--表格插件-->
<template>
   <span id="vtablebContainer" class="vtablebContainer">
    <el-button type="primary" class="clearTable" size="mini" @click="clearData" v-show="clearDataBtnVisible">清除数据</el-button>
    <!-- <el-button  class="clearTable rightMargin" size="mini" @click="closeTable" v-show="closeBtnVisible" icon="el-icon-close"></el-button> -->
    <el-table v-show="visible"  class="customTable" id="vtable" :key="tablecolumns.length"
        highlight-current-row
        :height="tableHeight"
        @current-change="handleCurrentChange"
        :data.sync="tableData"
        border>
        <template v-for="(tablecolumn,index) in tablecolumns">
            <el-table-column v-if="index==0" fixed="left" :key="index" :prop="tablecolumn.prop" :label="tablecolumn.label" :width="tablecolumn.width" show-overflow-tooltip>
            </el-table-column>
            <el-table-column v-else :key="index" :prop="tablecolumn.prop" :label="tablecolumn.label" :width="tablecolumn.width" show-overflow-tooltip>
            </el-table-column>
        </template>
    </el-table>
    <span class="block" v-show="visible">
        <span class="layerList" v-show="layerListVisible">
          <template v-for="(layerItem,index) in layerItems">
            <span class="layerItem" :key="index" @click="changeLayerItem(index)">
             {{layerItem.name}}
            </span>
          </template>
        </span>
        <slot name="content"></slot>
        <span v-show="totalCountVisible">共{{tableData.length}}条</span>
        <span v-show="!totalCountVisible" align="right">
          <el-pagination
            :small="true"
            @size-change="handleSizeChange"
            @current-change="handleCurrentPageChange"
            :hide-on-single-page="false"
            :current-page="currentPage"
            :pager-count="5"
            :page-sizes="[100]"
            :page-size="100"
            layout="total, sizes, prev, pager, next"
            :total="totalCount==0?tableData.length:totalCount">
          </el-pagination>
        </span>
    </span>
  </span>
</template>
<script>
import ChildsTransData from "./childsTransData";
import searchData from "./searchData";
import FeatureLayer from "esri/layers/FeatureLayer";
export default {
  props: {
      mapview:{
        type:Object,
      },
      tableDatas:{//表格数据数组
        type:Array,
      },
      featuresCollection:{//行对应的要素
        type:Array,
      },
      tableHeight:{//表格高度
        type:String,
        default: '38vh'
      },
      clearDataBtnVisible:{//清除按钮可见性
        type:Boolean,
        default: true
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
      }
  },
  data () {
    return {
        currentPage:1,
        visible:true,
        tableDataFromChild:[],
        tableData: [],
        tablecolumns:[],
        layerItems:[],
        activeLayerName:"",
    }
  },
  methods: {
    handleSizeChange(val) {//每页条数改变时
    },
    handleCurrentPageChange(val) {//当前页改变时
      let layerId=this.layerItems.find(item => item.name == this.activeLayerName).id;
      let type='feature'
      let sublayerId
      if(layerId.includes(`/`)){
          type='sublayer'
          let id=layerId.split(`/`)
          sublayerId=parseInt(id[1]);
      }
      this.$emit('getCurrentPage',val,type,sublayerId);
    },
    handleCurrentChange(val) {//双击某行缩放到此要素
        if(val){
          let serchObj=new this.setSerchPrama(val,this.layerItems,this.mapview,this.activeLayerName);
          searchData.SearchFeatures(this.mapview,serchObj.layer,serchObj.sqlWhere,serchObj.outFields);
        }
    }, 
    setSerchPrama(val,layerItems,mapview,activeLayerName){//设置查询参数
       this.layerId=layerItems.find(item => item.name == activeLayerName).id;
       if(!this.layerId.includes(`/`)){
          this.layer=mapview.map.allLayers.items.find((layer)=>layer.id==this.layerId && layer.type=="feature");
          this.objectIdField=this.layer.objectIdField;//containing a unique value or identifier for each feature in the layer，相当于图层字段属性唯一值，选择唯一值字段
          this.searchField=this.layer.objectIdField;
          this.searchFieldArr=val[this.searchField];
          this.sqlWhere=typeof(this.searchFieldArr)=="number"?`${this.searchField} = ${this.searchFieldArr}`:`${this.searchField} = '${this.searchFieldArr}'`
          this.outFields = this.layer.fields.map(field=>field.name);
          this.type='feature'
       }else{
          let id=this.layerId.split(`/`)
          this.layerId=id[0];
          this.sublayerId=id[1];
          let parentLayer=mapview.map.allLayers.items.find((layer)=>layer.id==this.layerId);
          this.layer=parentLayer.findSublayerById(parseInt(this.sublayerId));
          this.outFields = Object.keys(val);
          this.searchField= this.outFields.find(field=>field.toLowerCase()=='objectid')
          if(!this.searchField){
           this.searchField=this.outFields[0]
          }
          this.sqlWhere=typeof(val[this.searchField])=="number"?`${this.searchField} = ${val[this.searchField]}`:`${this.searchField} = '${val[this.searchField]}'`
          this.type='sublayer'
       }
    },
    setWidgetVisible(){//设置表格可见性
      this.visible=!this.visible;
    },
    // closeTable(){//关闭属性表
    //   this.$emit('closeTable',false);
    // },
    changeLayerItem(index){//切换图层显示列表
      this.activeLayerName=this.tableDataFromChild[index].name;
      this.tablecolumns=Object.keys(this.tableDataFromChild[index].data[0]).map((item)=>{
            return {
              prop:item,
              label:item,
              width:100
            }
          });
      this.tableData=this.tableDataFromChild[index].data;
    },
    changeData(data){//获取查询数据
      this.tableDataFromChild=data;
      this.tablecolumns=data.length==0?[]:Object.keys(data[0].data[0]).map((item,index)=>{//Object.keys()并非顺序取出的对象属性值
        return {
            prop:item,
            label:item,
            width:100
          }
        });
      this.layerItems=data.length==0?[]:data.map((item)=>{
        return{
          id:item.id,
          name:item.name,
        }
      });
      this.activeLayerName=data.length==0?"":data[0].name;
      this.tableData=data.length==0?[]:data[0].data;
    },
    clearData(){//清空table表格数据和列，清除地图上通过双击单元格高亮选中的要素
      this.tablecolumns=[];
      this.tableData=[];
      this.featuresCollection=[];
      searchData.CancleSearch(this.mapview);
    }
  },
  created() {
    ChildsTransData.$on('send-data',this.changeData)//注册传递数据事件
  },
  destroyed () {
    ChildsTransData.$off()
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
.clearTable{
  font-size: 10px;
  float: right;
} 
.rightMargin{
  margin-right: 5px;
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
