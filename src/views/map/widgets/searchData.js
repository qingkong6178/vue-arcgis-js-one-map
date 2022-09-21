/*属性查询*/
import myconfig from "../mapconfig/myconfig"
import QueryTask from "esri/tasks/QueryTask";
import Query from "esri/tasks/support/Query";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import projection from "../core/Projection";
import axios from 'axios';

async function SearchByAttribute(mapview,layer,sqlWhere,openPopup=true){//通过输入查询条件，查询
    let returnGraphics;
    if(mapview!=null){
            mapview.graphics.removeAll();
            let boundaryLayer = layer;
            let queryTask = new QueryTask({
                url: boundaryLayer.url + "/" + boundaryLayer.layerId
            });
            let featureQuery = new Query();
            //查询条件
            if (sqlWhere) {
                let popupTemplate=getPopuptemplate(layer);
                featureQuery.where =sqlWhere;
                featureQuery.outSpatialReference = mapview.spatialReference;
                featureQuery.outFields = ["*"];
                featureQuery.returnGeometry = true;
                await queryTask.execute(featureQuery).then(function (result) {
                    let features = result.features;
                    if(openPopup){
                        if (features.length > 0) {
                            let simpleSymbol=getSelectSymbolType(features[0].geometry.type);
                            simpleSymbol.spatialReference=mapview.spatialReference;
                            //给每个要素添加符号
                            let graphics = features.map(function (feature) {
                                feature.symbol = simpleSymbol;
                                feature.popupTemplate = popupTemplate;
                                return feature;
                            });
                            //添加新选择的,并将试图转到新的视图
                            mapview.graphics.addMany(graphics);
                            mapview.goTo({
                                target: graphics
                            }).then(function() {
                                mapview.popup.open({
                                    features:graphics,
                                    featureMenuOpen:true,
                                    updateLocationEnabled:true,
                                });
                            });
                        }
                    }else{
                        returnGraphics=features;
                    }
                });
                return returnGraphics;
            }
    }
}

function getSelectSymbolType(type){
    let symbol;
    switch (type){
     case "point":
     case "multipoint":
        symbol=new SimpleMarkerSymbol(myconfig.widgetOnScreen.attributesearch.simpleMarkerSymbol);
        break;
     case "polyline":
        symbol=new SimpleLineSymbol(myconfig.widgetOnScreen.attributesearch.simpleLineSymbol);
        break;
     case "polygon":
        symbol=new SimpleFillSymbol(myconfig.widgetOnScreen.attributesearch.simplefillsymbol);
        break;
      default:
    }
   return symbol
}
function getPopuptemplate(layer){//获取popuptemplate模板
    let layerPopuptemplate={
        title:layer.title,
        content:[{
            type:"fields",
            fieldInfos: layer.fields.filter(field=>field.type!="esriFieldTypeGeometry" && field.type!="geometry").map(field=>{
                return {
                    fieldName:field.name,
                    label:field.alias
                }
            })
          }
        ]
     }
    return layerPopuptemplate;
}
function CancleSearch(mapview){
    mapview.popup.close();
    mapview.graphics.removeAll();
}

//通过属性，查找featureLayer中的feature 有或没有服务地址layer.url都适用
async  function SearchFeatures(mapview,featurlayer,sqlWhere,outFields,addFeatures=true,showFeatures=true){
    let returnGraphics;
    let query = featurlayer.createQuery();
    query.where = sqlWhere;
    query.outFields = outFields;
    await  featurlayer.queryFeatures(query)
    .then(function(response){
        if(addFeatures){
            displayResults(mapview,response,showFeatures)
        }else{
            returnGraphics=response.features;
        }
    }).catch(function (error) {
        console.log(error);
    });
    return returnGraphics;
}
function SearchSublayerFeatures(mapview,layer,sqlWhere,outFields){
    mapview.graphics.removeAll();
    let query = layer.createQuery();
    query.where = sqlWhere;
    query.outFields = outFields;
    layer.queryFeatures(query)
    .then(function(response){
        let simpleSymbol=getSelectSymbolType(response.features[0].geometry.type);
        simpleSymbol.spatialReference=mapview.spatialReference;
        GetSubLayerInfo(layer.url).then(info=>{
           let popupTemplate= getSublayerPopuptemplate(layer.title,info.fields)
           let features = response.features.map(function(graphic) {
                graphic.symbol = simpleSymbol;
                graphic.popupTemplate = popupTemplate;
                graphic.geometry=projection.project.project(graphic.geometry,mapview.spatialReference);
                return graphic;
            });
            mapview.graphics.addMany(features);
            mapview.goTo({target: features}).then(function() {
                mapview.popup.open({
                    features:features,
                    featureMenuOpen:true,
                    updateLocationEnabled:true,
                });
            });
        })
    }).catch(function (error) {
        console.log(error);
    });
}
function getSublayerPopuptemplate(title,fields){
    return {
        title:title,
        content:[{
            type:"fields",
            fieldInfos:fields.map(field=>{
                return {
                    fieldName:field.name,
                    label:field.alias
                }
            })
        }]
    };
}
function displayResults(mapview,results,showFeatures) {
    mapview.graphics.removeAll();
    let simpleSymbol=getSelectSymbolType(results.features[0].geometry.type);
    simpleSymbol.spatialReference=mapview.spatialReference;
    let proj=projection.project;
    let features = results.features.map(function(graphic) {
        graphic.symbol = simpleSymbol;
        graphic.geometry=proj.project(graphic.geometry,mapview.spatialReference);
        return graphic;
    });
    //添加新选择的,并将试图转到新的视图
    if(showFeatures){
      mapview.graphics.addMany(features);
    }
    mapview.goTo({target: features});
}
//查看featurelayer的总条数
async function SearchFeaturelayerCount(featurlayer){
    let sum=0;
    let queryTask = new QueryTask(`${featurlayer.url}/${featurlayer.layerId}`);
    await queryTask.executeForCount({
            where: "1=1"
        }).then(function(count){
            sum=count;
        }, function(error){
            console.log(error); // Will print error in console if unsupported layers are used
        });
    return sum;
}
//查看sublayer的总条数
async function SearchlayerCount(featurlayer){
    let sum=0;
    let queryTask = new QueryTask(`${featurlayer.url}`);
    await queryTask.executeForCount({
            where: "1=1"
        }).then(function(count){
            sum=count;
        }, function(error){
            console.log(error); // Will print error in console if unsupported layers are used
        });
    return sum;
}
//分页查询featurelayer的属性数据，只适用于有服务地址的
async function SearchFeaturesOfPaging(mapview,featurlayer,sqlWhere,outFields,page,pagecount,addFeatures=true){//page表示页数，pagecount表示每页条数
    let returnGraphics;
    let query = featurlayer.createQuery();
    query.where = sqlWhere;
    let tempPage=page<1?1:page;
    query.start=(tempPage-1)*pagecount;
    query.num=pagecount
    query.outFields = outFields;
    await featurlayer.queryFeatures(query)
    .then(function(response){
        if(addFeatures){
            displayResults(mapview,response,true)
        }else{
            returnGraphics=response.features;
        }
    }).catch(function (error) {
        console.log(error);
    });
    return returnGraphics;
}
async function GetSubLayerInfo(url){
    let info={fields:[],supportsPagination:false}
    await axios({
        method:"get",
        url:`${url}?f=pjson`,
    }).then((response)=> {
        if(response.status==200){
            info.fields= response.data.fields.filter(field=>field.type!="esriFieldTypeGeometry");
            info.supportsPagination=response.data.advancedQueryCapabilities.supportsPagination
        }
    })
    return info
}

export default {
    SearchByAttribute,
    CancleSearch,
    SearchFeatures,
    SearchFeaturelayerCount,
    SearchlayerCount,
    SearchFeaturesOfPaging,
    SearchSublayerFeatures,
    GetSubLayerInfo,
}
