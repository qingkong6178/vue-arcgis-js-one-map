<!-- 标绘 -->
<template>
  <span>
    <el-popover placement="bottom" width="150" trigger="click">
      <div>
        <div :class="{buttonItem:true,disabled:sketchStartVisible}" @click="startSketch">开启标绘</div>
        <div :class="{buttonItem:true,disabled:!sketchStartVisible}" @click="handleClosePlot">关闭标绘</div>
        <div :class="{buttonItem:true,disabled:sketchSaveVisible}" @click="saveSketch(true)">保存标绘</div>
      </div>
      <el-button type="text" slot="reference" style="color:#606266">
        <i class="el-icon-arrow-down" style="margin-right: 5px"></i>标绘
      </el-button>
    </el-popover>
    <el-dialog title="请选择" append-to-body :visible.sync="plotDialog" width="25%" @open="openPlotDialog">
      <select-layer :layers="plotLayers" @handleCloseDialog="plotDialog = false" @check="checkLayer"></select-layer>
    </el-dialog>
    <ThematicmasInfoDialog :mapInfoData="myDataInfo" :titleDisabled ="true" :createInfoVisible="false" :visible="ThematicmasInfoDialogVisible" @getEditData="saveGraphicData" @handleCloseDialog="ThematicmasInfoDialogVisible=false"></ThematicmasInfoDialog>
  </span>
</template>
<script>
import GroupLayer from "esri/layers/GroupLayer";
import Sketch from "esri/widgets/Sketch"
import SelectLayer from "./selectLayer"
import ThematicmasInfoDialog from "./ThematicmasInfoDialog"
import myconfig from "../mapconfig/myconfig"
import mylayers from "../mapconfig/layers"
let loading
let createHandle
const DATA_INFO={title:"我的数据",describe:"",label:[]}
export default {
    components: {SelectLayer,ThematicmasInfoDialog},
    props: {
      mapview:{
        type:Object
      },
      myDataInfo:{
        type:Object
      },
      layerSourceType:{//1:新建；2：从我的数据导入
        type:Number,
        default: 1
      }
    },
    data() {
      return {
        plotDialog: false,//选择标绘图层dialog可见性
        plotLayers: [],//标绘图层组
        sketch: null,
        ThematicmasInfoDialogVisible:false,//保存标绘图层窗口可见性
        sketchStartVisible:false,
        sketchSaveVisible: true,
        selectId: null,//保存数据的id
        sketchLayerIds:[],//标绘图层组
        isDeleteSkeych:true //删除工具
      }
    },
    methods: {
      openFullscreenLoading(){//Loading加载
        loading = this.$loading({
          lock: true,
          text: '加载中',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      },
      startSketch(){//开启标绘
        this.plotDialog=true
      },
      handleClosePlot(){//关闭标绘
        let layer= this.sketch.layer
        this.$confirm('您想要保存当前的编辑吗?', '提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
            this.saveSketch(true)
          }).catch(action => {
            if( action === 'cancel'){
              this.cancleSkeych()
            }
        })
       
      },
      cancleSkeych(){
        let item = this.sketchLayerIds.find(item => item.layerId === this.sketch.layer.id)
        let id = item && item.dataId ? item.dataId :this.selectId
        this.isDeleteSkeych = true
        let layer = this.sketch.layer
        layer.graphics.removeAll()
        this.removeSketch()
        // this.$axiosWithToken.get("/thematicMapInfomation/getThematicMapInfomationById/?id="+ id).then(response => {
        //   if (response.code == 200 && response.data && item.dataId) {
        //     let data = JSON.parse(response.data.mapDescriptionInformation)
        //     layer.graphics.removeAll()
        //     mylayers.addlayerGraphics(data.mapLayers.layers.children,layer)
        //   }else{
        //     layer.graphics.removeAll()
        //   }
        //   this.removeSketch()
        // }).catch(err=>{
        //   this.$message({showClose: true,message: `操作失败 ${error}`, type: 'error'});
        //   this.removeSketch()
        // })
      },
      saveSketch(isDelete){//保存标绘
        this.isDeleteSkeych = isDelete
        this.getPlotLayers()
        this.removeSketch()
        // if( this.plotLayers && this.plotLayers.length >1){
        //   let obj = this.sketchLayerIds.find(item => item.layerId === this.sketch.layer.id )
        //   if(obj){
        //     this.myDataInfo = obj.myDataInfo
        //   }
        //   this.ThematicmasInfoDialogVisible=true
        // }else{
        //   this.$message({message: '当前地图中未发现标绘图层，请先创建标绘图层', showClose: true, type: 'warning'});
        // }
      },
      openPlotDialog(){//选择标绘图层
        this.getPlotLayers()
      },
      getPlotLayers(){
       if(this.mapview.map.layers){//获取查询图层信息
          this.plotLayers=this.mapview.map.allLayers.items.filter(layer=>layer.type== "graphics" && layer.id.includes("myplotting"))
          this.plotLayers.push({id:-1,title:'新建标绘图层'})
        }
      },
      checkLayer(layerId){
        if(layerId == -1){
          this.$emit("addLayers",'plot')
          this.plotDialog = false
        }else{
          this.sketchPlotLayer(layerId)
        }
      },
      sketchPlotLayer(layerId){//获取标绘工具
        this.plotDialog = false
        this.sketchStartVisible = true
        this.sketchSaveVisible = false
        let layer=this.mapview.map.findLayerById(layerId)
        this.sketch = new Sketch({
          layer: layer,
          view: this.mapview,
          creationMode: myconfig.widgetOnScreen.sketch.creationMode
        })
        if(layer.renderer){
          this.sketch.viewModel.pointSymbol = {
            type: "simple-marker",
            style: layer.renderer.pointSymbol.symbolStyle,
            size: layer.renderer.pointSymbol.pointSize,
            color: layer.renderer.pointSymbol.symbolColor,
            outline: {
                color: layer.renderer.pointSymbol.outlineColor,
                width: layer.renderer.pointSymbol.outlineWidth
            }
          }
          this.sketch.viewModel.polylineSymbol = {
            type: "simple-line",
            color: layer.renderer.polylineSymbol.outlineColor,
            width: layer.renderer.polylineSymbol.outlineWidth,
            style: layer.renderer.polylineSymbol.lineStyle
          }
          this.sketch.viewModel.polygonSymbol = {
            type: "simple-fill",
            style: layer.renderer.polygonSymbol.symbolStyle,
            color: layer.renderer.polygonSymbol.symbolColor,
            outline: {
                color: layer.renderer.polygonSymbol.outlineColor,
                width: layer.renderer.polygonSymbol.outlineWidth,
                style: layer.renderer.polygonSymbol.lineStyle
            }
          }
        }
        this.setGraphicSymbol()
        this.mapview.ui.add(this.sketch, myconfig.widgetOnScreen.sketch.position)
        this.$emit('getEditDisable',false)
        let obj = this.sketchLayerIds.find(item => item.layerId === layer.id )
        if(!obj){
          let item = {layerId:layer.id,dataId: null,myDataInfo:{title: layer.title.trim() && layer.title.trim()!='' ? layer.title : '我的数据',describe:"",label:[]}}
          if(layer.customBZ && layer.customBZ.dataId){
            item.dataId = layer.customBZ.dataId
            item.myDataInfo = layer.customBZ.myDataInfo
          }
          this.sketchLayerIds.push(item)
        }
      },
      setGraphicSymbol(){
        let layer = this.sketch.layer
        createHandle = this.sketch.on("create", (event)=> {
          if (event.state === "start" || event.state === "complete" ) {
            if(layer.renderer){
                this.sketch.viewModel.pointSymbol = {
                  type: "simple-marker",
                  style: layer.renderer.pointSymbol.symbolStyle,
                  size: layer.renderer.pointSymbol.pointSize,
                  color: layer.renderer.pointSymbol.symbolColor,
                  outline: {
                      color: layer.renderer.pointSymbol.outlineColor,
                      width: layer.renderer.pointSymbol.outlineWidth
                  }
                }
                this.sketch.viewModel.polylineSymbol = {
                  type: "simple-line",
                  color: layer.renderer.polylineSymbol.outlineColor,
                  width: layer.renderer.polylineSymbol.outlineWidth,
                  style: layer.renderer.polylineSymbol.lineStyle
                }
                this.sketch.viewModel.polygonSymbol = {
                  type: "simple-fill",
                  style: layer.renderer.polygonSymbol.symbolStyle,
                  color: layer.renderer.polygonSymbol.symbolColor,
                  outline: {
                      color: layer.renderer.polygonSymbol.outlineColor,
                      width: layer.renderer.polygonSymbol.outlineWidth,
                      style: layer.renderer.polygonSymbol.lineStyle
                  }
                }
                // event.graphic.symbol = this.sketch.viewModel[ `${event.graphic.geometry.type}Symbol`]
            }
            if(event.state === "complete") {
                event.graphic.attributes = {"OBJECTID" : new Date().getTime()}
            }
          }
        })
      },
      removeSketch(){
        if(createHandle){
            createHandle.remove()
            createHandle = null
        }
        if(this.isDeleteSkeych){
          if(this.sketch){
            this.mapview.ui.remove(this.sketch)
            this.sketch.destroy()
          }
          this.sketchStartVisible = false
          this.sketchSaveVisible = true
          this.$emit('getEditDisable',true)
        }
      },
      saveGraphicData(data){
        let item = this.sketchLayerIds.find(item => item.layerId === this.sketch.layer.id)
        let id = item && item.dataId ? item.dataId :this.selectId
        this.$axiosWithToken.get("/thematicMapInfomation/getThematicMapInfomationById/?id="+ id).then(response => {
          if (response.code == 200 && response.data && item.dataId) {
            this.selectId = id
            this.modifyMyGraphicData(data)
          }else {
            this.saveMyGraphicData(data)
          }
        })
      },
      saveMyGraphicData(data){//保存标绘图层
          this.openFullscreenLoading()
          this.mapview.takeScreenshot().then((screenshot) => {
              let thumbnailStr = this.showPreview(screenshot);
              let body = {title:data.title.trim()==""?"我的数据":data.title,describe:data.describe,label:JSON.stringify(data.label),thumbnailStr:thumbnailStr,mapDescriptionInformation:this.getMapInfomation(null),type:6};
              this.$axiosWithToken.post("/thematicMapInfomation/addThematicMapInfomation/", body).then(response => {
                if(response.code==200){
                  this.selectId = response.data.id
                  this.setMyDataInfo(data, this.selectId)
                  this.$emit("getDataId",this.selectId)
                  this.$message({message: '保存成功,可以到我的数据中查看', showClose: true,type: 'success'});
                  let body2 = {id:this.selectId,mapDescriptionInformation:this.getMapInfomation(this.selectId),type:6}
                  this.$axiosWithToken.put("/thematicMapInfomation/updateThematicMapInfomation/", body2)
                }else{
                  this.$message({showClose: true,message: '保存失败'});
                }
                loading.close();
                this.removeSketch()
              }).catch(error=> {
                this.$message({showClose: true,message: `保存失败 ${error}`, type: 'error'});
                loading.close();
              });
        }).catch(error=> {
          this.$message({showClose: true,message: `保存失败 ${error}`, type: 'error'});
          loading.close();
        });
      },
      modifyMyGraphicData(data){//修改标绘图层
        this.openFullscreenLoading()
        this.mapview.takeScreenshot().then((screenshot) => {
          let thumbnailStr = this.showPreview(screenshot);
          let body = {id:this.selectId,title:data.title.trim()==""?"我的数据":data.title,describe:data.describe,label:JSON.stringify(data.label),thumbnailStr:thumbnailStr,mapDescriptionInformation:this.getMapInfomation(this.selectId),type:6}
          this.setMyDataInfo(data, null)
          this.$axiosWithToken.put("/thematicMapInfomation/updateThematicMapInfomation/", body).then(response => {
            if(response.code==200){
              this.$message({showClose: true,type: 'success',message: '保存成功,可以到我的数据中查看'});
            }else{
              this.$message({showClose: true,message: `保存失败`,type: 'error'});
            }
            loading.close();
            this.removeSketch()
          }).catch(error=> {
            this.$message({showClose: true,message: `保存失败`, type: 'error'});
            loading.close();
          });
        }).catch(error=> {
          this.$message({showClose: true,message: `保存失败`, type: 'error'});
          loading.close();
        });
      },
      setMyDataInfo(data,id){
        let obj = this.sketchLayerIds.find(item => item.layerId === this.sketch.layer.id )
        if(obj){
          if(id){
            obj.dataId = id
          }
          obj.myDataInfo.title = data.title.trim()==""?"我的数据":data.title
          obj.myDataInfo.describe = data.describe
          obj.myDataInfo.label = data.label
        }
      },
      showPreview(screenshot) {//打印预览
          let canvas = document.createElement("canvas");
          let cxt = canvas.getContext("2d");
          canvas.width = screenshot.data.width;
          canvas.height = screenshot.data.height;
          cxt.fillStyle = "#fff";
          cxt.fillRect(0,0,canvas.width,canvas.height);//绘制背景色
          cxt.putImageData(screenshot.data, 0, 0);//绘制地图 
          return canvas.toDataURL();
      },
      getMapInfomation(dataId){//获取地图信息
        let mapInfoObj={};
        try{
          if(dataId){
            mapInfoObj.dataId = dataId
          }
          mapInfoObj.spatialReference=this.mapview.spatialReference.wkid;//坐标系统
          mapInfoObj.center=this.mapview.center;//记录中心点
          mapInfoObj.zoom=this.mapview.zoom;//记录缩放等级
          mapInfoObj.mapLayers={layers:this.getLayers(this.mapview.map.layers)};
        }catch(err){
          console.log(err)
        }
        let mapInfomation=JSON.stringify(mapInfoObj);
        return mapInfomation;
      },
      getLayers(layers){//获取layers
        let objectResult={children:[]};
        for(let i = 0; i< layers.items.length; i++){
          let layer=layers.items[i];
          if(layer instanceof GroupLayer){
            let groupLayerResult = this.getLayers(layer.layers);
            let obj={id:layer.id,title:layer.title,type:layer.type,opacity:layer.opacity};
            obj.children=groupLayerResult;
            objectResult.children.push(obj);
          }else if(layer.type=="graphics" && layer.id == this.sketch.layer.id){
            let obj={id:layer.id,title:layer.title,url:layer.url?layer.url:"",type:layer.type,opacity:layer.opacity,visible:layer.visible}
            obj.graphics = JSON.stringify(mylayers.getGraphicsJson(layer.graphics.items))
            if(layer.fields){
              obj.fields = JSON.stringify(layer.fields)
            }
            if(layer.objectIdField){
              obj.objectIdField = layer.objectIdField
            }
            if(layer.renderer){
              obj.renderer = layer.renderer
            }
            objectResult.children.push(obj);
          }
        }
        return objectResult
      }
    },
}
</script>
<style scoped>
  .buttonItem {
    cursor: pointer;
    padding: 10px 0;
  }
  .buttonItem:hover {
    background: #F5F5F5;
  }
  .disabled {
      pointer-events: none;
      cursor: default;
      color: gray;
  }
</style>
