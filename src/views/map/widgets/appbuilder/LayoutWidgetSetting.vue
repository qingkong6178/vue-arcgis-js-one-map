<!--微件设置-->
<template>
  <div>
  <template v-for="(item,index) in allWidgets">
    <div :key="index">
      <h3 style="font-weight:bold;">{{item.title}}</h3>
      <div style="display:flex;flex-wrap:wrap">
        <template v-for="(widget,i) in item.displayWidget">
          <div v-if="widget.isExit" :key="i">
            <LayoutWidgetCard :describe="widget.describe" :hoverDivVisible="widget.hoverDivVisible" :rightTickVisible="widget.rightTickVisible"
            :rightTopVisible="widget.rightTopVisible" :rightTopDescribe="widget.rightTopDescribe" 
            :rightBottomVisible="widget.rightBottomVisible" :rightBottomDescribe="widget.rightBottomDescribe" @handleClick="clickItem(0,index,widget)" @handleDelete="deleteItem(index,i)" @handleEdit="editItem(index,i)">
            </LayoutWidgetCard>
          </div>
        </template>
      </div>
    </div>
  </template>
    <el-dialog
      title="选择微件"
      :visible.sync="dialogVisible"
      width="30%">
      <div style="display:flex;flex-wrap:wrap">
        <template v-for="(item,index) in selectWidgetGroup">
          <div v-if="item.isExit" :key="index">
            <LayoutWidgetCard :describe="item.describe" :hoverDivVisible="item.hoverDivVisible" :rightTickVisible="selectWidgetName==item.name?true:false" @handleClick="clickItem(0,0,item)">
             <div slot="content" class="widget_label">{{item.label}}</div>
            </LayoutWidgetCard>
          </div>
        </template>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="selectWidget">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="设置微件位置"
      :visible.sync="positionVisible"
      width="20%">
      <div style="width:100%">
        <template v-for="(row,index) in widgetPosition">
          <div :key="index" style="display:flex;justify-content:space-between;margin:5px">
            <template v-for="(item,i) in row">
              <LayoutWidgetCard :key="i" :describe="item.describe" :hoverDivVisible="item.hoverDivVisible" :rightTickVisible="selectWidgetPosition==item.name?true:false" @handleClick="clickItem(1,0,item)">
              </LayoutWidgetCard>
            </template>
          </div>
        </template>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="positionVisible = false">取 消</el-button>
        <el-button type="primary" @click="setWidgetPosition">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import LayoutWidgetCard from "./LayoutWidgetCard";
export default {
  components: {LayoutWidgetCard},
  data () {
    return {
      dialogVisible:false,//基础组件窗体的可见性
      positionVisible:false,//方向组件窗体可见性
      selectWidgetName:"",//选中的微件名称
      selectWidgetPosition:"",//微件方向
      allWidgets:[
        {id:0,title:"基础微件",widget:[//地图上可设置位置的小插件
          {id:2,describe:'&#xe637;',hoverDivVisible:false,rightTickVisible:false,label:"回到原始",name:"home",isExit:true,position:null},
          {id:3,describe:'&#xe60a;',hoverDivVisible:false,rightTickVisible:false,label:"比例尺",name:"scalebar",isExit:true,position:null},
          {id:4,describe:'&#xe6da;',hoverDivVisible:false,rightTickVisible:false,label:"指北针",name:"compass",isExit:true,position:null},
          {id:5,describe:'&#xe604;',hoverDivVisible:false,rightTickVisible:false,label:"坐标",name:"coordinateConversion",isExit:true,position:null},
          {id:6,describe:'&#xe6c4;',hoverDivVisible:false,rightTickVisible:false,label:"全屏",name:"fullscreen",isExit:true,position:null},
          {id:7,describe:'&#xe705;',hoverDivVisible:false,rightTickVisible:false,label:"打印",name:"print",isExit:true,position:null},
          {id:8,describe:'&#xe606;',hoverDivVisible:false,rightTickVisible:false,label:"图例",name:"legend",isExit:true,position:null},],
        displayWidget:[//基础插件，可设置位置
          {id:0,describe:'&#xe636;',hoverDivVisible:false,rightTickVisible:false,rightTopVisible:false,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"添加",name:"addWidget",isExit:true,position:null},
          {id:1,describe:'&#xe627;',hoverDivVisible:false,rightTickVisible:false,rightTopVisible:false,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"缩放",name:"zoom",isExit:true,position:'top-left'},
          {id:2,describe:'&#xe637;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:true,rightBottomDescribe:'&#xe601;',label:"回到原始",name:"home",isExit:false,position:'top-left'},
          {id:3,describe:'&#xe60a;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:true,rightBottomDescribe:'&#xe601;',label:"比例尺",name:"scalebar",isExit:false,position:'bottom-left'},
          {id:4,describe:'&#xe6da;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:true,rightBottomDescribe:'&#xe601;',label:"指北针",name:"compass",isExit:false,position:'top-right'},
          {id:5,describe:'&#xe604;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:true,rightBottomDescribe:'&#xe601;',label:"坐标",name:"coordinateConversion",isExit:false,position:'bottom-right'},
          {id:6,describe:'&#xe6c4;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:true,rightBottomDescribe:'&#xe601;',label:"全屏",name:"fullscreen",isExit:false,position:'top-right'},
          {id:7,describe:'&#xe705;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:true,rightBottomDescribe:'&#xe601;',label:"打印",name:"print",isExit:false,position:'top-left'},
          {id:8,describe:'&#xe606;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:true,rightBottomDescribe:'&#xe601;',label:"图例",name:"legend",isExit:false,position:'bottom-right'},],
      },{id:1,title:"添加微件",widget:[//所有插件，不设置位置，存放在悬浮菜单中
        {id:1,describe:'&#xe632;',hoverDivVisible:false,rightTickVisible:false,label:"资源编目",name:"resource_catalog",isExit:true,position:null},
        {id:2,describe:'&#xe66d;',hoverDivVisible:false,rightTickVisible:false,label:"图层列表",name:"layer_list",isExit:true,position:null},
        {id:3,describe:'&#xe65d;',hoverDivVisible:false,rightTickVisible:false,label:"成果输出",name:"export_map",isExit:true,position:null},
        {id:4,describe:'&#xe63d;',hoverDivVisible:false,rightTickVisible:false,label:"切换底图",name:"switch_basemap",isExit:true,position:null},
        {id:5,describe:'&#xe61a;',hoverDivVisible:false,rightTickVisible:false,label:"空间查询",name:"spatial_query",isExit:true,position:null},],
        displayWidget:[//自定义插件，
          {id:0,describe:'&#xe636;',hoverDivVisible:false,rightTickVisible:false,rightTopVisible:false,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"添加",name:"addWidget",isExit:true,position:null},
          {id:1,describe:'&#xe632;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"资源编目",name:"resource_catalog",isExit:false,position:'relative'},
          {id:2,describe:'&#xe66d;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"图层列表",name:"layer_list",isExit:false,position:'relative'},
          {id:3,describe:'&#xe65d;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"成果输出",name:"export_map",isExit:false,position:'relative'},
          {id:4,describe:'&#xe63d;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"切换底图",name:"switch_basemap",isExit:false,position:'relative'},
          {id:5,describe:'&#xe61a;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"空间查询",name:"spatial_query",isExit:false,position:'relative'},
        ],},{id:2,title:"工具栏插件",widget:[//地图上可设置位置的小插件
          {id:1,describe:'&#xe60b;',hoverDivVisible:false,rightTickVisible:false,label:"长度测量",name:"line_measure",isExit:true,position:null},
          {id:2,describe:'&#xe60f;',hoverDivVisible:false,rightTickVisible:false,label:"面积测量",name:"area_measure",isExit:true,position:null},
          {id:3,describe:'&#xed1b;',hoverDivVisible:false,rightTickVisible:false,label:"单点查询",name:"point_search",isExit:true,position:null},
          {id:4,describe:'&#xe79a;',hoverDivVisible:false,rightTickVisible:false,label:"属性查询",name:"property_search",isExit:true,position:null},
          // {id:5,describe:'&#xe61a;',hoverDivVisible:false,rightTickVisible:false,label:"空间查询",name:"spatial_search",isExit:true,position:null},
          {id:6,describe:'&#xe7b8;',hoverDivVisible:false,rightTickVisible:false,label:"多屏对比",name:"mutiscreen",isExit:true,position:null},
          {id:7,describe:'&#xe607;',hoverDivVisible:false,rightTickVisible:false,label:"卷帘",name:"swipe",isExit:true,position:null},
          {id:8,describe:'&#xe647;',hoverDivVisible:false,rightTickVisible:false,label:"叠加分析",name:"intersectAnalyse",isExit:true,position:null},
          {id:9,describe:'&#xe662;',hoverDivVisible:false,rightTickVisible:false,label:"清除",name:"clear_map",isExit:true,position:null},],
        displayWidget:[//基础插件，可设置位置
          {id:0,describe:'&#xe636;',hoverDivVisible:false,rightTickVisible:false,rightTopVisible:false,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"添加",name:"addWidget",isExit:true,position:null},
          {id:1,describe:'&#xe60b;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"长度测量",name:"line_measure",isExit:false,position:'absolute'},
          {id:2,describe:'&#xe60f;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"面积测量",name:"area_measure",isExit:false,position:'absolute'},
          {id:3,describe:'&#xed1b;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"单点查询",name:"point_search",isExit:false,position:'absolute'},
          {id:4,describe:'&#xe79a;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"属性查询",name:"property_search",isExit:false,position:'absolute'},
          // {id:5,describe:'&#xe61a;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"空间查询",name:"spatial_search",isExit:false,position:'absolute'},
          {id:6,describe:'&#xe7b8;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"多屏对比",name:"mutiscreen",isExit:false,position:'absolute'},
          {id:7,describe:'&#xe607;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"卷帘",name:"swipe",isExit:false,position:'absolute'},
          {id:8,describe:'&#xe647;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"叠加分析",name:"intersectAnalyse",isExit:false,position:'absolute'},
          {id:9,describe:'&#xe662;',hoverDivVisible:true,rightTickVisible:false,rightTopVisible:true,rightTopDescribe:'&#xe60c;',rightBottomVisible:false,rightBottomDescribe:'&#xe601;',label:"清除",name:"clear_map",isExit:false,position:'absolute'},
          ],},
      ],
      selectWidgetGroup:[],
      selectIndex:0,
      widgetPosition:[
        [{
            id:0,describe:'&#xe64f;',hoverDivVisible:false,rightTickVisible:false,label:"左上角",name:"top-left",position:"top-left",
          },{
            id:1,describe:'&#xe602;',hoverDivVisible:false,rightTickVisible:false,label:"右上角",name:"top-right",position:"top-right",
        }],
        [{
            id:2,describe:'&#xe603;',hoverDivVisible:false,rightTickVisible:false,label:"左下角",name:"bottom-left",position:"bottom-left",
        },{
            id:3,describe:'&#xe605;',hoverDivVisible:false,rightTickVisible:false,label:"右下角",name:"bottom-right",position:"bottom-right",
        }],
      ],
    }
  },
  methods: {
    deleteItem(index,id){//删除项 index:allWidgets数组的索引，id：allWidgets.widget数组的索引
      this.allWidgets[index].displayWidget[id].isExit=false;
      this.allWidgets[index].displayWidget[id].position="";
      let name=this.allWidgets[index].displayWidget[id].name;
      let index2=this.allWidgets[index].widget.findIndex(item=>name==item.name);
      this.allWidgets[index].widget[index2].isExit=true;
      this.setMapWidgets(index);
    },
    editItem(index,id){//编辑项 index:allWidgets数组的索引，id：allWidgets.widget数组的索引
      this.selectIndex=index;
      this.selectWidgetPosition=this.allWidgets[index].displayWidget[id].position;
      this.selectWidgetName=this.allWidgets[index].displayWidget[id].name;
      this.positionVisible=true;
    },
    clickItem(bs,index,item){//单击项目bs:0 微件，bs:1 方位,index表示allWidgets数组的索引
      if(item.name=="addWidget"){
        this.selectWidgetGroup=this.allWidgets[index].widget;
        this.selectIndex=index;
        this.dialogVisible=true;
      }else{
        if(bs==0){
          this.selectWidgetName=item.name;
        }else{
          this.selectWidgetPosition=item.name;
        }
      }
    },
    selectWidget(){//选择地图微件
      this.dialogVisible = false;
      this.selectWidgetPosition="";
      if(this.selectIndex==0){
        if(this.allWidgets[0].widget.some(item=>item.isExit)){
          this.positionVisible=true;
        }
      }else{
        this.addWidget();
        this.setMapWidgets();
      }
    },
    addWidget(){//添加组件
      let name=this.selectWidgetName;
      let index=this.allWidgets[this.selectIndex].widget.findIndex(item=>item.name==name);
      this.allWidgets[this.selectIndex].widget[index].isExit=false;
      let index2=this.allWidgets[this.selectIndex].displayWidget.findIndex(item=>item.name==name);
      this.allWidgets[this.selectIndex].displayWidget[index2].isExit=true;
    },
    setWidgetPosition(){//设置地图微件位置
      if(this.selectWidgetPosition!=""){
        this.addWidget();
        let name=this.selectWidgetName;
        let index2=this.allWidgets[this.selectIndex].displayWidget.findIndex(item=>item.name==name);
        this.allWidgets[this.selectIndex].displayWidget[index2].position=this.selectWidgetPosition;
        this.positionVisible=false;
        this.selectWidgetName="";
        this.selectWidgetPosition="";
        this.setMapWidgets();
      }else{
        this.$message({showClose: true,message: '请选择位置',type: 'warning'});
      }
    },
    setMapWidgets(){//设置地图微件
      let mapWidgets=this.allWidgets[this.selectIndex].displayWidget.filter(item=>item.isExit);
      // let mapWidgets=arr.map(item=>item.name);
      this.$emit("setMapWidgets",mapWidgets,this.selectIndex);
    }
  },
}
</script>
<style scoped>
  /* .mapBaseWidget{
    width:75px;
    height:75px;
    background-color:rgb(23,175,247);
    margin:0 10px 10px 0;
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .hoverDiv{
    display:none;
    position: absolute;
    width:100%;
    height:100%;
    top:0;
    left:0;
  }
  .widget{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    width:100%;
    height:100%;
  }
  .mapBaseWidget:hover .hoverDiv{
    display:block;
    background-color:rgba(101, 101, 101, 0.6);
  } */
  .widget_label{
    font-size:8px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    margin-bottom:5px;
    padding-right: 10px;
  }
</style>
