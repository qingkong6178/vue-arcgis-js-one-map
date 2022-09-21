<!--符号列表页-->
<template>
    <div class="mapInfo">
        <el-table :data="tableData" class="mapinfoTable" highlight-current-row border @row-click="rowClick" height="75vh">
          <el-table-column type="index" width="50"></el-table-column>
          <el-table-column label="标题" width="120" show-overflow-tooltip>
            <template slot-scope="scope">{{ scope.row.title}}</template>
          </el-table-column>
          <el-table-column
              label="要素类型"
              width="80">
              <template slot-scope="scope">
                <img v-if="!scope.row.symbolColorStyle && scope.row.geometryType.toLowerCase()=='polygon'" src ="@/img/透明度.png"/>
                <img v-else-if="!scope.row.symbolColorStyle && scope.row.geometryType.toLowerCase()=='point'" src ="@/img/透明度点.png"/>
                <i v-else-if="scope.row.geometryType.toLowerCase()=='point'" class="iconfont icon" :style="scope.row.symbolColorStyle" v-html="'&#xe611;'"></i>
                <i v-else-if="scope.row.geometryType.toLowerCase()=='polyline'" class="iconfont icon" :style="scope.row.symbolColorStyle" v-html="'&#xe65a;'"></i>
                <i v-else-if="scope.row.geometryType.toLowerCase()=='text'" class="iconfont icon" :style="scope.row.symbolColorStyle" v-html="'&#xe76c;'"></i>
                <i v-else class="iconfont icon" :style="scope.row.symbolColorStyle" v-html="'&#xe66b;'"></i>
              </template>
          </el-table-column>
          <el-table-column prop="tag" label="标签" width="180">
            <template slot-scope="scope">
              <template v-if="scope.row.label && scope.row.label.length>0">
                <el-tag
                  v-for="(tag,index) in scope.row.label"
                  :key="index"
                  type="success"
                  disable-transitions
                >{{tag}}</el-tag>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="描述" width="300" show-overflow-tooltip>
            <template slot-scope="scope">{{ scope.row.describe}}</template>
          </el-table-column>
          <el-table-column label="预览" width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="scope.row.geometryType.toLowerCase()=='text'">{{scope.row.symbolText}}</span>
              <el-image style="height:80px" v-if="scope.row.geometryType.toLowerCase()!='text' && scope.row.preview" fit="scale-down" :src="scope.row.preview" :preview-src-list="[scope.row.preview]"></el-image>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="mapInfoPagination footer"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageSum">
          </el-pagination>
        <div class="footer">
          <el-button type="primary" @click="btnOK">确定</el-button>
        </div>
    </div>
</template>
<script>
export default {
  props: {
    searcherStr: {//查询条件
      type: String
    }
  },
  data() {
    return {
      pageSum:0,
      tableData:[],
      currentPage: 1,//当前页
      pageSize:20, //每页条数
      selectRow:{},//选中
   };
  },
  mounted(){//获取保存的地图table数据
    this.getMapInfoByPaging(1,this.pageSize,"CREATE_TIME desc",this.searcherStr,4)
  },
  methods: {
    getMapInfoByPaging(pageNum,pageSize,order,param,type){//第几页，每页数量，排序字段，地图类型（2D:1,3D：2,应用：3,符号:4）
      let body = {pageNum:pageNum,pageSize:pageSize,order:order,type:type};
      if(param!=""){
        body.searchFiled=param;
      }
      this.$axios.post("/thematicMapInfomation/getSymbolInfomations/", body).then(response => {
        if(response.code==200){
          if(response.data){
            for (let i = 0; i < response.data.length; i++) {
              response.data[i].label=JSON.parse(response.data[i].label);
              response.data[i].mapDescriptionInformation=JSON.parse(response.data[i].mapDescriptionInformation);
              response.data[i].geometryType=response.data[i].mapDescriptionInformation.geometryType;
              response.data[i].symbolStyle=response.data[i].mapDescriptionInformation.symbolStyle;
              response.data[i].lineStyle=response.data[i].mapDescriptionInformation.lineStyle;
              if(response.data[i].geometryType=='polyline'){
                response.data[i].symbolColorStyle= response.data[i].mapDescriptionInformation.outlineColor ? `color:${response.data[i].mapDescriptionInformation.outlineColor}`: null
              }else{
                response.data[i].symbolColorStyle= response.data[i].mapDescriptionInformation.symbolColor ? `color:${response.data[i].mapDescriptionInformation.symbolColor}`: null
              }
              // response.data[i].symbolColorStyle= response.data[i].geometryType=='polyline'? `color:${response.data[i].mapDescriptionInformation.outlineColor}`:`color:${response.data[i].mapDescriptionInformation.symbolColor}`;
              response.data[i].symbolColor=response.data[i].mapDescriptionInformation.symbolColor;
              response.data[i].outlineColor=response.data[i].mapDescriptionInformation.outlineColor;
              response.data[i].outlineWidth=response.data[i].mapDescriptionInformation.outlineWidth;
              response.data[i].pointSize=response.data[i].mapDescriptionInformation.pointSize;
              response.data[i].symbolText=response.data[i].mapDescriptionInformation.symbolText;
              response.data[i].angle=response.data[i].mapDescriptionInformation.angle;
              response.data[i].xOffset=response.data[i].mapDescriptionInformation.xOffset;
              response.data[i].yOffset=response.data[i].mapDescriptionInformation.yOffset;
              response.data[i].isHalo=response.data[i].mapDescriptionInformation.isHalo;
              response.data[i].haloColor=response.data[i].mapDescriptionInformation.haloColor;
              response.data[i].haloSize=response.data[i].mapDescriptionInformation.haloSize;
              if(response.data[i].geometryType!= 'text'){
                response.data[i].preview=response.data[i].mapDescriptionInformation.preview;
              }
          }
            this.pageSum=response.total;
            this.tableData = response.data;
          }else{
            this.pageSum=0;
            this.tableData = [];
          }
        }else{
          this.$message({showClose: true,message: '获取数据失败'});
          this.pageSum=0;
        }
      }).catch(error=> {
        this.$message({showClose: true,message: `获取数据失败 ${error}`, type: 'error'});
        this.pageSum=0;
      });
    },
    // searchInfo(){//按条件搜索
    //   this.getMapInfoByPaging(this.currentPage,this.pageSize,"CREATE_TIME desc",this.searcherStr.trim(),4);
    // },
    // searchAllThemeticmap(){//清除搜索添加，搜索全部
    //   this.searcherStr="";
    //   this.getMapInfoByPaging(this.currentPage,this.pageSize,"CREATE_TIME desc",this.searcherStr.trim(),4);
    // },
    rowClick(row) {//选中
      this.selectRow = row;
    },
    btnOK(){//选择符号
      this.$emit('exportSymbol',this.selectRow);
    },
    handleSizeChange(val) {//每页条数改变的时候
      this.pageSize=val;
      this.getMapInfoByPaging(this.currentPage,this.pageSize,"CREATE_TIME desc",this.searcherStr,4);
    },
    handleCurrentChange(val) {//切换当前页时
      this.currentPage=val;
      this.getMapInfoByPaging(this.currentPage,this.pageSize,"CREATE_TIME desc",this.searcherStr,4);
    },
  },
  watch:{
    searcherStr :function (val) {//监视组件是否关闭，若关闭，取消组件
        if(val){
            this.getMapInfoByPaging(1,this.pageSize,"CREATE_TIME desc",val,4)
        }
    }
  },
};
</script>
<style scoped>
.mapInfoPagination {
  margin-bottom: 10px;
}
.mapInfo {
  margin: 20px;
}
.mapinfoTable {
  width: 100%;
}
.el-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}
.themeticmapClearSearch {
  cursor: pointer;
  font-weight: bold;
}
.footer{
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
