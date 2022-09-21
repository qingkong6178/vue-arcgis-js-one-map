<!--制作专题图地图分析等值线页-->
<template>
  <div>
    <!-- <p class="analyseTitle">等值线</p> -->
    <el-form :model="analyseForm" ref="analyseForm" label-width="5px">
      <el-form-item label-width="95px" label="分析图层" prop="layer" :rules="[{ required: true, message: '请选择要素图层', trigger: 'blur' }]">
        <el-select   v-model="analyseForm.layer" placeholder="请选择图层" @focus="openAddSelectDialog" @change="getAnalyseFormLayer" style="width: 100%">
          <el-option v-for="item in layerGroup"  :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label-width="95px" label="结果图层" prop="resultTitle" :rules="[{ required: true, message: '请输入结果图层名称', trigger: 'blur' }]">
        <el-input v-model="analyseForm.resultTitle" placeholder="请输入结果图层名称" style="width: 100%"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button size="medium" type="primary" @click="handleDone('analyseForm')" class="okBtn">分析</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
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
        resultTitle:'等值线'//结果图层名称
      },
      layerGroup:[],//图层select
      analyseLayer:{},
      unitGroup:[{value:'meters',label:'米'},{value:'kilometers',label:'千米'}],//单位
    }
  },
  methods: {
    init(){//初始化
      this.analyseForm.layer='',//选择要素图层id
      this.analyseForm.resultTitle='等值线'//结果图层名称
    },
    openAddSelectDialog(){//获取查询图层信息
      if(this.mapview.map.layers){
        let layers=this.mapview.map.allLayers.items.filter(function(layer){
            return layer.type== "feature" && layer.url!=null && layer.visible;
          });
        this.layerGroup=layers.map(function(layer) {
          var obj={value:layer.id,label:layer.title,layer,layer:layer};
          return obj;
        }).reverse();
      }
    },
    getAnalyseFormLayer(){//获取选取的分析图层
      let id=this.analyseForm.layer;
      let layer=this.mapview.map.layers.find((layer)=>layer.id==id)
      if(layer){
        this.analyseForm=layer;
        this.analyseForm.resultTitle=`${layer.title}等值线`;
      }
    },
    handleDone(formName) {//分析
      this.$refs[formName].validate((valid) => {
        if (valid && this.analyseForm.radius>0) {
          let layerid=this.bufferForm.layer
          let selectedLayer=this.mapview.map.allLayers.items.find(function(layer){
            return layer.id== layerid;
          });
        } else {
          this.$message({showClose: true,message: '所添信息不符合要求',type: 'info'});
          return false;
        }
      });
    }, 
  
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
<style scoped>
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
  /* .analyseTitle{
    font-weight: bold;
    margin-left:5px;
    margin-bottom:5px;
  } */
</style>
