<!--编辑图层-->
<template>
    <div>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="150px">
          <el-form-item label="请选择图层" prop="layerId">
            <el-select v-model="ruleForm.layerId" placeholder="请选择图层">
              <el-option
                v-for="item in layers"
                :key="item.id"
                :label="item.title"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
      </el-form>
       <div style="display: flex;justify-content: flex-end;">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="selectEditLayer">确定</el-button>
      </div>
    </div>
</template>
<script>
export default {
  props: {
    mapview:{
      type: Object,
    },
    layers:{
      type: Array
    }
  },
  data(){
    return{
        ruleForm: {
          layerId: '',
        },
        rules: {
          layerId: [
            { required: true, message: '请选择标绘图层', trigger: 'change' }
          ],
        }
    }
  },
  methods: {
    handleClose(){//关闭窗体
      this.$emit('handleCloseDialog')
      this.$refs["ruleForm"].resetFields();
    },
    selectEditLayer(){
      this.$refs["ruleForm"].validate((valid) => {
          if (valid) {
              this.$emit("check",this.ruleForm.layerId)
              this.$refs["ruleForm"].resetFields();
          }else{
            this.$message({showClose: true, message:"没有符合条件的图层",type: "warning"})
          }
      })
    },
  },
}
</script>
