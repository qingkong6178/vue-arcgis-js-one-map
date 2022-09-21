<!--制作专题图中的设置 -->  
<template>  
  <div class="mapSetup">
    <span >标题</span>
    <el-input v-model="mapTitle" placeholder="请输入标题" class="mapSetupMarginBottom" @input="emitInputTitle"></el-input>
    <span >描述</span>
    <el-input v-model="describe" type="textarea" :rows="3" placeholder="暂无描述信息" class="mapSetupMarginBottom" @input="emitInputDescribe"></el-input>
    <span>标签（最多6个）</span>
    <div class="mapSetupMarginBottom">
      <el-tag :key="tag"
      v-for="tag in dynamicTags"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)">
      {{tag}}
      </el-tag>
      <el-input 
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm">
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加标签</el-button>
      
      <el-divider/>
      <span>地图中心点和地图级别</span>
      <div class="mapSetupMarginBottom">                   
        <el-form :model="mapSetupValidateForm" ref="mapSetupValidateForm" label-width="100x" class="demo-ruleForm">
          <el-form-item label="经度或者x坐标" prop="longitude" :rules="[{ type: 'number', message: '必须为数字值'}]">
            <el-input v-model.number="mapSetupValidateForm.longitude" @change="submitForm"></el-input>
          </el-form-item>
          <el-form-item label="纬度或者y坐标" prop="latitude" :rules="[{ type: 'number', message: '必须为数字值'}]">
            <el-input v-model.number="mapSetupValidateForm.latitude" @change="submitForm"></el-input>
          </el-form-item>
          <el-form-item label="级别" prop="class" :rules="[{ type: 'number', message: '级别必须为数字值'}]">
            <el-input v-model.number="mapSetupValidateForm.class" @change="submitForm"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>  
</template>
<script>
import Point from "esri/geometry/Point";
export default {
  props: {   
    mapview:{//地图
      type:Object,
    },    
    paramObj:{//传入参数
      type:Object,
    },
  },  
  data () {
    return {
      mapTitle:"无标题",
      describe:"",
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
      mapSetupValidateForm: {//地图中心点和地图级别设置
        longitude: this.mapview.center && this.mapview.center.longitude ?this.mapview.center.longitude:null,
        latitude: this.mapview.center && this.mapview.center.latitude ?this.mapview.center.latitude:null,
        class:this.mapview.zoom?this.mapview.zoom:null,
      },     
    }    
  },
  mounted() { 
    this.mapview.watch("center", this.callback);
    this.mapview.watch("zoom", this.callback);
    if(JSON.stringify(this.paramObj) != "{}"){   
      this.mapTitle=this.paramObj.title?this.paramObj.title:"无标题";
      this.describe=this.paramObj.describe?this.paramObj.describe:"";
      this.dynamicTags=this.paramObj.label?this.paramObj.label:[];
    }
  },
  methods: {
    callback(newValue, oldValue, propertyName) {
      if(propertyName=="center"){
        this.mapSetupValidateForm.longitude=this.mapview.center.longitude?this.mapview.center.longitude:this.mapview.center.x;
         this.mapSetupValidateForm.latitude=this.mapview.center.latitude?this.mapview.center.latitude:this.mapview.center.y;
      }else if(propertyName=="zoom"){
          this.mapSetupValidateForm.class=this.mapview.zoom;
      }
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
      this.$emit("getInputMapTags",this.dynamicTags);//获得标签
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm() {//添加标签
      let inputValue = this.inputValue;    
      if (inputValue && inputValue.trim().length!=0 && this.dynamicTags.length<6) {
        this.dynamicTags.push(inputValue);
        this.$emit("getInputMapTags",this.dynamicTags);//获得标签
      }else{
        this.$message({showClose: true,message: '至多添加六个且不为空的标签'});
      }
      this.inputVisible = false;
      this.inputValue = '';
    },  
    submitForm(name) {
      this.$refs.mapSetupValidateForm.validate((valid) => {
        if (valid) {
          this.mapNavigation(this.mapSetupValidateForm.longitude,this.mapSetupValidateForm.latitude,this.mapSetupValidateForm.class);
        } else {
          this.$message('输入不合法');
          this.mapSetupValidateForm.longitude=this.mapview.center.longitude;
          this.mapSetupValidateForm.latitude=this.mapview.center.latitude;
          this.mapSetupValidateForm.class=this.mapview.zoom;
          return false;
        }
      });
    },
    mapNavigation(latitude,longitude,zoom){
      let pt = new Point({
        latitude: latitude,
        longitude: longitude
      });
      this.mapview.goTo({
        target: pt,
        zoom: zoom
      }).catch(function(error) {
      });
    },
    emitInputTitle(){//获取标题
      this.$emit("getInputMapTitle",this.mapTitle);//获得标题
    },
    emitInputDescribe(){//获得描述信息
      this.$emit("getInputMapDescribe",this.describe);//获得标题
    }
  }, 
}
</script>
<style  scoped> 
  .mapSetup{
    width:100%;
    height: 100%;
    overflow: auto;
    padding: 0 15px;    
  }
  .mapSetupMarginBottom{
    margin-bottom:10px
  } 
  .el-tag {
    margin-left: 10px;
    margin-bottom: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    margin-bottom: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }  
</style>