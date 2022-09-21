<!--layer属性信息展示页-->
<template>
  <el-dialog
    title="图层属性"
    :visible.sync="propertyDialogVisible"
    width="40%"
    append-to-body
    @close="handleClose"
    @open="handOpen">
    <el-tabs v-model="activeName">
        <el-tab-pane label="基本" name="general">
          <div>
            <template v-for="(layerProtery,index) in layerCertainProtery">
              <p  v-if="layerProtery.visible && layerProtery.name !='服务地址：'" :key="index">
                {{layerProtery.name}}{{layerProtery.description}} 
              </p>
              <p  v-else-if="layerProtery.visible && layerProtery.name == '服务地址：'" :key="index">
                {{layerProtery.name}}<el-link icon="el-icon-thumb" type="primary" :href='layerProtery.description' target="_blank">{{layerProtery.description}}</el-link> 
              </p>
            </template>
          </div>
          <div v-if="layerFullExtent.visible" class="extent">
            <span>{{layerFullExtent.name}}</span>
            <span>
              <template v-for="(description,i) in layerFullExtent.description">
                <div  :key="i">
                {{description}}
                </div>
              </template>
            </span>
          </div>
          <div v-if="layerSupportedOperations.length>0" class="extent">
            <span>支持的操作：</span>
            <span>
              <template v-for="(operation,i) in layerSupportedOperations">
                <span  :key="i" class="supportOperations">
                  <el-link icon="el-icon-thumb" type="primary" :href='operation.herfUrl' target="_blank">{{operation.label}}</el-link>
                </span>
              </template>
            </span>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="layerFields.length>0" label="字段" name="field">
          <div>
            <template v-for="(Fields,index) in layerFields">
                <div v-if="Fields.visible"  :key="index" class="extent">
                  <span>{{Fields.name}}</span>
                  <span>
                    <template v-for="(description,i) in Fields.description">
                      <div  :key="i">
                      {{description}}
                      </div>
                    </template>
                  </span>
                </div>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="(layer.type=='map-image'|| layer.type=='tile') &&　sublayersProtery.length>0" label="子图层信息" name="sublayer">
          <template v-for="(layerProtery,index) in sublayersProtery">
            <div :key="index" >
              <div style="display:flex;justify-content: space-between;">
                <div class="extent">
                  <span>子图层{{index+1}}：</span>
                  <span>
                    <template v-for="(sublayer,i) in layerProtery">
                        <p  v-if="sublayer.visible" :key="i">
                        {{sublayer.name}}{{sublayer.description}}
                        </p>
                    </template>
                  </span>
                </div>
                <div style="margin-right:10px">
                   <el-tooltip v-if='layer.capabilities.exportMap.supportsDynamicLayers' effect="dark" content="样式" placement="bottom" style="margin-right:10px">
                      <i style="font-size:20px; cursor:pointer; color:rgb(0,84,166)" class="iconfont icon" v-html="'&#xe815;'" @click="showSublayerSymbol(layer.findSublayerById(index))" ></i>
                  </el-tooltip>
                  <!-- <el-button v-if="layer.capabilities.exportMap.supportsDynamicLayers" type="primary" plain size="mini" icon="el-icon-thumb" @click="showSublayerSymbol(layer.sublayers.items[index])" class="bottomClass">样式</el-button> -->
                  <el-tooltip v-if='layer.capabilities.operations.supportsQuery' effect="dark" content="查看属性信息" placement="bottom">
                      <i style="font-size:20px; cursor:pointer; color:rgb(0,84,166)" class="iconfont icon" v-html="'&#xed1b;'" @click="showSublayerInfo(layer.findSublayerById(index))"></i>
                  </el-tooltip>
                </div>
              </div>
              <div class="extent">
                <span>可见性：</span>
                <el-switch :disabled="!layer.capabilities.exportMap.supportsSublayerVisibility" v-model="sublayersVisible[index]" active-color="#13ce66" inactive-color="#ff4949" @change="toggleSublayerVisble(visible,layerProtery[0].description)"></el-switch>
              </div>
            </div>
          </template>
        </el-tab-pane>
        <el-tab-pane v-if="layer.type=='tile'" label="瓦片信息" name="tileInfo">
          <div>
            <template v-for="(layerProtery,index) in tileLayerCertainProtery">
              <p :key="index">
                {{layerProtery.name}}{{layerProtery.description}}
              </p>
            </template>
          </div>
          <div  class="tile">
            <template v-for="(description,i) in tileLayerTileLodsProtery.description">
              <div  :key="i" class="bottomClass">
              {{description}}
              </div>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="variousLayerProperty.visible" label="能力" name="capabilities">
          <div style="max-height:60vh;overflow:auto">
            <template v-for="(layer,index) in variousLayerProperty.description">
              <div :key="index" class="divContainter">
                {{layer.name}}
                <el-switch
                  v-model="layer.value"
                  disabled
                  active-color="#52993E"
                  inactive-color="#606266"
                  >
                </el-switch>
              </div>
            </template>
          </div>
        </el-tab-pane>
    </el-tabs>
    <slot name="layerContent"></slot>
    <SymbolDialog :visible="symbolDialogVisible" :mapview="mapview" :layer="currentSymbolLayer" :sublayer="currentConvertedLayer" :layerType="'map-image'" @handleCloseDialog="symbolDialogVisible=false"></SymbolDialog>
  </el-dialog>
</template>
<script>
import myconfig from "../mapconfig/myconfig";
import geographicCoordinateSystems from "../mapconfig/geographicCoordinateSystems";
import projectedCoordinateSystems from "../mapconfig/projectedCoordinateSystems";
import SymbolDialog from "../widgets/symbol/SymbolDialog";
import searchData from "../widgets/searchData";
export default {
  components: {SymbolDialog},
  props: {
    mapview:{
      type:Object,
    },
    layer:{
      type:Object,
    },
    visible: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return { 
      activeName:"general",//tab页
      propertyDialogVisible:false,
      symbolDialogVisible:false,//符号样式可见性
      currentSymbolLayer:{},//当前sublayer的符号
      currentConvertedLayer:{},//由sublayer转换到的featruelayer
      sublayersVisible:[],//mapimage的sublayer可见性
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
    handleClose(){//关闭窗体
      this.$emit('handleCloseDialog');
    }, 
    handOpen(){//打开窗体
      this.activeName="general";
      this.getSublayersVisible();
    },
    getFeatureLayerCapabilities(){//获得featurelayer能力
        let tempLayerProtery=[];
        let featrueLayerDes=this.layer.type=="feature"?true :false;
        if(featrueLayerDes){
          let supportsMObj={name:"支持M（测量）值能力：",description:this.layer.capabilities.data.supportsM?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.data.supportsM};
          let supportsZObj={name:"支持Z（高程）值能力：",description:this.layer.capabilities.data.supportsZ?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.data.supportsZ};
          let supportsAddObj={name:"添加要素能力：",description:this.layer.capabilities.operations.supportsAdd?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsAdd};
          let supportsDeleteObj={name:"删除要素能力：",description:this.layer.capabilities.operations.supportsDelete?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsDelete};
          let supportsUpdateObj={name:"更新要素能力：",description:this.layer.capabilities.operations.supportsUpdate?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsUpdate};
          let supportsEditingObj={name:"编辑要素能力：",description:this.layer.capabilities.operations.supportsEditing?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsEditing};
          let supportsCalculateObj={name:"字段计算能力：",description:this.layer.capabilities.operations.supportsCalculate?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsCalculate};
          
          let queryObj={name:"查询能力：",description:this.layer.capabilities.operations.supportsQuery?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsQuery};
          let supportsStatisticsObj={name:"高级查询能力（统计）：",description:this.layer.capabilities.query.supportsStatistics?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsStatistics};
          let supportDistinctByObj={name:"高级查询能力（支持Distinct）：",description:this.layer.capabilities.query.supportsDistinct?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsDistinct};
          let supportsOrderByObj={name:"高级查询能力（字段排序）：",description:this.layer.capabilities.query.supportsOrderBy ?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsOrderBy};
          let supportsPaginationObj={name:"高级查询能力（分页）：",description:this.layer.capabilities.query.supportsPagination?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsPagination};
          let supportsExtentObj={name:"高级查询能力（查询要素结果的范围）：",description:this.layer.capabilities.query.supportsExtent?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsExtent};
          let supportsDistanceObj={name:"高级查询能力（输入缓冲距离）：",description:this.layer.capabilities.query.supportsDistance?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsDistance};
          let supportsSqlExpressionObj={name:"高级查询能力（输入SQL表达式）：",description:this.layer.capabilities.query.supportsSqlExpression?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsSqlExpression};
          let supportsResultTypeObj={name:"高级查询能力（控制结果数量）：",description:this.layer.capabilities.query.supportsResultType?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsResultType};

          tempLayerProtery.push(supportsMObj,supportsZObj,supportsAddObj,supportsDeleteObj,supportsUpdateObj,supportsEditingObj,supportsCalculateObj,queryObj,supportsStatisticsObj,supportDistinctByObj,supportsOrderByObj,supportsPaginationObj,supportsExtentObj,supportsDistanceObj,supportsSqlExpressionObj,supportsResultTypeObj);
        }
        return tempLayerProtery;
    },
    getTileOrMapimageLayerCapabilities(){//获得tilelayer或者mapimage各能力
        let tempLayerProtery=[];
        let tileLayerDes=this.layer.type=="tile"||this.layer.type=="map-image"?true :false;
        if(tileLayerDes){
          let supportsDynamicLayersQueryObj={name:"添加动态图层能力：",description:this.layer.capabilities.exportMap.supportsDynamicLayers?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.exportMap.supportsDynamicLayers};
          let supportsModificationObj={name:"修改子图层能力：",description:this.layer.capabilities.exportMap.supportsModification?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.exportMap.supportsModification};
          let supportsSublayersChangesObj={name:"增删，排序子图层能力：",description:this.layer.capabilities.exportMap.supportsSublayersChanges ?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.exportMap.supportsSublayersChanges};
          let supportsSublayerDefinitionExpressionObj={name:"子图层定义表达式能力：",description:this.layer.capabilities.exportMap.supportsSublayerDefinitionExpression?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.exportMap.supportsSublayerDefinitionExpression};
          let supportsSublayerVisibilityObj={name:"子图层切换显隐能力：",description:this.layer.capabilities.exportMap.supportsSublayerVisibility?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.exportMap.supportsSublayerVisibility};
          let supportsQueryObj={name:"子图层查询能力：",description:this.layer.capabilities.operations.supportsQuery?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.operations.supportsQuery};
          let supportsExportMapObj={name:"导出图片能力：",description:this.layer.capabilities.operations.supportsExportMap?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.operations.supportsExportMap};
          let supportsExportTilesObj={name:"导出瓦片能力：",description:this.layer.capabilities.operations.supportsExportTiles?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.operations.supportsExportTiles};
          let exportTilesObj={name:"导出瓦片最大数：",description:this.layer.capabilities.exportTiles?this.layer.capabilities.exportTiles.maxExportTilesCount : 0,visible:this.layer.capabilities.exportTiles && tileLayerDes,value:this.layer.capabilities.exportTiles && tileLayerDes};
          let supportsTileMapObj={name:"描述瓦片地图能力：",description:this.layer.capabilities.operations.supportsTileMap ?"是":"否",visible:tileLayerDes,value:this.layer.capabilities.operations.supportsTileMap};

          tempLayerProtery.push(supportsDynamicLayersQueryObj,supportsModificationObj,supportsSublayersChangesObj,supportsSublayerDefinitionExpressionObj,supportsSublayerVisibilityObj,
          supportsQueryObj,supportsExportMapObj,supportsExportTilesObj,exportTilesObj,supportsTileMapObj);
        }
        return tempLayerProtery;
    },
    getCsvLayerCapabilities(){
        let tempLayerProtery=[];
        let featrueLayerDes=this.layer.type=="csv" ? true :false;
        if(featrueLayerDes){
          let supportsAttachmentObj={name:"支持附件能力：",description:this.layer.capabilities.data.supportsAttachment ?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.data.supportsAttachment };
          let supportsMObj={name:"支持M（测量）值能力：",description:this.layer.capabilities.data.supportsM?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.data.supportsM};
          let supportsZObj={name:"支持Z（高程）值能力：",description:this.layer.capabilities.data.supportsZ?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.data.supportsZ};
          
          let supportsAddObj={name:"添加要素能力：",description:this.layer.capabilities.operations.supportsAdd?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsAdd};
          let supportsDeleteObj={name:"删除要素能力：",description:this.layer.capabilities.operations.supportsDelete?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsDelete};
          let supportsUpdateObj={name:"更新要素能力：",description:this.layer.capabilities.operations.supportsUpdate?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsUpdate};
          let supportsEditingObj={name:"编辑要素能力：",description:this.layer.capabilities.operations.supportsEditing?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsEditing};
          let supportsCalculateObj={name:"字段计算能力：",description:this.layer.capabilities.operations.supportsCalculate?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsCalculate};
          let queryObj={name:"查询能力：",description:this.layer.capabilities.operations.supportsQuery?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsQuery};
          let supportsQueryAttachmentsObj={name:"查询附件能力：",description:this.layer.capabilities.operations.supportsQueryAttachments?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsQueryAttachments};
          let supportsValidateSqlObj={name:"Sql验证能力：",description:this.layer.capabilities.operations.supportsValidateSql?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.operations.supportsValidateSql};
         
          let supportsCentroidObj={name:"查询能力（要素质心）：",description:this.layer.capabilities.query.supportsCentroid?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsCentroid};
          let supportsDistanceObj={name:"查询能力（输入缓冲距离）：",description:this.layer.capabilities.query.supportsDistance?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsDistance};
          let supportsDistinctObj={name:"查询能力（支持Distinct）：",description:this.layer.capabilities.query.supportsDistinct?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsDistinct};
          let supportsDisjointSpatialRelationshipObj={name:"查询能力（空间关联关系）：",description:this.layer.capabilities.query.supportsDisjointSpatialRelationship ?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsDisjointSpatialRelationship};
          let supportsExtentObj={name:"查询能力（查询要素结果的范围）：",description:this.layer.capabilities.query.supportsExtent?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsExtent};
          let supportsGeometryPropertiesObj={name:"查询能力（Geometry属性）：",description:this.layer.capabilities.query.supportsGeometryProperties?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsGeometryProperties};
          let supportsHavingClauseObj={name:"查询能力（服务图层查询条件）：",description:this.layer.capabilities.query.supportsHavingClause?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsHavingClause};
          let supportsOrderByObj={name:"查询能力（字段排序）：",description:this.layer.capabilities.query.supportsOrderBy ?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsOrderBy};
          let supportsPaginationObj={name:"查询能力（分页）：",description:this.layer.capabilities.query.supportsPagination?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsPagination};
          let supportsPercentileStatisticsObj={name:"查询能力（统计）：",description:this.layer.capabilities.query.supportsPercentileStatistics?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsPercentileStatistics};
          let supportsQueryGeometryObj={name:"查询能力（查询Geometry）：",description:this.layer.capabilities.query.supportsQueryGeometry?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsQueryGeometry};
          let supportsQuantizationObj={name:"查询能力（几何图形投影在虚拟的网格上）：",description:this.layer.capabilities.query.supportsQuantization?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsQuantization};
          let supportsQuantizationEditModeObj={name:"查询能力（Quantization在编辑模式下）：",description:this.layer.capabilities.query.supportsQuantizationEditMode?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsQuantizationEditMode};
          let supportsResultTypeObj={name:"查询能力（控制结果数量）：",description:this.layer.capabilities.query.supportsResultType?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsResultType};
          let supportsSqlExpressionObj={name:"查询能力（输入SQL表达式）：",description:this.layer.capabilities.query.supportsSqlExpression?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsSqlExpression};
          let supportsStandardizedQueriesOnlyObj={name:"查询能力（标准化查询）：",description:this.layer.capabilities.query.supportsStandardizedQueriesOnly?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsStandardizedQueriesOnly };
          let supportsStatisticsObj={name:"查询能力（统计）：",description:this.layer.capabilities.query.supportsStatistics?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsStatistics};
          let supportsHistoricMomentObj={name:"查询能力（历史查询）：",description:this.layer.capabilities.query.supportsHistoricMoment?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.query.supportsHistoricMoment};
          
          let queryRelatedSupportsCountObj={name:"关联查询能力（查询结果数量）：",description:this.layer.capabilities.queryRelated.supportsCount?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.queryRelated.supportsCount};
          let queryRelatedSupportsOrderByObj={name:"关联查询能力（查询结果排序）：",description:this.layer.capabilities.queryRelated.supportsOrderBy?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.queryRelated.supportsOrderBy};
          let queryRelatedsupportsPaginationObj={name:"关联查询能力（查询结果分页）：",description:this.layer.capabilities.queryRelated.supportsPagination?"是":"否",visible:featrueLayerDes,value:this.layer.capabilities.queryRelated.supportsPagination};

          tempLayerProtery.push(supportsAttachmentObj,supportsMObj,supportsZObj,supportsAddObj,supportsDeleteObj,supportsUpdateObj,supportsEditingObj,supportsCalculateObj,
            queryObj,supportsQueryAttachmentsObj,supportsCentroidObj,supportsDistanceObj,supportsDistinctObj,supportsDisjointSpatialRelationshipObj,supportsExtentObj,supportsGeometryPropertiesObj,
            supportsHavingClauseObj,supportsOrderByObj,supportsPaginationObj,supportsPercentileStatisticsObj,supportsQueryGeometryObj,supportsQuantizationObj,supportsQuantizationEditModeObj,
            supportsResultTypeObj,supportsSqlExpressionObj,supportsStandardizedQueriesOnlyObj,supportsStatisticsObj,supportsHistoricMomentObj,queryRelatedSupportsCountObj,queryRelatedSupportsOrderByObj,queryRelatedsupportsPaginationObj);
        }
      return tempLayerProtery;
    },
    getCoordinateSystemDescribe(wkid){
      let text="";
      let obj;
      if(this.layer.spatialReference.isGeographic){//地理坐标系统
        obj =geographicCoordinateSystems.geographicCoordinateSystems.find((item)=>item.wkid==wkid);
      }else{//投影坐标系统
        obj =projectedCoordinateSystems.projectedCoordinateSystems.find((item)=>item.wkid==wkid);
      }
      text= obj?`${obj.name}，${obj.text}`:"";

      return text;
    },
    showSublayerSymbol(layer){
      layer.createFeatureLayer().then(function(featureLayer){
        return featureLayer.load(); 
      }).then(this.sublayerToFeatureLayrCallBack);
      this.currentConvertedLayer=layer;
    },
    showSublayerInfo(layer){//查看属性信息
      this.propertyDialogVisible=false;
      let query = layer.createQuery();
      query.outFields = ["*"];
      let isTotal=true;
      this.openFullScreen(2000)
      searchData.GetSubLayerInfo(layer.url).then(info=>{
        if(info.supportsPagination){//分页
            isTotal=false
            query.start=0;
            query.num=100
            searchData.SearchlayerCount(layer).then(count=>{
              this.$emit('getSerachCount',count);
            });
        }
        layer.queryFeatures(query).then((response)=>{
          if(response.features){
            let dtresult={id:`${layer.layer.id}/${layer.id}`,name:layer.title,data:response.features.map(item=>item.attributes)};
            let dtAttInfo=dtresult.length==0?[]:[dtresult];
            this.$emit('showAnalyseTable',"属性表",dtAttInfo,true,false,isTotal);
          }
        })
      })
    },
    sublayerToFeatureLayrCallBack(featureLayer){//sublayer转换成featurelayer
        this.currentSymbolLayer=featureLayer;
        this.symbolDialogVisible=true;
    },
    getSublayersVisible() {//mapImagelayer图层的sublayer可见性
      let tempLayerProtery=[];
      if(this.layer.type=="map-image" || this.layer.type=="tile"){
        tempLayerProtery=this.layer.sublayers.items.map(sublayer=>sublayer.visible)
      }
      this.sublayersVisible=tempLayerProtery
    },
    toggleSublayerVisble(visible,sublyerId){//切换mapimage子图层可见性
        let sublayer = this.layer.findSublayerById(parseInt(sublyerId));
        sublayer.visible = !sublayer.visible;
    },
  },
  computed: {
    layerCertainProtery: function () {//各类图层的基础属性
        let tempLayerProtery=[];
        let tempLayerNameObj={name:"图层名称：",description: this.layer.title?this.layer.title:"未指定",visible:true};
        let tempLayerTypeObj={name:"图层类型：",description:this.layer.type?myconfig.mapLayerType[this.layer.type]:"未指定",visible:true};
        let coordinateSystemDescribe="";
        let tempText="";
        if(this.layer.spatialReference && this.layer.spatialReference.wkid){          
          tempText= this.getCoordinateSystemDescribe(this.layer.spatialReference.wkid);
        }
        let spatialReferenceText=tempText==""?"":`（${tempText}）`;
        let tempLayerSprObj={name:"坐标系统：",description:this.layer.spatialReference?(this.layer.spatialReference.wkid?this.layer.spatialReference.wkid+spatialReferenceText:this.layer.spatialReference.wkt):"未知的",visible:this.layer.spatialReference?true:false};
        let tempLayerSprTypeObj={name:"坐标系统类型：",description:this.layer.spatialReference && this.layer.spatialReference.isGeographic?"地理坐标系统":"投影坐标系统",visible:this.layer.spatialReference?true:false};
        let tempLayerLoadedObj={name:"加载：",description: this.layer.loaded ?"加载成功":"加载失败",visible:true};
        // let tempLayerVisibleObj={name:"可见性：",description:this.layer.visible?"可见":"不可见",visible:true};
        let featrueLayerDes=this.layer.type=="feature"?true :false;
        let tempLayerUrl=this.layer.url?`${encodeURI(this.layer.url)}`:"";
        if(this.layer.type=="feature" && this.layer.url){
          tempLayerUrl=`${tempLayerUrl}/${this.layer.layerId}`;
        }
        let tempLayerUrlObj={name:"服务地址：",description:tempLayerUrl,visible:tempLayerUrl==""?false:true}; 
        let tempLayerGeometryType=this.layer.geometryType?myconfig.geometryType[this.layer.geometryType]:"";
        let tempLayerGeometryTypeObj={name:"要素类型：",description:tempLayerGeometryType,visible:tempLayerGeometryType==""?false:true};
        let tempLayerCustomSource=this.layer.customBZ?this.layer.customBZ.source:"";
        let tempLayerCustomSourceObj={name:"要素来源：",description:tempLayerCustomSource,visible:tempLayerCustomSource==""?false:true};
        // let tempLayermaxScaleObj={name:"最大可视比例：",description:this.layer.maxScale?this.layer.maxScale:"",visible:this.layer.maxScale?true:false};
        // let tempLayerminScaleObj={name:"最小可视比例：",description:this.layer.minScale?this.layer.minScale:"",visible:this.layer.minScale?true:false};
        tempLayerProtery.push(tempLayerNameObj,tempLayerTypeObj,tempLayerSprObj,tempLayerSprTypeObj,tempLayerLoadedObj,tempLayerUrlObj,tempLayerGeometryTypeObj,tempLayerCustomSourceObj);
        if(this.layer.type=="feature"){
          let layerIdObj={name:"图层ID：",description:this.layer.layerId,visible:true};
          let objectIdFieldObj={name:"图层字段主键：",description:this.layer.objectIdField,visible:true};
          // let maxRecordCountObj={name:"服务器返回的最大记录数：",description:this.layer.capabilities.query.maxRecordCount?this.layer.capabilities.query.maxRecordCount:"",visible:featrueLayerDes?true:false};
          let hasMObj={name:"是否具有M（测量）值：",description:this.layer.hasM?"是":"否",visible:true};
          let hasZObj={name:"是否具有Z（高程）值：",description:this.layer.hasZ?"是":"否",visible:true};
          tempLayerProtery.push(layerIdObj,objectIdFieldObj,hasMObj,hasZObj);
        }else if(this.layer.type=="map-image"){
          let dpiObj={name:"分辨率：",description:this.layer.dpi,visible:true};
          let imageFormat={name:"格式：",description:this.layer.imageFormat.toUpperCase(),visible:true};
          let imageMaxHeightObj={name:"图像最大高度：",description:this.layer.imageMaxHeight,visible:true};
          let imageMaxWidthObj={name:"图像最大宽度：",description: this.layer.imageMaxWidth,visible:true};
          tempLayerProtery.push(dpiObj,imageFormat,imageMaxHeightObj,imageMaxWidthObj);     
        }else if(this.layer.type=="imagery"){
          let objectIdFieldObj={name:"图层字段主键：",description:this.layer.objectIdField,visible:this.layer.objectIdField?true:false};
          let bandCountObj={name:"波段数量：",description:this.layer.bandCount?this.layer.bandCount:0,visible:this.layer.bandCount?true:false};
          let formatObj={name:"格式：",description:this.layer.format.toUpperCase(),visible:true};
          let compressionQualityObj={name:"压缩质量：",description:this.layer.compressionQuality?this.layer.compressionQuality:0,visible:this.layer.compressionQuality?true:false};
          let imageMaxHeightObj={name:"图像最大高度：",description:this.layer.imageMaxHeight,visible:true};
          let imageMaxWidthObj={name:"图像最大宽度：",description: this.layer.imageMaxWidth,visible:true};
          let pixelTypeObj={name:"像元值类型：",description: `${this.layer.pixelType}（${myconfig.pixelType[this.layer.pixelType]}）`,visible:true};
          tempLayerProtery.push(objectIdFieldObj,bandCountObj,formatObj,compressionQualityObj,imageMaxHeightObj,imageMaxWidthObj,pixelTypeObj);
        }
         return tempLayerProtery;
    },
    layerFullExtent:function () {//图层范围
      let tempLayerFullExtent=this.layer.fullExtent?`xmin :${this.layer.fullExtent.xmin};ymin :${this.layer.fullExtent.ymin};xmax :${this.layer.fullExtent.xmax};ymax :${this.layer.fullExtent.ymax}`:"";
      let tempLayerFullExtentxmin=this.layer.fullExtent?`xmin :${this.layer.fullExtent.xmin}`:"";
      let tempLayerFullExtentymin=this.layer.fullExtent?`ymin :${this.layer.fullExtent.ymin}`:"";
      let tempLayerFullExtentxmax=this.layer.fullExtent?`xmax :${this.layer.fullExtent.xmax}`:"";
      let tempLayerFullExtentymax=this.layer.fullExtent?`ymax :${this.layer.fullExtent.ymax}`:"";
      let tempLayerFullExtentlObj={name:"图层范围：",description:[tempLayerFullExtentxmin,tempLayerFullExtentymin,tempLayerFullExtentxmax,tempLayerFullExtentymax],visible:tempLayerFullExtent==""?false:true};
      return tempLayerFullExtentlObj;
    },
    layerSupportedOperations:function () {//图层支持的操作
      let tempLayerProtery=[];
      if(this.layer.type=="feature" && this.layer.url){
        let tempLayerQuery={label:"查询",herfUrl:`${this.layer.url}/${this.layer.layerId}/query`,visible:this.layer.capabilities.operations.supportsQuery};
        let tempLayerGenerateRenderer={label:"渲染",herfUrl:`${this.layer.url}/${this.layer.layerId}/generateRenderer`,visible:!this.layer.isTable};
        let tempLayerReturnUpdates={label:"更新范围",herfUrl:`${this.layer.url}/${this.layer.layerId}/?f=pjson&returnUpdates=true&`,visible:true};
        tempLayerProtery.push(tempLayerQuery,tempLayerGenerateRenderer,tempLayerReturnUpdates);
      }else if((this.layer.type=="tile"||this.layer.type=="map-image" )&& this.layer.url){
        let tempLayerIdentify ={label:"识别",herfUrl:`${this.layer.url}/identify`,visible:true};
        let tempLayerFind={label:"查找",herfUrl:`${this.layer.url}/find`,visible:true};
        let tempLayerReturnUpdates={label:"更新范围",herfUrl:`${this.layer.url}/?f=pjson&returnUpdates=true&`,visible:true};
        tempLayerProtery.push(tempLayerIdentify,tempLayerFind,tempLayerReturnUpdates);
      }else if(this.layer.type=="imagery" && this.layer.url){
        let tempLayerIdentify ={label:"识别",herfUrl:`${this.layer.url}/identify`,visible:true};
        let tempLayerMeasure={label:"测量",herfUrl:`${this.layer.url}/measure`,visible:true};
        let tempLayerComputeHistograms={label:"计算直方图",herfUrl:`${this.layer.url}/computeHistograms`,visible:true};
        tempLayerProtery.push(tempLayerIdentify,tempLayerMeasure,tempLayerComputeHistograms);
      }
      return tempLayerProtery;
    },
    layerFields:function () {//图层字段(featurelayer、imageLayer、kmlLayer)
      let fields=[]; 
      if(this.layer.type=="feature"||this.layer.type=="csv" || this.layer.type=="graphics"){
        let fieldsInfo=[];
        if(this.layer.fields){
            fieldsInfo=this.layer.fields.map((field)=>{
              let str=`类型：${field.type}，别名：${field.alias}`;
              field.length!=-1?str=`${field.name}（${str}，字段长度：${field.length}）`:str=`${field.name}（${str}）`;
              return str;
            })
        }
        if(fieldsInfo.length>0){
          fields.push({name:"字段：",description:fieldsInfo,visible:true});
        };
      }else if(this.layer.type=="imagery"){
        let fieldsInfo=[];
        let rasterFields=[];
        fieldsInfo=this.layer.fields.map((field)=>{
          let str=`类型：${field.type}，别名：${field.alias}`;
          field.length!=-1?str=`${field.name}（${str}，字段长度：${field.length}）`:str=`${field.name}（${str}）`;
          return str;
        })
        if(fieldsInfo.length>0){
          fields.push({name:"字段：",description:fieldsInfo,visible:true});
        };        
        rasterFields=this.layer.rasterFields.map((field)=>{
          let str=`类型：${field.type}，别名：${field.alias}`;
          field.length!=-1?str=`${field.name}（${str}，字段长度：${field.length}）`:str=`${field.name}（${str}）`;
          return str;
        });
         if(rasterFields.length>0){
          fields.push({name:"栅格目录字段：",description:rasterFields,visible:true});
        };
      }
      return fields;
    },
    layerFieldsAndExtentInfo:function () {//featurelayer字段,范围,因样式，tab页不同，弃用
      let tempLayerProtery=[];
      let tempLayerFullExtent=this.layer.fullExtent?`xmin :${this.layer.fullExtent.xmin};ymin :${this.layer.fullExtent.ymin};xmax :${this.layer.fullExtent.xmax};ymax :${this.layer.fullExtent.ymax}`:"";
      let tempLayerFullExtentxmin=this.layer.fullExtent?`xmin :${this.layer.fullExtent.xmin}`:"";
      let tempLayerFullExtentymin=this.layer.fullExtent?`ymin :${this.layer.fullExtent.ymin}`:"";
      let tempLayerFullExtentxmax=this.layer.fullExtent?`xmax :${this.layer.fullExtent.xmax}`:"";
      let tempLayerFullExtentymax=this.layer.fullExtent?`ymax :${this.layer.fullExtent.ymax}`:"";
      let tempLayerFullExtentlObj={name:"图层范围：",description:[tempLayerFullExtentxmin,tempLayerFullExtentymin,tempLayerFullExtentxmax,tempLayerFullExtentymax],visible:tempLayerFullExtent==""?false:true};

      let featrueLayerDes=this.layer.type=="feature"?true :false;
      let fieldsInfo=[];
      if(featrueLayerDes){
        fieldsInfo=this.layer.fields.map((field)=>{
          let str=`类型：${field.type}，别名：${field.alias}`;
          field.length!=-1?str=`${field.name}（${str}，字段长度：${field.length}）`:str=`${field.name}（${str}）`;
          return str;
        })
      }
      let tempLayerfieldsInfoObj={name:"字段：",description:fieldsInfo,visible:featrueLayerDes};
      tempLayerProtery.push(tempLayerFullExtentlObj,tempLayerfieldsInfoObj)

      return tempLayerProtery;
    },
    tileLayerCertainProtery:function () {//tileLayer图层tile属性
       let tempLayerProtery=[];
       if(this.layer.type=="tile"){
          let tileInfo=this.layer.tileInfo;
          let tileInfoHeightObj={name:"高度：",description: tileInfo.size.length>0?tileInfo.size[0]:"",visible:true};
          let tileInfoWidthObj={name:"宽度：",description: tileInfo.size.length>0?tileInfo.size[0]:"",visible:true};
          let tileInfoDpitObj={name:"分辨率：",description: tileInfo.dpi,visible:true};
          let tileInfoFormatObj={name:"格式：",description: tileInfo.format.toUpperCase(),visible:true};
          let tileInfoOriginObj={name:"切片初始点位置：",description: `X：${tileInfo.origin.x}，Y：${tileInfo.origin.y}`,visible:true};
          let tileInfoLogsLength={name:"分块级别：",description: tileInfo.lods.length,visible:true};
          tempLayerProtery.push(tileInfoHeightObj,tileInfoWidthObj,tileInfoDpitObj,tileInfoFormatObj,tileInfoOriginObj,tileInfoLogsLength);
       }
      return tempLayerProtery;
    },
    tileLayerTileLodsProtery:function () {//tileLayer图层tile lods等级属性
      let tempLayerProtery={} 
      if(this.layer.type=="tile"){
          let tileInfo=this.layer.tileInfo;
          let tileInfoLods=tileInfo.lods.map((lod)=>{
            return `级别：${lod.level}，分辨率：${lod.resolution}，比例尺：${lod.scale}`
          })
          tempLayerProtery.name="";
          tempLayerProtery.description=tileInfoLods;
          tempLayerProtery.visible=true;
      }
      return tempLayerProtery;
    },
    sublayersProtery: function () {//mapImagelayer图层的sublayer子图层属性
      let tempLayerProtery=[];
      if(this.layer.type=="map-image" || this.layer.type=='tile'){
        for (let i = this.layer.sublayers.items.length-1; i >= 0; i--) {
          let sublayer = this.layer.sublayers.items[i];
          let sublayersObj=[] ;
          let id= {name:"子图层ID：",description:sublayer.id,visible:true};
          let title= {name:"子图层名称：",description:sublayer.title,visible:true};
          let mapSourceType= {name:"子图层数据源：",description:sublayer.source && sublayer.source.mapLayerId?"动态地图图层(DynamicMapLayer)":"",visible:sublayer.source && sublayer.source.mapLayerId?true:false};
          let dataSourceType= {name:"子图层数据源：",description:sublayer.source && sublayer.source.dataSource?"动态数据图层(DynamicDataLayer)" :"",visible:sublayer.source && sublayer.source.dataSource?true:false};
          let sourceType= {name:"子图层数据源类型：",description:sublayer.source.type?sublayer.source.type:"",visible:sublayer.source.type?true:false};
          let dataSourceName= {name:"工作空间类型：",description:sublayer.source && sublayer.source.dataSource && sublayer.source.dataSource.dataSourceName?"数据库、文件地理数据库、shapefile 或栅格工作空间":"",visible:sublayer.source && sublayer.source.dataSource && sublayer.source.dataSource.dataSourceName?true:false};
          let workspaceId= {name:"工作空间ID：",description:sublayer.source && sublayer.source.dataSource?sublayer.source.dataSource.workspaceId:"",visible:sublayer.source && sublayer.source.dataSource && sublayer.source.dataSource.workspaceId?true:false};
          let fileName= {name:"文件名：",description:sublayer.source && sublayer.source.dataSource?sublayer.source.dataSource.dataSourceName:"",visible:sublayer.source && sublayer.source.dataSource && sublayer.source.dataSource.dataSourceName?true:false};
          let fileType= {name:"文件类型：",description:sublayer.source && sublayer.source.dataSource && sublayer.source.dataSource.type?sublayer.source.dataSource.type:"",visible:sublayer.source && sublayer.source.dataSource && sublayer.source.dataSource.type?true:false};
          sublayersObj.push(id,title,mapSourceType,dataSourceType,sourceType,dataSourceName,workspaceId,fileName,fileType);
          tempLayerProtery.push(sublayersObj);
        }
      }
      return tempLayerProtery;
    },
    variousLayerProperty:function () {//各类图层拥有的能力
      let tempLayerProtery={};
      if(this.layer.type=="feature"){
        tempLayerProtery.name="要素图层（FeatureLayer）：";
        tempLayerProtery.description=this.getFeatureLayerCapabilities();
        tempLayerProtery.visible=true;
      }else if(this.layer.type=="tile"){
        tempLayerProtery.name="瓦片图层（TileLayer）：";
        tempLayerProtery.description=this.getTileOrMapimageLayerCapabilities();
        tempLayerProtery.visible=true;
      }else if(this.layer.type=="map-image"){
        tempLayerProtery.name="动态图层（MapImageLayer）：";
        tempLayerProtery.description=this.getTileOrMapimageLayerCapabilities();
        tempLayerProtery.visible=true;
      }else if(this.layer.type=="csv"){
        tempLayerProtery.name="CSVLayer图层（CSVLayer）：";
        tempLayerProtery.description=this.getCsvLayerCapabilities();
        tempLayerProtery.visible=true;
      }else{
        tempLayerProtery.name="";
        tempLayerProtery.description="";
        tempLayerProtery.visible=false;
      }
      return tempLayerProtery;
    },
  },
  watch:{
   visible :function (val, oldVal) {//监视组件是否关闭，若关闭，取消组件
      if(val){
        this.propertyDialogVisible=true;
      }
    },
  },
}
</script>
<style  scoped>
.extent{
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.el-tag + .el-tag {
    margin-left: 10px;
    margin-bottom: 10px;
}
.divContainter{
  width:60%;
  margin-left: 10px;
  margin-bottom: 10px;
  /* display: flex;
  justify-content: space-between;
  border-bottom: 1px solid gray; */
}
.tile{
  margin-left: 20px;
}
.supportOperations{
  margin-right: 20px;
}
.bottomClass{
  margin-bottom: 5px;
}
</style>
