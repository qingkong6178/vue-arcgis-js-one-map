<template>
 <span  title="分屏对比工具" class="mutiScreen">
    <template v-for="(widget,index) in widgets">
        <span  @click="displayWidget(widget.name)" :key="index">
            <el-tooltip :content="widget.alt" placement="bottom">
            <i class="iconfont icon" :class="{'icon_active':widget.display}" v-html="widget.icon"></i>
            </el-tooltip>
        </span>
     </template>
</span>
</template>
<script>
import myconfig from "../mapconfig/myconfig";
import configfunc from "../mapconfig/configfunc";
import mylayers from "../mapconfig/layers";
import MapView from "esri/views/MapView";
import Point from "esri/geometry/Point";
import Map from "esri/Map";
import Basemap from "esri/Basemap";
import SpatialReference from "esri/geometry/SpatialReference";
import watchUtils from "../core/WatchUtils";
let viewsBackup=[];
export default {
 props: {
    mapview:{
     type:Object,
    },
    widgetShow:{//组件显隐状态
     type: Boolean,
    },
 },
 data() {
  return {
    widgets:[
                {name: 'oneScreenLayout', icon: '&#xe633;', display: true, alt: '一屏'},
                {name: 'twoHorizontalScreenLayout', icon: '&#xe649;', display: false, alt: '两分屏水平'},
                {name: 'twoVerticalScreenLayout', icon: '&#xe667;', display: false, alt: '两分屏垂直'},
                {name: 'threeHorizontalScreenLayout', icon: '&#xe642;', display: false, alt: '三分屏水平'},
                {name: 'threeVerticalScreenLayout', icon: '&#xe70a;', display: false, alt: '三分屏垂直'},
                {name: 'verAndHorScreenLayout', icon: '&#xe6a1;', display: false, alt: '三分屏样式3'},
                {name: 'horAndVerScreenLayout', icon: '&#xe6a9;', display: false, alt: '三分屏样式4'},
                {name: 'fourScreenLayout', icon: '&#xe600;', display: false, alt: '四分屏'},
            ],
      groupForm: {
        layout: 'twoHorizontalScreenLayout',
      },
      views:[],
      two:"two",
      three:"three",
      four:"four",
      layoutType:"two",
      layoutGroup:[],
      containerOnScreen:[{
        value: 'twoHorizontalScreenLayout',
        label: '水平'
        },{
        value: 'twoVerticalScreenLayout',
        label: '垂直'
        }],
      options:{
        two:[{
        value: 'twoHorizontalScreenLayout',
        label: '水平'
        },{
        value: 'twoVerticalScreenLayout',
        label: '垂直'
        }],
        three:[{
        value: 'threeHorizontalScreenLayout',
        label: '水平'
        },{
        value: 'threeVerticalScreenLayout',
        label: '垂直'
        },{
        value: 'verAndHorScreenLayout',
        label: '左一右二'
        },{
        value: 'horAndVerScreenLayout',
        label: '左二右一'
        }],
        four:[{
        value: 'fourScreenLayout',
        label: '四均等份'
      }],
      mutisreenHandle:null,
    },
 }
},
 destroyed () {
    if(this.mutisreenHandle && this.mutisreenHandle.remove){
        this.mutisreenHandle.remove();
    }
  },
 methods: {
    openFullScreen(time) {//加载遮罩等待
      const loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      setTimeout(() => {
        loading.close();
      }, time);
    },
    changeRadio(){
      this.containerOnScreen=this.options[this.layoutType];
      this.groupForm.layout=this.containerOnScreen[0].value;
    },
    handleCancle() {//取消多屏对比
      this.removeMutiScreen();
      this.$emit('handleCancleClick','mutiScreenWidget');
    },
    displayWidget(name) {
       for (let i = 0; i < this.widgets.length; i++) {
           if(this.widgets[i].name==name){
               if(this.widgets[i].name=="oneScreenLayout"){
                this.widgets[i].display =true;
                this.handleCancle();
               }else if(!this.widgets[i].display){
                this.widgets[i].display = !this.widgets[i].display;
                this.handleDone(this.widgets[i].name)
               }
            }else{
              this.widgets[i].display =false;
            }
        }
    },
    handleDone(name) {//添加多屏对比
        this.layout=myconfig.containerOnScreen[name];
        this.$emit('handleChangeScreenLayout',this.layout)
        this.openFullScreen(2000);
        let view0=this.mapview;
        let mutiScreenThis=this;
        this.$nextTick(() => {
            // this.views.length=0;
            this.views = this.layout.subDiv.map((div,index)=> {
                if(index!=0){
                    let newmap=mutiScreenThis.getBaseMap();
                    let view= new MapView({
                        container: div.id,
                        map:newmap,
                        spatialReference: mutiScreenThis.mapview.spatialReference,
                        //center设置[123.351997,40.913242]坐标数组无效。
                        center: this.mapview.center,//new Point(myconfig.mapview.center),
                        zoom: this.mapview.zoom,
                    });
                    view.ui.components = [];
                    if(viewsBackup.length < index){
                       viewsBackup=[...viewsBackup,view]
                    }else{
                        view.map=viewsBackup[index-1].map
                    }
                    return view;
                }else{
                    return mutiScreenThis.mapview;
                }
            });
            this.$emit('getAllViews',this.views);
            if(this.mutisreenHandle && this.mutisreenHandle.remove){
                this.mutisreenHandle.remove();
            }
            this.mutisreenHandle = this.synchronizeViews(this.views);
        });
    },
    getBaseMap(){//获得底图
        let baselyr = this.mapview.map.basemap.baseLayers.items.map(layer =>{
            let lyr=mylayers.getLayerFromType(layer.type,layer.url)
            return lyr
        })
        // let baselyr = this.mapview.map.basemap.baseLayers//或得地图图层,此种方式多屏后仍为一个对象，切换底图显隐有问题
        let sr = this.mapview.spatialReference;
        //地图默认加载矢量底图
        let map = new Map({
            spatialReference: sr,
        });
        let baselayer= new Basemap({title:"底图",baseLayers:baselyr});
        map.basemap=baselayer;
        return map;
    },
    synchronizeViews(views) {
        let handles = views.map((view, idx, views)=>{
            let others = views.concat();
            others.splice(idx, 1);
            return this.synchronizeView(view, others);
        });
        return {
            remove: function() {
                this.remove = function(){};
                handles.forEach(function(h){
                 h.remove();
                });
                handles = null;
            }
        };
    },
    synchronizeView(view, others) {
        others = Array.isArray(others) ? others : [others];
        let viewpointWatchHandle;
        let viewStationaryHandle;
        let otherInteractHandlers;
        let scheduleId;
        let clear = function() {
            if (otherInteractHandlers) {
                otherInteractHandlers.forEach(function(handle) {
                handle.remove();
                });
            }
            viewpointWatchHandle && viewpointWatchHandle.remove();
            viewStationaryHandle && viewStationaryHandle.remove();
            scheduleId && clearTimeout(scheduleId);
            otherInteractHandlers = viewpointWatchHandle = viewStationaryHandle = scheduleId = null;
        };
        let interactWatcher = view.watch("interacting,animation", function(newValue){
            if (!newValue){
                return;
            }
            if (viewpointWatchHandle || scheduleId) {
                return;
            }
            // start updating the other views at the next frame
            scheduleId = setTimeout(function() {
                scheduleId = null;
                viewpointWatchHandle = view.watch("viewpoint", function(newValue){
                others.forEach(function(otherView) {
                    otherView.viewpoint = newValue;
                });
            });
            }, 0);
            // stop as soon as another view starts interacting, like if the user starts panning
            otherInteractHandlers = others.map(function(otherView) {
                return watchUtils.watchUtils.watch(otherView,"interacting,animation",
                function(value) {
                    if (value) {
                    clear();
                    }
                }
             );
            });
            // or stop when the view is stationary again
            viewStationaryHandle = watchUtils.watchUtils.whenTrue(view,"stationary",clear);
        });
        return {
            remove: function() {
                this.remove = function() {};
                clear();
                interactWatcher.remove();
            }
     };
    },
    removeMutiScreen(){
      this.views.length=0;
    },
 },
}
</script>
<style scoped>
.mutiScreen{
    padding-top: 15px
}
.groupForm{
    margin-top: 1vh;
}
.icon{
    font-size: 16px;
    margin: 0 10px;
    cursor: pointer;
}
.icon_active {
    color: rgb(26, 11, 238);
}
</style>
