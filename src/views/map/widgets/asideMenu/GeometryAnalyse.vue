<!--制作专题图侧边栏分析页 -->
<template>
  <div >
    <div v-show="!analysePageVisible">
      <el-tree
        :data="analyseData"
        node-key="id"
        @node-click="handleNodeClick"
        default-expand-all>
          <span slot-scope="{ node, data }" class="map-analyse-tree-node">
            <span>
              <i class="iconfont icon" v-html="data.icon" style="font-size:20px; color:rgb(0,118,221);"></i>
              &nbsp;{{ node.label }}
            </span>
            <el-popover
              v-if="node.data.id!='0'"
              placement="right"
              :title="data.title"
              width="200"
              trigger="click"
              :content=data.content>
              <i slot="reference" class="el-icon-info analyse-info" @click="(e)=>e.stopPropagation()"></i>
            </el-popover>
          </span>
      </el-tree>
    </div>
    <div v-show="analysePageVisible" class="close" @click="analysePageVisible=false"><i class="el-icon-close closeBtnFont"></i>
    </div>
    <div v-show="analysePageVisible">
      <div class="analyse">
        <GeometryBuffer v-show="analyseData[0].children[0].visible" :mapview="mapview" :visible="analyseData[0].children[0].visible"></GeometryBuffer>
        <!-- <GeometryContourLine v-show="analyseData[0].children[1].visible" :mapview="mapview" :visible="analyseData[0].children[1].visible"></GeometryContourLine>
        <GeometryIsosurface v-show="analyseData[0].children[2].visible" :mapview="mapview" :visible="analyseData[0].children[2].visible"></GeometryIsosurface> -->
        <GeometryOverlayAnalysis v-show="analyseData[0].children[1].visible" :mapview="mapview" :visible="analyseData[0].children[1].visible"></GeometryOverlayAnalysis>
        <!-- <GeometryTysonpolygon v-show="analyseData[0].children[4].visible" :mapview="mapview" :visible="analyseData[0].children[4].visible"></GeometryTysonpolygon>
        <GeometryWeightedInterpolation v-show="analyseData[0].children[5].visible" :mapview="mapview" :visible="analyseData[0].children[5].visible"></GeometryWeightedInterpolation> -->
      </div>
    </div>
  </div>
</template>
<script>
import GeometryBuffer from "./GeometryBuffer"
import GeometryOverlayAnalysis from "./GeometryOverlayAnalysis"
// import GeometryContourLine from "./GeometryContourLine"
// import GeometryIsosurface from "./GeometryIsosurface"
// import GeometryTysonpolygon from "./GeometryTysonpolygon"
// import GeometryWeightedInterpolation from "./GeometryWeightedInterpolation"

export default {
  components: {GeometryBuffer,GeometryOverlayAnalysis},
  props: {
    mapview:{//地图
      type:Object,
    },
  },
  data() {
    return {
      analysePageVisible:false,//分析树页可见性
      groupAddForm: {//选择要素图层id
        layer: '',
      },
      layerGroup:[],//图层select
      analyseData : [{
        id:0,
        label: '地图分析',
        title:'分析',
        content:'地图分析',
        icon:'&#xe64b;',
        visible:false,
        children: [{
            id: 1,
            label: '缓冲区',
            title:'缓冲区',
            content:'指定距离创建周边区域',
            icon:'&#xeb3e;',
            visible:false,
          },
          // {
          //   id: 2,
          //   label: '等值线',
          //   title:'等值线',
          //   content:'提取离散值生成曲线',
          //   icon:'&#xe6cd;',
          //   visible:false,
          // },{
          //   id: 3,
          //   label: '等值面',
          //   title:'等值面',
          //   content:'提取离散值生成面对象',
          //   icon:'&#xe6c7;',
          //   visible:false,
          // },
          {
            id: 2,
            label: '叠加分析',
            title:'叠加分析',
            content:'图层间空间几何运算',
            icon:'&#xe68e;',
            visible:false,
          },
          // {
          //   id: 5,
          //   label: '泰森多边形',
          //   title:'泰森多边形',
          //   content:'离散点生成连续多边形',
          //   icon:'&#xeb8f;',
          //   visible:false,
          // }, {
          //   id: 6,
          //   label: '反距离加权插值',
          //   title:'反距离加权插值',
          //   content:'通过已知点推求任意点值',
          //   icon:'&#xe648;',
          //   visible:false,
          // }
          ],
      }],
    }
  },
  methods: {
    handleNodeClick(data){//树节点点选，进行分析页
      if(data.id!=0){
        this.analysePageVisible=true;
        this.analyseData[0].children.map((item,index)=>{
          if(data.id==index+1){
            item.visible=true;
          }else{
            item.visible=false;
          }
          return true
        })
      }

    },
    openAddSelectDialog(){
      if(this.mapview.map.layers){//获取查询图层信息
        let layers=this.mapview.map.allLayers.items.filter(function(layer){
            return layer.type== "feature" && layer.url!=null && layer.visible;//|| layer.type== "map-image";
          });
        this.layerGroup=layers.map(function(layer) {
          var obj={value:layer.id,label:layer.title,layer,layer:layer};
          return obj;
        }).reverse();
      }
    },
  },
}
</script>
<style scoped>
  .map-analyse-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .analyse-info{
    color:rgb(107,180,227);
  }
  .close{
    display: flex;
    justify-content: flex-end;
  }
  .closeBtnFont{
    font-size:16px;
    color:rgb(0,118,221);
    cursor:pointer;
    margin-bottom:10px;
  }
  .analyse{
    margin-right: 5px;
  }
</style>
