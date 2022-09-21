<!--书签插件 -->
<template>
  <div class="bookmarks"  id="bookmarks">
    <template v-for="(bookmark,index) in mapBookmarksObj.mapbookmarks">
        <div   :key="index" class="bookmarkItem">
          <div @click="locateBookmark(bookmark.position,bookmark.scale)" class="nameBox">
            <i class="esri-icon-map-pin locateStar"/>
            {{bookmark.name}}
          </div>
          <div class="editBox"  title="编辑">
            <el-popover
              placement="bottom"
              width="200"
              v-model="bookmark.editPopver"
              >
              <div>标签名</div>
              <el-input v-model="bookmark.tempname" placeholder="请输入标签名"></el-input>
              <el-button type="text" size="mini" @click="savePopverEdit(bookmark.id,'delete')">删除</el-button>
              <span class="keepRight">
                <el-button type="text" size="mini" @click="savePopverEdit(bookmark.id,'cancle')">取消</el-button>
                <el-button type="primary" size="mini"  @click="savePopverEdit(bookmark.id,'save')">保存</el-button>
              </span>
              <el-button type="text" slot="reference" icon="el-icon-edit"></el-button>
            </el-popover>
          </div>
        </div>
    </template>
    <div class="addBookmark" @click="addBookmarkPoint"><i class="el-icon-add-location"></i> 添加书签</div>
    <div class="addBookmark" @click="removeBookmarkPoint"><i class="el-icon-delete"></i> 删除所有书签</div>
  </div>
</template>
<script>
import Expand from "esri/widgets/Expand"; //expand可以将插件收起来
import Draw from "esri/views/draw/Draw";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from "esri/Graphic";
import myconfig from "../mapconfig/myconfig";
export default {
  props: {
    mapview:{
      type:Object,
    },
     widgetShow:{//组件显隐状态
      type: Boolean,
    },
  },
  data () {
    return {
     bookMarkGraphsLayer:{},
     draw:{},
     bookmarks:{},
     bkExpand:{},
     mapBookmarksObj:{},
     position: myconfig.widgetOnScreen.bookmarks.position,
     visible: myconfig.widgetOnScreen.bookmarks.visible,
    }
  },
  methods: {
    setWidgetVisible(btnid,visible){//控制书签组件显隐
      if(this.mapview.ui.find(this.bkExpand)){
        this.mapview.ui.remove(this.bkExpand);
      }
      if(visible){
        this.bkExpand.expanded=true
        this.mapview.ui.add(this.bkExpand,this.position);
        this.createBookmarks();
      }else{
        this.mapview.graphics.removeAll();
      }
    },
    locateBookmark(point,scale){//定位书签
      let graphic=this.createGrahic(point);
      this.mapview.goTo({target: graphic,scale:scale}).catch(function(error) {
        if (error.name != "AbortError") {
          console.error(error);
      }});
    },
    savePopverEdit(id,edit){//编辑书签
      let obj=this.mapBookmarksObj.mapbookmarks.find((obj)=>obj.id==id);
      let index=this.mapBookmarksObj.mapbookmarks.findIndex((obj)=>obj.id==id);
      if(obj){
        obj.editPopver=false;
        if(edit=="save"){
          this.saveBookmarkName(obj);
        }
        else if(edit=="cancle"){
          this.cancleBookmarkName(obj);
        }else if(edit=="delete"){
          this.deleteBookmark(index);
        }
      };
    },
    saveBookmarkName(obj){//保存书签名
      obj.name=obj.tempname;
      this.setLocalStorage();
    },
    cancleBookmarkName(obj){//取消修改书签
      obj.tempname=obj.name;
    },
    deleteBookmark(index){//删除书签
      this.mapBookmarksObj.mapbookmarks.splice(index, 1);
      this.setLocalStorage();
    },
    addBookmarkPoint(){//添加书签
      this.saveDrawBookmark([this.mapview.center.x,this.mapview.center.y]);
      this.createBookmarks();
    },
    createBookmarks(){
      this.mapview.graphics.removeAll();
      let that=this;
      let graphics= this.mapBookmarksObj.mapbookmarks.map((item)=>{
        return  that.createGrahic(item.position);
      })
      this.mapview.graphics.addMany(graphics);
    },
    createPointGraphicTomap(coordinates){//鼠标移动时，添加到mapview中
     if(this.widgetShow){
      this.mapview.graphics.removeAll();
      var graphic=this.createGrahic(coordinates);
      this.mapview.graphics.add(graphic);
     }
    },
    createPointGraphic(coordinates){//完成绘制，删除中的绘制
      this.mapview.graphics.removeAll();
      var graphic=this.createGrahic(coordinates);
      this.bookMarkGraphsLayer.graphics.add(graphic);
    },
    createGrahic(coordinates){
      var point = {
        type: "point", // autocasts as /Point
        x: coordinates[0],
        y: coordinates[1],
        spatialReference: this.mapview.spatialReference
      };
      var textSymbol = {
        type: "text",  // autocasts as new TextSymbol()
        color:"red",//"#e6a23c",
        text: "\ue61d",
        xoffset: 0,
        yoffset: 0,
        font: {
          size: 14,
          family: "CalciteWebCoreIcons",
        }
      };
      var graphic = new Graphic({
        geometry: point,
        symbol:textSymbol,
      });
      return graphic;
    },
    saveDrawBookmark(coordinates){//保存标签名和，地址
      let id=0;
      if(this.mapBookmarksObj.mapbookmarks.length!=0){
        id=this.mapBookmarksObj.mapbookmarks[this.mapBookmarksObj.mapbookmarks.length-1].id+1;
      }
      let obj={id:id,name:`书签${id}`,tempname:`书签${id}`,position:[coordinates[0], coordinates[1]],scale:this.mapview.scale,editPopver:false};
      this.mapBookmarksObj.mapbookmarks.push(obj);
      this.setLocalStorage();
    },
    removeBookmarkPoint(){//删除所有书签
      this.mapview.graphics.removeAll(); //this.bookMarkGraphsLayer.graphics.removeAll(); 
      this.mapBookmarksObj.mapbookmarks=[];
      this.mapBookmarksObj.mapbookmarks.length=0;
      this.setLocalStorage();
    },
    setLocalStorage(){//设置localStorage
      let obj = JSON.stringify(this.mapBookmarksObj); //转化为JSON字符串
      window.localStorage.setItem("mapbookmarks", obj);
    },
  },
  created:function () {
    //测试用
    //var obj = {mapbookmarks: [{id:0,name:"测试",tempname:"测试",position:[],editPopver:false},{id:1,name:"测试2",tempname:"测试2",position:[],editPopver:false}]};
    // 　　obj = JSON.stringify(obj); //转化为JSON字符串
    //     window.localStorage.setItem("mapbookmarks", obj);
    // 将JSON字符串转换成为JSON对象输出
    let json=window.localStorage.getItem("mapbookmarks");
    if(json){
      this.mapBookmarksObj=JSON.parse(json);
    }else{
      this.mapBookmarksObj={mapbookmarks:[]}
    }
  },
  mounted: function () {
    this.bkExpand = new Expand({
      view: this.mapview,
      content: document.getElementById("bookmarks"),
      expanded: true
    });
    if(this.visible){
      this.mapview.ui.add(this.bkExpand,this.position);
    }
  },
  watch:{
   widgetShow :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
      this.setWidgetVisible("bookmarks",val);
    },
  },
}
</script>
<style  scoped>
.bookmarks{
  background: #fff;
  overflow: auto;
  padding: 10px 15px;
  border-bottom: 1px solid rgba(110,110,110,0.3);
  width: 300px;
  max-height: 270px;
}
.bookmarks::-webkit-scrollbar {
/*滚动条整体样式*/
  width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.bookmarks::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  background   : #535353;
}
.bookmarks::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow   : inset 0 0 5px rgba(0,0, 0, 0.2);
  border-radius: 10px;
  background   : #ededed;
}
.bookmarks :hover{
  background: rgb(240, 240, 240);
}
.bookmarkItem {
  display: flex;
  justify-content: space-between;
}
.addBookmark{
  font-size: 14px;
  padding: 10px 0px;
}
.locateStar{
  color: red
}
.nameBox {
  display: flex;
  align-items: center;
  width:90%;
}
.editBox{
   width:10%;
}
.keepRight{
  float: right;
  padding: 3px 0;
}
</style>
