<template>
  <div>
    <el-tree :data="treeData" :empty-text="treeEmptyText" :node-key="treeNodeKey" 
             :render-after-expand="treeRenderAfterExpand" :highlight-current="treeHighlightCurrent"
             :default-expand-all="treeDefaultExpandAll" :expand-on-click-node="treeExpandOnClickNode"
             :check-on-click-node="treeCheckOnClickNode" :default-expanded-keys="treeDefaultExpandedKeys"
             :show-checkbox="treeShowCheckbox" :check-strictly="treeCheckStrictly" 
             :default-checked-keys="treeDefaultCheckedKeys" :accordion="treeAccordion" :indent="treeIndent"
             :icon-class="treeIconClass" :filter-node-method="filterNode"
             @node-click="nodeClick" @check-change="checkChange" @check="check" :props="defaultProps" ref="modelTree">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>
              <img v-if="data.type=='folder'" height="16" width="16" src="../../../img/fileFloder.png" alt  />
              <img v-if="data.type=='layers'" height="16" width="16" src="../../../img/layer.png" alt  />
              <img v-if="data.type=='service'" height="16" width="16" src="../../../img/service.png" alt  />
              {{ node.label }}
            </span>
          <span>
             <el-button  v-if="data.type=='layers'||data.type=='service'"
              type="text"
              size="mini"
              :disabled="false"
              @click="(e) => handleAddClick(e,data)">
              添加
            </el-button>
            <!-- <el-button  v-if="data.type=='layers'||data.type=='service'"
              type="text"
              size="mini"
              :disabled="JSON.parse(data.enabled)"
              @click="(e) => handleRemoveClick(e,data)">
              删除
            </el-button>-->
          </span>
      </span>
    </el-tree>
  </div>
</template>
 
<script>
import mylayers from "../mapconfig/layers";
import configfunc  from "../mapconfig/configfunc";
import projection from "../core/Projection";
export default {
  props: {
    // treeData: {
    //   type: Array
    // },
    treeEmptyText: {
      type: String,
      default: '暂无数据'
    },
    treeNodeKey: {
      type: String,
      default: 'id'
    },
    treeRenderAfterExpand: {
      type: Boolean,
      default: true
    },
    treeHighlightCurrent: {
      type: Boolean,
      default: false
    },
    treeDefaultExpandAll: {
      type: Boolean,
      default: true
    },
    treeExpandOnClickNode: {
      type: Boolean,
      default: true
    },
    treeCheckOnClickNode: {
      type: Boolean,
      default: false
    },
    treeDefaultExpandedKeys: {
      type: Array
    },
    treeShowCheckbox: {
      type: Boolean,
      default: false
    },
    treeCheckStrictly: {
      type: Boolean,
      default: false
    },
    treeDefaultCheckedKeys: {
      type: Array
    },
    treeAccordion: {
      type: Boolean,
      default: false
    },
    treeIndent: {
      type: Number,
      default: 16
    },
    treeIconClass: {
      type: String
    },
    treeFilterText: {
      type: String
    },
    treeNodeClickFunName: {
      type: String
    },
    treeCheckChangeFunName: {
      type: String
    },
    treeCheckFunName: {
      type: String
    },
    // defaultProps:{
    //   type:Object,
    //   default:  {
    //     id:'id', 
    //     label: 'label',
    //     children: 'children',
    //   },
    // }, 
    mapview:{
      type:Object,
    }
  },
  data () {
    return {
       treeData:[],//tree绑定数据
       defaultProps: {
          id:'id',
          label: 'label',
          children: 'childNode',
       },
       layerServiceObjects:[],
       grouplayer:{},
    }
  },
  methods: {
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    nodeClick (a, b, c) {
      if (!this.treeNodeClickFunName || this.treeNodeClickFunName === '') return
      let s = this.$refs.modelTree.getCheckedNodes()
      this.$emit(this.treeNodeClickFunName, s, a, b)
    },
    checkChange (a, b, c) {
      if (!this.treeCheckChangeFunName || this.treeCheckChangeFunName === '') return
      this.$emit(this.treeCheckChangeFunName, a, b, c)
    },
    check (a, b) {
      if (!this.treeCheckFunName || this.treeCheckFunName === '') return
      this.$emit(this.treeCheckFunName, a, b)
    },
    handleAddClick(e,data){
      e.stopPropagation();
      this.addOrRemoveToMap(data,"add");
      this.openFullScreen();
    },
    handleRemoveClick(e,data){
      e.stopPropagation();
      this.addOrRemoveToMap(data,"remove")
    },
    openFullScreen() {//加载遮罩等待
      const loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      setTimeout(() => {
        loading.close();
      }, 500);
    },
    addOrRemoveToMap(data,addOrRemove){//只是简单的添加图层功能
      var getUrl=data.type=="service"?"/siteMenu/findSiteMneuServiceById/":"/siteMenu/findSiteMneuById/";
      // this.$axiosWithToken.get(getUrl+data.id,{}).then(response => {//获取服务或图层详细信息
      //   if (response.code == 200) {
      //     let info=response.data;
      //     let isEqualSprWithmap=((info.TYPE.toLowerCase()=="mapserver"||info.TYPE.toLowerCase()=="imageserver"||info.TYPE.toLowerCase()=="featureserver")?info.FULLEXTENTWKID:info.WKID)==this.mapview.spatialReference.wkid;
      //     let type=configfunc.getType(info.TYPE,JSON.parse((info.TYPE.toLowerCase()=="mapserver"||info.TYPE.toLowerCase()=="imageserver"||info.TYPE.toLowerCase()=="featureserver")?info.SINGLEFUSEDMAPCACHE:"false"),isEqualSprWithmap);
      //     if(addOrRemove=="add"){//添加图层或者添加删除过的图层（其实是同一个图层）
      //       mylayers.addGroupLayerToMap(this.mapview,'资源目录图层组','zymlGroupLayer')
      //       let extent ={
      //         xmin:(info.TYPE.toLowerCase()=="mapserver"||info.TYPE.toLowerCase()=="imageserver"||info.TYPE.toLowerCase()=="featureserver")?info.FULLEXTENTXMIN:info.XMIN,
      //         ymin:(info.TYPE.toLowerCase()=="mapserver"||info.TYPE.toLowerCase()=="imageserver"||info.TYPE.toLowerCase()=="featureserver")?info.FULLEXTENTYMIN:info.YMIN,
      //         xmax:(info.TYPE.toLowerCase()=="mapserver"||info.TYPE.toLowerCase()=="imageserver"||info.TYPE.toLowerCase()=="featureserver")?info.FULLEXTENTXMAX:info.XMAX,
      //         ymax:(info.TYPE.toLowerCase()=="mapserver"||info.TYPE.toLowerCase()=="imageserver"||info.TYPE.toLowerCase()=="featureserver")?info.FULLEXTENTYMAX:info.YMAX,              
      //         spatialReference:{
      //           wkid:(info.TYPE.toLowerCase()=="mapserver"||info.TYPE.toLowerCase()=="imageserver"||info.TYPE.toLowerCase()=="featureserver")?info.FULLEXTENTWKID:info.WKID,
      //           wkt:(info.TYPE.toLowerCase()=="mapserver"||info.TYPE.toLowerCase()=="imageserver"||info.TYPE.toLowerCase()=="featureserver")?info.FULLEXTENTWKT:info.WKT,}
      //       };
      //       let url=mylayers.getUrl(info.SERVICEADDRESS,"","");
      //       let tplayer=new mylayers.getLayerFromUrl(url,type,extent);
      //       tplayer.info=info;
      //       mylayers.awaitAddlayer(this.mapview,tplayer,"zymlGroupLayer");
      //       this.changeObj(info.ID,tplayer.layer);
      //     }
      //     this.$message({showClose: true,type: "success",message: "操作成功!"});
      //   } 
      //   else {
      //     this.$message.error(response.data);
      //   }
      // })
      // .catch(error => {
      //   console.log(error);
      // });
    },
    addZymlGroupLayer(){
      if(!this.mapview.map.findLayerById("zymlGroupLayer")){
        let zymlGroupLayer = new GroupLayer({title:"资源目录图层组",id:'zymlGroupLayer'});
        this.mapview.map.add(zymlGroupLayer);
      }
    },
    removeLayer(grouplayer,id){//移除图层
      let layer=this.mapview.map.findLayerById(id);
      if(grouplayer){
        grouplayer.layers.remove(layer);
      }else{
        this.mapview.map.remove(layer);
      }
    },
    addOrRemoveToMapOld(data,addOrRemove){//将删除功能放到layerTree中，所以弃用
      var getUrl=data.type=="service"?"/siteMenu/findSiteMneuServiceById/":"/siteMenu/findSiteMneuById/";  
      let that=this;
      // this.$axiosWithToken.get(getUrl+data.id,{}).then(response => {//获取服务或图层详细信息        
      //   if (response.code == 200) {
      //     let info=response.data;
      //     let isEqualSprWithmap=(info.TYPE.toLowerCase()=="mapserver"?info.FULLEXTENTWKID:info.WKID)==this.mapview.spatialReference.wkid;
      //     let type=configfunc.getType(info.TYPE,JSON.parse(info.TYPE.toLowerCase()=="mapserver"?info.SINGLEFUSEDMAPCACHE:"false"),isEqualSprWithmap);
      //     if(addOrRemove=="add"){//添加图层或者添加删除过的图层（其实是同一个图层）          
      //     let element =configfunc.getArrProkv(this.layerServiceObjects,"id",info.ID,"obj");
      //     if(element != null && element!="")
      //     {
      //       if(this.grouplayer && this.mapview.map.findLayerById("zymlGroupLayer"))
      //       {
      //         this.grouplayer.layers.add(element)
      //       }else{
      //         this.mapview.map.add(tplayer.layer);
      //       }
      //       let proj=projection.project;
      //       let  full_extent=proj.project(element.fullExtent,this.mapview.spatialReference);
      //       this.mapview.extent =full_extent.expand(1.3);
      //     }
      //     else{
      //      let extent ={
      //         xmin:info.TYPE.toLowerCase()=="mapserver"?info.FULLEXTENTXMIN:info.XMIN,
      //         ymin:info.TYPE.toLowerCase()=="mapserver"?info.FULLEXTENTYMIN:info.YMIN,
      //         xmax:info.TYPE.toLowerCase()=="mapserver"?info.FULLEXTENTXMAX:info.XMAX,
      //         ymax:info.TYPE.toLowerCase()=="mapserver"?info.FULLEXTENTYMAX:info.YMAX,
      //         spatialReference:{
      //           wkid:info.TYPE.toLowerCase()=="mapserver"?info.FULLEXTENTWKID:info.WKID,
      //           wkt:info.TYPE.toLowerCase()=="mapserver"?info.FULLEXTENTWKT:info.WKT,}
      //         };
      //       let url=mylayers.getUrl(info.SERVICEADDRESS,"","");
      //       let tplayer=new mylayers.getLayerFromUrl(url,type,extent);
      //       tplayer.info=info;
      //       mylayers.awaitAddlayer(this.mapview,tplayer,"zymlGroupLayer");
      //       that.changeObj(info.ID,tplayer.layer);
      //      }
      //     }
      //     else{//删除图层
      //       let lyr= configfunc.getArrProkv(this.layerServiceObjects,"id",info.ID,"obj");
      //       this.grouplayer=mylayers.getLayerGroupbyid(this.mapview,"zymlGroupLayer");
      //       if(this.grouplayer){
      //         this.grouplayer.layers.remove(lyr);
      //       }else{
      //         this.mapview.map.remove(lyr)
      //       }
      //     }
      //     this.$message({showClose: true,type: "success",message: "操作成功!"});
      //     data.enabled=!data.enabled;
      //   } 
      //   else {
      //     this.$message.error(response.data);
      //   }
      // })
      // .catch(error => {
      //   console.log(error);
      // }); 
    },   
  //将添加的所有图层对象添加到layerServiceObjects中，包括服务或图层id，以及图层；
    changeObj(id,obj){
      let tempObj={};
      tempObj.id=id;
      tempObj.obj=obj;     
      let arr=this.layerServiceObjects;
      for (let i = 0; i < arr.length; i++) {
       let element =configfunc.parseJson(arr[i],"id",id);
       if(element!= ""){
        return;
       }
      }
      this.layerServiceObjects.push(tempObj);
    },

  }, 
  created() {
      // this.$axiosWithToken.post("/ResourceCatalog/selectMyMapTree",{}).then(response => {
      //   if (response.code == 200) {
      //     this.treeData=response.data;
      //   } else {
      //     this.$message.error(response.data);
      //   }
      // })
      // .catch(error => {
      //   console.log(error);
      // });
  },  
  watch: {
    treeFilterText (val) {
      this.$refs.modelTree.filter(val)
    }
  }
}
</script>
<style scoped>
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
