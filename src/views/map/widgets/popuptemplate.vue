<!--单点查询工具插件 -->
<template>
<el-tooltip class="item" effect="dark" v-bind:content="content" placement="bottom">
  <el-button plain icon="el-icon-thumb" class="maptoolbtn" id="popuptemplate"
    @click="setWidgetVisible('popuptemplate')">单点查询
  </el-button>
</el-tooltip>
</template>
<script>
import axios from 'axios';
export default {
  props: {
    mapview:{
      type:Object,
    },
  },
  data () {
    return {
      plugchecked:false,
      content:'点击开启图层的信息查询功能',
    }
  },
  methods: {
  setWidgetVisible(btnid){
     this.setContent()
     this.setPopuptemplate(this.plugchecked);
   },
  setContent(){
    this.plugchecked=!this.plugchecked;
    if(this.plugchecked){
       this.content='点击关闭图层的信息查询功能'
       document.documentElement.style.cursor = 'pointer';
    }else{
      this.content='点击开启图层的信息查询功能'
      document.documentElement.style.cursor = '';
      this.mapview.popup.close();
    }
  },
  setPopuptemplate(plugchecked){//设置图层popuptemplate
    let layers=this.mapview.map.allLayers.items.filter((layer)=>layer.type=="feature")
    let mapImageLayers=this.mapview.map.allLayers.items.filter((layer)=>layer.type=="map-image"||layer.type=="tile")
    this.setLayerPopuptemplate(layers,plugchecked,"feature")
    mapImageLayers.map((layer)=>{
      this.setLayerPopuptemplate(layer.sublayers.items,plugchecked,"map-image")
    })
   
  },
  setLayerPopuptemplate(layers,plugchecked,type){
    for(let i = 0; i <layers.length; i++){
      if(plugchecked){
        if(type=="feature"){
          layers[i].popupTemplate=this.getPopuptemplate(layers[i]);
        }else{
          this.getSublayerInfo(layers[i]);
        }
      }else{
        layers[i].popupTemplate=null;
      }
    }
  },
  getPopuptemplate(layer){//获取popuptemplate模板
    let layerPopuptemplate={
        title:layer.title,
        content:[{
            type:"fields",
            fieldInfos:layer.fields.map(field=>{
              return {
                  fieldName: field.name,
                  label: field.alias
              }
            })
          }
        ]
     };
    return layerPopuptemplate;
  },
  getSublayerInfo(layer){//获取popuptemplate模板
    axios({
      method:"get",
      url:`${layer.url}?f=pjson`,
    }).then((response)=> {
        if(response.status==200){
          let fields=response.data.fields.filter(field=>field.type!="esriFieldTypeGeometry")
          this.getSublayerPopuptemplate(layer,fields)
        }
    })
  },
  getSublayerPopuptemplate(layer,fields){
    layer.popupTemplate={
      title:layer.title,
      content:[{
          type:"fields",
          fieldInfos:fields.map(field=>{
            return {
                fieldName: field.name,
                label: field.alias
            }
          })
        }]
    };
  }
},
}
</script>
