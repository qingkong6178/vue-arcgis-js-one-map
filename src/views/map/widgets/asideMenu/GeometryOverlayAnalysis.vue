<!--制作专题图地图分析叠加分析页-->
<template>
  <div>
    <!-- <p  class="analyseTitle">叠加分析</p> -->
    <el-form :model="analyseForm" ref="analyseForm" label-width="5px">
      <el-form-item label-width="95px" label="选择源数据" prop="layer" :rules="[{ required: true, message: '请选择要素图层', trigger: 'blur' }]">
        <GeometrySelect :mapview="mapview" :visible="true" :sql="sql" :isRemoveHander="isRemoveHander" @getSelectLayer="getSelectLayer"></GeometrySelect>       
      </el-form-item>
      <el-form-item label-width="95px" label="分析数据" :rules="[{ required: true, message: '请绘制分析区域', trigger: 'blur' }]">
        <GeometryDraw :mapview="mapview" :visible="true" :graphicLayerId='sourceGraphicLayerId' @getDrawObj="getDrawObj"></GeometryDraw>
      </el-form-item>      
      <el-form-item label-width="95px" label="结果图层" prop="resultTitle" :rules="[{ required: true, message: '请输入结果图层名称', trigger: 'blur' }]">
        <el-input v-model="analyseForm.resultTitle" placeholder="请输入结果图层名称" @focus='removeHander' maxlength="10" style="width: 100%"></el-input>
      </el-form-item>    
      <el-form-item label-width="95px" label="叠加方式" prop="type" :rules="[{ required: true, message: '请选择分析方式', trigger: 'blur' }]">
        <el-card :body-style="{ padding: '10px' }" class="intersect_type">
          <template v-for="(widget,index) in widgets">
            <span  @click="displayWidget(widget.name)" :key="index">
              <el-tooltip :content="widget.alt" placement="bottom">
              <i class="iconfont icon" :class="{'icon_active':widget.display}" v-html="widget.icon" style="font-size:28px;margin:0px 10px 0px 10px"></i>
              </el-tooltip>
            </span>
          </template>
        </el-card>
      </el-form-item>
      <el-form-item>
        <el-button size="medium" type="primary" @click="handleDone('analyseForm')" class="okBtn">分析</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import geometryEngine from "esri/geometry/geometryEngine";
import GeometrySelect from "./GeometrySelect";
import GeometryDraw from "./GeometryDraw";
import Graphic from "esri/Graphic";
import FeatureLayer from "esri/layers/FeatureLayer";
var loading;
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
      analyseForm: {
        layer: '',//选择要素图层id
        resultTitle:'叠加分析',//结果图层名称
        type: 'difference'
      },
      layerGroup:[],//图层select 
      sourceGraphicLayerId:'geometryDraw',//源绘制图层id
      drawObj:{},//空间分析绘制对象
      sourceGraphicLayer:{},//源绘制图层
      selectGraphicLayer:{},//分析graphic图层
      selectLayer:{},//选择的分析图形
      widgets:[
        {name: 'difference', icon: '&#xe64b;', display: true, alt: '裁剪（通过绘制区域形成的最小envelope）'},
        {name: 'intersect', icon: '&#xe682;', display: false, alt: '相交'},
        {name: 'union', icon: '&#xe6d4;', display: false, alt: '合并'},
      ],
      sql:`item.type=="feature"&& item.visible==true&&item.geometryType=="polygon"`,//选择叠加图层sql
      isRemoveHander:false,//移除事件
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
      this.analyseForm.layer='',//选择要素图层id
      this.analyseForm.resultTitle='叠加分析'//结果图层名称
    },
    getDrawObj(draw){//获取鼠标绘制获取图层
      this.drawObj=draw;//空间分析绘制对象
      this.removeHander();//移除事件
    },
    getSelectLayer(layer){//获取鼠标点选图层
      if(this.drawObj.complete){
        this.drawObj.complete();
      }
      this.selectLayer=layer;
      this.analyseForm.layer=layer.id;
      this.analyseForm.resultTitle=`${layer.title}叠加分析`;
      this.isRemoveHander=false;//移除事件
    },
    displayWidget(name) {
      this.removeHander();
      for (let i = 0; i < this.widgets.length; i++) {
        if(this.widgets[i].name==name){
          this.widgets[i].display =true;
          this.analyseForm.type=this.widgets[i].name;
        }else{
          this.widgets[i].display =false;
        }
      }
    },
    removeHander(){
      this.isRemoveHander=true;//移除事件
    },  
    handleDone(formName) {//分析
      this.removeHander();
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.beginAnalyse();
        } else {
          this.$message({showClose: true,message: '所添信息不符合要求',type: 'info'});
          return false;
        }
      });
    },
    showErr(){//提示错误
      loading.close();
      this.$message({showClose: true,message: '分析出现错误，未能进行叠加分析处理',type: 'info'});
    },
    beginAnalyse(){//开始分析
      let layerid=this.sourceGraphicLayerId;
      this.sourceGraphicLayer=this.mapview.map.layers.find((layer)=>layer.id==layerid);
      this.selectGraphicLayer=this.mapview.map.layers.find((layer)=>layer.id=='geometryAnalysisLayer');
      this.doAnalyse();
    },
    doAnalyse(){//裁剪限制条件
      if(!this.sourceGraphicLayer||this.sourceGraphicLayer.graphics.length!=1){
        this.$message({showClose: true,message: '所绘制要素不符合要求，请绘制一个要素',type: 'info'});
      }else if(!this.selectGraphicLayer||this.selectGraphicLayer.graphics.length<1){
       this.$message({showClose: true,message: '所选图层要素不符合要求，请至少选择一个要素',type: 'info'});
      }else{
        this.openFullscreenLoading()
        let inputGeometrys=this.selectGraphicLayer.graphics.items.map((item)=>{return item.geometry});
        this.doDifference(inputGeometrys,this.sourceGraphicLayer.graphics.items[0].geometry);
        this.removeAllGraphic();
        loading.close();
      }
    },
    doDifference(geometrys,geometry){//裁剪
      let GeometryArr;
      let title='结果';
      try {
        if(this.analyseForm.type=="difference"){//裁剪
           GeometryArr=geometryEngine.difference(geometrys,geometry);
           title=`裁剪${title}`;
        }else if(this.analyseForm.type=="intersect"){//相交
           GeometryArr=geometryEngine.intersect(geometrys,geometry);
           title=`相交${title}`;
        }else{//union合并
          geometrys.push(geometry);
          let tempGeometry=geometryEngine.union(geometrys);
          title=`合并${title}`;
          GeometryArr=[tempGeometry];
        }
        let graphics=this.createGraphic(GeometryArr);
        let layer=this.createLayerFromGrphics(title,graphics,this.analyseForm.resultTitle,this.selectLayer.objectIdField);
        this.mapview.map.add(layer);
      }catch(err){
        this.showErr()
      }
    },    
    createGraphic(inputGraphics){//通过geometry创建graphics
      let outputGraphics = inputGraphics.map((wellBuffer,index)=>{
        let tempbufferGraphic=new Graphic({
          geometry: wellBuffer,
        });
        return tempbufferGraphic
      })
      return outputGraphics
    },     
    createLayerFromGrphics(diecribe,graphics,title,objectIdField) {//通过graphics创建featurelayer
      let layerTitle=title;
      if(title.length>12){
        layerTitle="叠加分析结果"
      }
      let layer=new FeatureLayer({
        layerId:0,
        title:layerTitle,
        source: graphics,
        objectIdField: objectIdField,
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
      layer.customBZ={source:diecribe,count:graphics.length,data:graphics};//从文件中或者从叠加分析结果中得到的featurelayer
      return layer
    },
    removeAllGraphic(){
      this.mapview.graphics.removeAll();
      if(this.sourceGraphicLayer.graphics){
        this.sourceGraphicLayer.graphics.removeAll();
      }
      if(this.selectGraphicLayer.graphics){
        this.selectGraphicLayer.graphics.removeAll();
      }
      this.mapview.map.removeMany([this.sourceGraphicLayer,this.selectGraphicLayer]);
    }
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
  .intersect_type {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon_active {
    color: rgb(26, 11, 238);
  }
  /* .analyseTitle{
    margin-left:5px;
    margin-bottom:5px;
  } */
</style>
