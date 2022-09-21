<!--制作专题图地图分析缓冲页-->
<template>
  <div>
    <!-- <p class="analyseTitle">缓冲区</p>  -->
    <el-form :model="bufferForm" ref="bufferForm" label-width="5px">
      <el-form-item label-width="95px" label="分析数据">
        <GeometrySelect :mapview="mapview" :visible="true" :sql="sql" :isRemoveHander="isRemoveHander" @getSelectLayer="getSelectLayer"></GeometrySelect>
      </el-form-item>
      <el-form-item label-width="95px" label="分析数据">
        <GeometryDraw :mapview="mapview" :visible="true" :graphicLayerId='sourceGraphicLayerId' @getDrawObj="getDrawObj"></GeometryDraw>
      </el-form-item>
      <!-- <el-form-item label-width="95px" label="分析图层" prop="layer" :rules="[{ required: true, message: '请选择要素图层', trigger: 'blur' }]">
        <el-select   v-model="bufferForm.layer" placeholder="请选择图层" @focus="openAddSelectDialog" @change="getBufferLayer" style="width: 100%">
          <el-option v-for="item in layerGroup"  :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label-width="95px" label="缓冲半径" prop="radius" :rules="[{ required: true, message: '请输入缓冲半径', trigger: 'blur' }]">
        <el-input-number v-model="bufferForm.radius" placeholder="请输入缓冲半径" style="width: 100%" :precision="3" controls-position="right" :min="0" :max="10000000" @focus='removeHander,removeDrawObj'></el-input-number>
      </el-form-item>
      <el-form-item label-width="95px" label="单位" prop="unit" :rules="[{ required: true, message: '请选择缓冲单位', trigger: 'blur' }]">
        <el-select v-model="bufferForm.unit" placeholder="请选择缓冲单位" @change="changeUnitValue" style="width: 100%">
          <el-option v-for="item in unitGroup"  :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label-width="95px" label="结果图层" prop="resultTitle" :rules="[{ required: true, message: '请输入结果图层名称', trigger: 'blur' }]">
        <el-input v-model="bufferForm.resultTitle" placeholder="请输入结果图层名称" maxlength="10" @focus='removeHander,removeDrawObj' style="width: 100%"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button size="medium" type="primary" @click="handleDone('bufferForm')" class="okBtn">分析</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import geometryEngine from "esri/geometry/geometryEngine";
import GeometryService from "esri/tasks/GeometryService";
import BufferParameters from "esri/tasks/support/BufferParameters";
import Graphic from "esri/Graphic";
import FeatureLayer from "esri/layers/FeatureLayer";
import searchData from "../searchData";
import myconfig from "../../mapconfig/myconfig";
import GeometrySelect from "./GeometrySelect";
import GeometryDraw from "./GeometryDraw";
let loading;
const geometryServiceUrl=myconfig.geometryService;
export default {
  components: {GeometrySelect,GeometryDraw},
  props: {
    mapview:{//地图
      type:Object,
    },
    visible:{//可见性
      type:Boolean,
    }
  },
  data() {
    return {
      bufferForm: {
        // layer: '',//选择要素图层id
        radius:1,//buffer半径
        unit :'meters',//buffer单位
        resultTitle:'缓冲区'//结果图层名称
      },
      layerGroup:[],//图层select
      bufferLayer:{},
      unitGroup:[{value:'meters',label:'米'},{value:'kilometers',label:'千米'}],//单位
      seachedFeaturesBypage:[],//通过分页获得的所有要素
      seachedFeaturesSumBypage:0,//通过分页获得的所有要素总数量
      sql:`item.type=='feature' && item.visible`,//选择叠加图层sql  && item.url!=null
      isRemoveHander:false,//移除事件
      sourceGraphicLayerId:'geometryBufferDraw',//源绘制图层id
      bs:0,
    }
  },
  methods: {
    openFullscreenLoading(){//Loading加载
      loading = this.$loading({
        lock: true,
        text: '分析中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
    init(){//初始化
      // this.bufferForm.layer='',//选择要素图层id
      this.bufferForm.radius=1,//buffer半径
      this.bufferForm.unit='meters',//buffer单位
      this.bufferForm.resultTitle='缓冲区'//结果图层名称
    },
    getSelectLayer(layer){//获取鼠标点选图层
      this.removeDrawObj()
      this.bufferLayer=layer;
      this.bufferForm.resultTitle=`${layer.title}缓冲区`;
      this.isRemoveHander=false;//移除事件
      this.bs = 0
      this.removeGraphics(this.sourceGraphicLayerId)
    },
    getDrawObj(draw){//获取鼠标绘制获取图层
      this.drawObj=draw;//空间分析绘制对象
      this.removeHander();//移除事件
      let layer=this.mapview.map.layers.find((layer)=>layer.id==this.sourceGraphicLayerId);
      this.bufferLayer=layer;
      this.bufferForm.resultTitle=`缓冲区`;
      this.bs = 1
      this.removeGraphics('geometryAnalysisLayer')
    },
    removeDrawObj(){
      if(this.drawObj){
        if(this.drawObj.complete){
          this.drawObj.complete();
        }
      }
    },
    removeHander(){
      this.isRemoveHander=true;//移除事件
    },
    removeGraphics(id){
      let graphicsLayer=this.mapview.map.layers.find((layer)=>layer.id==id)
      if(graphicsLayer && graphicsLayer.graphics){
        graphicsLayer.graphics.removeAll()
      }
    },
    changeUnitValue(){//修改单位
      this.removeHander();
      this.removeDrawObj()
      if(this.bufferForm.unit=='meters'){//改成米
        this.bufferForm.radius=this.bufferForm.radius*1000;
      }else{//改成千米
        this.bufferForm.radius=this.bufferForm.radius/1000;
      }
    },
    handleDone(formName) {//分析
      this.removeHander();
      this.removeDrawObj()
      let graphsLayer=this.mapview.map.layers.find((layer)=>layer.id=='geometryAnalysisLayer')
      this.$refs[formName].validate((valid) => {
        if(this.bs == 0){
            if (valid && this.bufferForm.radius>0 && graphsLayer && graphsLayer.graphics.length>0) {
                this.openFullscreenLoading();
                this.layerBuffer()
            } else {
              this.$message({showClose: true,message: '所添信息不符合要求',type: 'warning'});
              return false;
            }
        }else{
          if (valid && this.bufferForm.radius>0 && this.bufferLayer && this.bufferLayer.graphics.length>0) {
            this.openFullscreenLoading();
            this.drawLayerBuffer()
          } else {
            this.$message({showClose: true,message: '所添信息不符合要求',type: 'warning'});
            return false;
          }
        }
      });
    },
    showErr(err){//提示错误
      loading.close();
      this.$message({showClose: true,message: err + '无法访问缓冲服务，未能进行缓冲处理',type: 'info'});
    },
    layerBuffer(){//图层按选择buffer
      let graphsLayer=this.mapview.map.layers.find((layer)=>layer.id=='geometryAnalysisLayer')
      let layer =this.createLayer(graphsLayer.graphics,'tempFeatureLayer',this.bufferLayer.objectIdField);
      layer.spatialReference = this.bufferLayer.spatialReference;
      let wellsQuery = layer.createQuery();
      layer.queryFeatures(wellsQuery).then(this.getGeometry).catch(err =>this.showErr(err));
    },
    drawLayerBuffer(){//图层按选择buffer
      let graphsLayer=this.mapview.map.layers.find((layer)=>layer.id=='geometryAnalysisLayer')
      let layer =this.createLayer(this.bufferLayer.graphics,'tempFeatureLayer',this.bufferLayer.objectIdField);
      layer.spatialReference = this.bufferLayer.spatialReference;
      let wellsQuery =layer.createQuery();
      layer.queryFeatures(wellsQuery).then(this.getGeometry).catch(err =>this.showErr(err));
    },
    getGeometry(response){
      let wellsGeometries = response.features.map(function (feature) {
        return feature.geometry;
      });
      this.createBuffer(wellsGeometries,response.features);
    },
    createBuffer(wellPoints,features) {//buffer
      let wellBuffers=this.getWellBuffers(wellPoints);
      if(wellBuffers instanceof Array){
        if (wellPoints) {
        let  bufferGraphic = wellBuffers.map((wellBuffer,index)=>{
            let tempbufferGraphic=new Graphic({
              geometry: wellBuffer,
              attributes:features[index].attributes
            });
            return tempbufferGraphic
          })
          let layer=this.createLayer(bufferGraphic,this.bufferForm.resultTitle,this.bufferLayer.objectIdField);
          this.mapview.map.add(layer);
        }
        loading.close();
      }else if(wellBuffers instanceof Object){
        wellBuffers.then(this.createBufferByService).catch(err =>this.showErr(err));
      }else{
        loading.close();
      }
    },
    createBufferByService(wellBuffers){//创建buffer
      if(wellBuffers){
        let  bufferGraphic = wellBuffers.map((wellBuffer,index)=>{
          let tempbufferGraphic=new Graphic({
            geometry: wellBuffer,
          });
          return tempbufferGraphic
        })
        let layer=this.createLayer(bufferGraphic,this.bufferForm.resultTitle,this.bufferLayer.objectIdField);
        this.mapview.map.add(layer);
      }
      loading.close();
    },
    getWellBuffers(wellPoints){//判断buffer类型
      let wellBuffers;
      if(this.bufferLayer.spatialReference.isWebMercator||this.bufferLayer.spatialReference.wkid=='4326'){// geodesicBuffer
        try {
          wellBuffers = geometryEngine.geodesicBuffer(wellPoints,this.bufferForm.radius,this.bufferForm.unit,false);
        }catch(err){
          this.showErr(err)
        }
        return wellBuffers;
      }else if(!this.bufferLayer.spatialReference.isGeographic&&!this.bufferLayer.spatialReference.isWebMercator){//buffer
        try {
          wellBuffers = geometryEngine.buffer(wellPoints,this.bufferForm.radius,this.bufferForm.unit,false);
        }catch(err){
          this.showErr(err)
        }
        return wellBuffers;
      }else if(this.bufferLayer.spatialReference.isGeographic && this.bufferLayer.spatialReference.wkid!='4326'){//GeometryService.buffer()
        let geometryService=new GeometryService({url:geometryServiceUrl});
        let params = new BufferParameters({
          geodesic:true,
          distances: [this.bufferForm.radius],
          unit: this.bufferForm.unit,
          bufferSpatialReference:this.bufferLayer.spatialReference,
          outSpatialReference: this.mapview.spatialReference,
          geometries: wellPoints
        });
        return geometryService.buffer(params);
      }
      return wellBuffers;
    },
    createLayer(graphics,title,objectIdField) {//通过graphics创建featurelayer
      let layerTitle=title;
      if(title.length>12){
        layerTitle="缓冲分析结果"
      }
      let layer=new FeatureLayer({
        layerId:0,
        title:layerTitle,
        source: graphics,
        // objectIdField: objectIdField,
        outFields:['*'],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color:[255, 128, 0, 0.5],
            outline: {
              width: 1.5,
              color: [255, 128, 0, 1]
            },
          }
        }
      });
      if(objectIdField){
        layer.objectIdField= objectIdField
      }else{
        layer.objectIdField='FID'
      }
      layer.customBZ={source:"图层缓冲结果",count:graphics.length,data:graphics};//从文件中或者从叠加分析结果中得到的featurelayer
      return layer
    },

    /*原整个图层buffer
    // openAddSelectDialog(){//获取查询图层信息
    //   if(this.mapview.map.layers){
    //     let layers=this.mapview.map.allLayers.items.filter(function(layer){
    //         return layer.type== "feature" && layer.url!=null && layer.visible;
    //       });
    //     this.layerGroup=layers.map(function(layer) {
    //       var obj={value:layer.id,label:layer.title,layer,layer:layer};
    //       return obj;
    //     }).reverse();
    //   }
    // },
    // getBufferLayer(){//获取选取的buffer图层
    //   let id=this.bufferForm.layer;
    //   let layer=this.mapview.map.layers.find((layer)=>layer.id==id)
    //   if(layer){
    //     this.bufferLayer=layer;
    //     this.bufferForm.resultTitle=`${layer.title}缓冲区`;
    //   }
    // },  
    // layerBufferOld(){//整个图层buffer
    //   searchData.SearchFeaturelayerCount(this.bufferLayer).then(this.getAllFeatures);   
    // },  
    // getAllFeatures(count){//通过查询出所有的要素，再buffer
    //    this.seachedFeaturesSumBypage=count;
    //    if(count<=1000){
    //     let  wellsQuery =this.bufferLayer.createQuery();
    //     this.bufferLayer.queryFeatures(wellsQuery)
    //     .then(this.getGeometry).catch(this.showErr);
    //    }else{
    //       this.seachedFeaturesBypage=[];
    //       let pageCount= Math.ceil(count/1000);
    //       for (let i = 0; i < pageCount; i++) {
    //         searchData.SearchFeaturesOfPaging(this.mapview,this.bufferLayer,'1=1',['*'],i+1,1000,false).then(this.getAllFeaturesByPage);
    //       }
    //    }
    // },   
    // getAllFeaturesByPage(tempFeatures){//通过分页获取所有的要素
    //   if(tempFeatures && tempFeatures.length>0){
    //     this.seachedFeaturesBypage=this.seachedFeaturesBypage.concat(tempFeatures);
    //     if(this.seachedFeaturesBypage.length==this.seachedFeaturesSumBypage){
    //       let wellsGeometries = this.seachedFeaturesBypage.map(function (feature) {
    //         return feature.geometry;
    //       });
    //       this.createBuffer(wellsGeometries,this.seachedFeaturesBypage);
    //     }
    //   }
    // },*/
  },
  watch:{
    visible :function (val) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.init();
      }
    },
  }, 
}
</script>
<style  scoped>
  .okBtn{
    margin-right:10px;
    float:right;
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
</style>
