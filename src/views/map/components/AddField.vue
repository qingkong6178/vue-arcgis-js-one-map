<!-- 添加字段 -->
<template>
  <el-dialog title="添加字段" append-to-body :visible.sync="dialogVisible" @close="handleClose" width="30%">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules" label-width="5px">
        <el-form-item label-width="95px" label="字段名称" prop="name">
          <el-input placeholder="请输入字段名称" v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label-width="95px" label="字段别名" prop="alias">
          <el-input placeholder="请输入字段别名" v-model="ruleForm.alias"></el-input>
        </el-form-item>
        <el-form-item label-width="95px" label="字段类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择字段类型">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="ruleForm.type == 'string'" label-width="95px" label="字段长度" prop="length">
          <el-input v-model.number="ruleForm.length" placeholder="请选择字段长度"></el-input>
        </el-form-item>
        <!-- <el-form-item v-if="ruleForm.type == 'number'" label-width="95px" label="字段精度" prop="precision">
          <el-input v-model.number="ruleForm.precision" placeholder="请选择字段精度"></el-input>
        </el-form-item> -->
      </el-form>
      <span slot="footer">
        <el-button @click="resetForm('ruleForm')">取消</el-button>
        <el-button type="primary" @click="handleDone('ruleForm')">确定</el-button>
      </span>
  </el-dialog>
</template>
<script>
import { clone } from '@/utils/base'
export default {
  props: {
    visible: {//窗体开关状态
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      dialogVisible:false,
      options:[{value: 'string',label: '文本'},{value: 'number',label: '数字'}],
      ruleForm: {
        name: '',
        alias:'',
        type: 'string',
        length:50,
        // precision: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入字段名称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        alias: [
          { required: true, message: '请输入字段别名', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择字段类型', trigger: 'change' }
        ],
        length: [
          { required: true, message: '请输入字段长度', trigger: 'blur'},
          { type: 'number', message: '字段长度必须为数字值'}
        ],
        // precision: [
        //   { required: true, message: '请输入字段精度', trigger: 'blur'},
        //   { type: 'number', message: '字段精度必须为数字值'}
        // ]
      }
    }
  },
  methods: {
    handleClose(){//关闭窗体
      this.$emit('handleCloseDialog')
    },
    resetForm(formName) {
      this.dialogVisible = false
      this.$refs[formName].resetFields()
    },
    handleDone(formName){
      this.$refs[formName].validate((valid) => {
        if (valid) {
            if(this.ruleForm.type == 'string' && this.ruleForm.length < 1){
              this.$message({showClose: true,message:'字段长度必须为正数',type: 'warning'})
              return false;
            }
            this.dialogVisible = false
            let field = clone(this.ruleForm)
            if(field.type != 'string' ){
              field.length = -1
            }
            this.$emit("addField",field)
            this.$refs[formName].resetFields()
        } else {
            this.$message({showClose: true,message:'填写信息不合法',type: 'warning'})
            return false;
        }
      })
    }
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

</style>
