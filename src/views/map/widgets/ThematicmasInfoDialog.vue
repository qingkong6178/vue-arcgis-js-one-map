<!--添加图层组页 -->  
<template>   
  <el-dialog title="信息详情" :visible.sync="dialogVisible" @open="openDialog" @close="handleClose" width="30%">      
      <el-form :model="formData" ref="formData" label-width="5px" style="margin-top:10px;margin-right:20px">       
        <el-form-item label-width="95px" label="标题" prop="title" :rules="[{ required: true, message: '请输入标题', trigger: 'blur' }]">
          <el-input placeholder="请输入标题" v-model="formData.title"></el-input>
        </el-form-item>
        <el-form-item label-width="95px" label="描述" prop="describe">
          <el-input placeholder="请输入描述" type="textarea" :rows="3" v-model="formData.describe"></el-input>
        </el-form-item>
        <el-form-item label-width="95px" label="创建人" prop="createUser">
          <el-input disabled v-model="formData.createUser"></el-input>
        </el-form-item>
        <el-form-item label-width="95px" label="创建日期" prop="createTime">
          <el-input disabled v-model="formData.createTime"></el-input>
        </el-form-item>
        <el-form-item label-width="95px" label="标签" prop="label">          
          <div style="width:100%">
            <el-tag :key="tag"
              v-for="tag in formData.label"
              closable
              type='success'
              disable-transitions
              @close="handleTagClose(tag)">
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
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDone('formData')">确定</el-button>
      </span>
  </el-dialog>
</template>
<script>
import mylayers from "../mapconfig/layers";
import GroupLayer from "esri/layers/GroupLayer";
import SelectTree from "../components/TreeSelect";
import lodash from "lodash";
export default { 
  props: {
    visible: {//窗体开关状态
      type: Boolean,
      default: false
    },
    mapInfoData:{//数据信息
      type: Object,
    },
   
  },
  data () {
    return {
      dialogVisible:false,  
      formData:{},
      inputVisible: false,
      inputValue: '',
    }
  },
  methods: {
    handleClose(){//关闭窗体
        let timestamp = new Date().getTime();
        this.$emit('handleCloseDialog',timestamp)
    },
    openDialog(){//打开窗口,深拷贝传入对象
      this.formData=lodash.cloneDeep(this.mapInfoData);
      if(!this.formData.label){
        this.formData.label=[];
      }
    },
    handleTagClose(tag) {
      this.formData.label.splice(this.formData.label.indexOf(tag), 1);     
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm() {//添加标签
      let inputValue = this.inputValue;    
      if (inputValue && inputValue.trim().length!=0 && this.formData.label.length<6) {
        this.formData.label.push(inputValue);       
      }else{
        this.$message({showClose: true,message: '至多添加六个且不为空的标签'});
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    handleDone(formName){//确定
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("getEditData",this.formData);
          this.dialogVisible = false;
        } else {
          this.$message({showClose: true,message: '填写信息不正确'});
          return false;
        }
      });
    },     
  },
  watch:{
   visible :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.dialogVisible=true;
      }
    },
  },
}
</script>
<style scoped> 
  .el-tag{
    margin-right: 10px;
    margin-bottom: 10px;
  }
  .button-new-tag{
    margin-right: 10px;
    margin-bottom: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag{
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  } 
</style>