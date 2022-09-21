<!--编辑图层-->
<template>
    <el-dialog
    title="图层编辑"
    :visible.sync="dialogVisible"
    width="25%"
    append-to-body
    @open="openDialog"
    @close="handleClose"
    >
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="150px" class="demo-ruleForm">
        <el-form-item label="请选择编辑图层" prop="layerId">
          <el-select v-model="ruleForm.layerId" placeholder="请选择图层">
            <el-option
              v-for="item in layers"
              :key="item.id"
              :label="item.title"
              :value="item.id"
              :disabled="item.disabled">
            </el-option>
          </el-select>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="selectEditLayer">确定</el-button>
    </span>
    <Edit v-show="editVisible" :widgetShow="editVisible" :mapview="mapview" :layer="currentLayer" @handleCancleClick="editVisible=false"></Edit>
    </el-dialog>
</template>
<script>
import Edit from "./Edit";
export default {
  components: {Edit},
  props: {
    visible: {//窗体开关状态
      type: Boolean,
      default: false
    },
    mapview:{
      type:Object,
    },
  },
  data(){
    return{
        dialogVisible:false,
        ruleForm: {
          layerId: '',
        },
        rules: {
          layerId: [
            { required: true, message: '请选择有编辑能力的图层', trigger: 'change' }
          ],
        },
        layers:[],
        editVisible:false,
        currentLayer:{},
    }
  },
  methods: {
    openDialog(){
      if(this.mapview.map.layers){//获取查询图层信息
        this.layers=this.mapview.map.allLayers.items.filter(layer=>layer.type== "feature" && layer.capabilities.operations.supportsAdd 
           && layer.capabilities.operations.supportsDelete && layer.capabilities.operations.supportsUpdate && layer.capabilities.operations.supportsEditing)
      }
    },
    handleClose(){//关闭窗体
      this.$emit('handleCloseDialog')
      this.$refs["ruleForm"].resetFields()
    },
    selectEditLayer(){
      this.$refs["ruleForm"].validate((valid) => {
          if (valid) {
              this.currentLayer=this.mapview.map.findLayerById(this.ruleForm.layerId)
              if(this.currentLayer){
                  this.editVisible = true
              }
              this.dialogVisible = false
          }else{
            this.editVisible = false
            this.$message({showClose: true, message:"没有符合编辑能力条件的图层",type: "warning"})
          }
      })
    },
  },
  watch:{
    visible :function (val) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.dialogVisible=true
      }
    },
  },
}
</script>
