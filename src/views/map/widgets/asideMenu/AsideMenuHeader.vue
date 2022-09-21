<!--制作专题图侧边栏头部 -->  
<template>  
    <div>
      <div class="asideMenuHeader">
        <div >
          <div class="asideMenuHeaderTitle titlelabel">{{title}}</div>         
        </div>
        <span class="asideMenuHeaderBtn" >
          <template v-for="(menu,index) in layerMenubtn">
              <span :key="index" class="layerMenubtn" @click="clickLayerMenubtn(menu.name)">
                  <el-tooltip :content="menu.alt" placement="bottom">
                  <i class="iconfont icon pickUp"  v-html="menu.icon"></i>
                  </el-tooltip>
              </span>
          </template>
        </span>
      </div> 
      <slot name="mapTools"></slot>      
    </div>
    
</template>
<script>
var loading;
import GroupLayer from "esri/layers/GroupLayer";
export default {  
  props: {
    layerMenubtn:{//菜单头部按钮
      type:Array,
    },
    title:{//菜单标题
      type:String,
      default:"无标题"
    },
    mapDescribe:{//描述
      type:String,
    },
    mapTags:{//标签
      type:Array,
    },
    mapview:{//地图
      type:Object,
    },
    id:{//判断是修改还是新增
      type:Number,
    }
  },
  data () {
    return {
      // mapInfomation:"",
    }
  },
  methods: {
    clickLayerMenubtn(name){//点击菜单图层上的按钮
      if(name=="saveMackedLayer"){// 
        this.openFullscreenLoading();       
        this.saveMakedMapInfo(this.saveMapInfo,this.showPreview);//保存专题图信息           
      }else if(name=="pickupMenu"){//折叠菜单
        this.$emit("pickUpAsideMenu","50px",false);//改变侧边栏宽度   
      }else if(name=='return'){//返回上一菜单
        this.$router.back(-1);
      }
    },
    saveMakedMapInfo(callback,previewCallback){//保存专题图信息      
      this.mapview.takeScreenshot().then(function(screenshot){
        let src =previewCallback(screenshot);// screenshot.dataUrl;
        callback(src);
      });
    },   
    showPreview(screenshot) {//打印预览
        let canvas = document.createElement("canvas");
        let cxt = canvas.getContext("2d");
        canvas.width = screenshot.data.width;
        canvas.height = screenshot.data.height;   
        this.drawFillFrame(cxt,0,0,canvas.width,canvas.height,"#fff");//绘制背景色
        cxt.putImageData(screenshot.data, 0, 0);//绘制地图 
        return canvas.toDataURL();
    },
    drawFillFrame(context,x,y,width,height,color){//绘制背景色
      context.fillStyle = color;
      context.fillRect(x,y,width,height);
    },
    saveMapInfo(thumbnailStr){    
      if(this.id){
        this.updateMapInfo(thumbnailStr);
      }else{
        this.saveNewMapInfo(thumbnailStr);
      }
    },
    saveNewMapInfo(thumbnailStr){//新建保存  
      let body = {title:this.title==""?"无标题":this.title,describe:this.mapDescribe,label:JSON.stringify(this.mapTags),thumbnailStr:thumbnailStr,mapDescriptionInformation:this.getMapInfomation(),type:1};
      this.$axiosWithToken.post("/thematicMapInfomation/addThematicMapInfomation/", body)
      .then(response => {       
        if(response.code==200){
          this.$message({message: '添加成功', showClose: true,type: 'success'});
          this.$router.back(-1); 
        }else{
          this.$message({showClose: true,message: '添加失败'});
        }
        loading.close();
      })
      .catch(error=> {
        this.$message({showClose: true,message: '添加失败'});
        loading.close();
      });
    },
    updateMapInfo(thumbnailStr){//修改已有的
      let body = {id:this.id,title:this.title.trim()==""?"无标题":this.title,describe:this.mapDescribe,label:JSON.stringify(this.mapTags),thumbnailStr:thumbnailStr,mapDescriptionInformation:this.getMapInfomation(),type:1};
      this.$axiosWithToken.put("/thematicMapInfomation/updateThematicMapInfomation/", body)
      .then(response => {       
        if(response.code==200){
          this.$message({message: '修改成功', showClose: true,type: 'success'});
          this.$router.back(-1); 
        }else{
          this.$message({showClose: true,message: '修改失败'});
        }
        loading.close();
      })
      .catch(error=> {
        this.$message({showClose: true,message: '修改失败'});
        loading.close();
      });
    },
    getMapInfomation(){//获取地图信息
      let mapInfoObj={};
      try{
        mapInfoObj.spatialReference=this.mapview.spatialReference.wkid;//坐标系统
        mapInfoObj.center=this.mapview.center;//记录中心点
        mapInfoObj.zoom=this.mapview.zoom;//记录缩放等级        
        mapInfoObj.baseMapLayers={layers:this.getLayers(this.mapview.map.basemap.baseLayers)};
        mapInfoObj.mapLayers={layers:this.getLayers(this.mapview.map.layers)};
        mapInfoObj.groundLayers={layers:this.getLayers(this.mapview.map.ground.layers)};    
       ;   
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
          let obj={title:layer.title,type:layer.type,opacity:layer.opacity};
          obj.children=groupLayerResult;       
          objectResult.children.push(obj);
        }else{
          let obj={title:layer.title,url:layer.url?layer.url:"",type:layer.type,opacity:layer.opacity};
          if(layer.type=="feature"){
            if(!layer.url){
              obj["source"]=layer.source;
            }else{
              obj.url=`${obj.url}/${layer.layerId}`;
            }
            if(layer.labelingInfo){
              obj.labelingInfo=layer.labelingInfo;
              obj.labelingInfoSymbol=layer.labelingInfo[0].symbol;
            }
            if(layer.customBZ){
              obj.customBZ=layer.customBZ;
            }
            obj["renderer"]=layer.renderer;
            obj["geometryType"]=layer.geometryType;
            obj["fields"]=layer.fields;
          }else if(layer.type=="graphics"){
            obj["graphics"]=layer.graphics;
          }
          objectResult.children.push(obj);
        }
      }
      return objectResult
    }, 
    openFullscreenLoading(){//Loading加载
      loading = this.$loading({
      lock: true,
      text: '请等待',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
      });
    },  
  }, 
}
</script>
<style  scoped> 
  .asideMenuHeader{
    margin-top:10px;
    display: flex;
    justify-content: space-between;
  }
  .asideMenuHeaderBtn{    
    display: flex;
    justify-content: flex-end;
  }
  .layerMenubtn{
    padding: 5px; 
    cursor: pointer;  
  }   
  .asideMenuHeaderTitle{
    margin-right:5px;
    margin-left:5px;
  }
  .titlelabel{
    font-family: sans-serif;
    font-size: 16px; 
    height:40px;
    display: flex;
    align-items: center;
    margin-left:10px
  }
  .pickUp{
      font-size: 20px;
      /* color:rgb(177,177,177); */
  }
</style>
