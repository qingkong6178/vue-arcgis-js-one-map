import myconfig from "./myconfig"
//传入数组类型,通过第一个数组主键，或得另一个数组属性值，返回所有属性值的数组
function getArrPro(ary,mapid) {
  let tararr=myconfig.layerOpacity;
  let layerOpacity=[];
  for (let i = 0; i < ary.length; i++) {
    for (let key in ary[i]) {
      if (key==mapid) {
        var ret2 = tararr.find((v) => {
          return v[ary[i][key]];
      });
        if(ret2!=undefined)
        {
          if(!layerOpacity.includes(ret2[ary[i][key]]))
          {
            layerOpacity.push(ret2[ary[i][key]]);
          }
        }
      }
    }
  }
  return layerOpacity;
}
//通过数组属性的值,返回另一个属性名对应值
function getArrProkv(ary,proId,proIdValue,proName) {
  let proNameValue=""; 
  for (let i = 0; i < ary.length; i++) {
    for (let key in ary[i]) {
      if(key==proId)
      {
        if(ary[i][key]==proIdValue)
        {
          proNameValue=ary[i][proName];
          break;
        }
      }
    }
  }
  return proNameValue;
}
//对象中查找键对应的值
function parseJson(jsonObj, key, value) {
  // 循环所有键
  for (let v in jsonObj) {
    let element = jsonObj[v]
    if(element[key]==value)
    {
      return element;
    }
  }
  return "";
}
//将当前url处理成get带参数形式
function getUrl(layerServiceType,oldUrl,prama)
{
  var newUrl;
  if(oldUrl.indexOf("?")==-1)
  {
    newUrl=oldUrl.trim()+prama;
  }
  else{
    newUrl=oldUrl;
  }
 return newUrl;
}
//后台传回的信息info，通过dataTpye(服务或是layers),判断图层类型
function getType(dataTpye,singleFusedMapCache,isEqualSprWithmap=true)
{
  let serviceOrLayerType;
  if(dataTpye.toLowerCase()=="mapserver")//表示服务
  {
    if(JSON.parse(singleFusedMapCache)&&isEqualSprWithmap)//因为后台传过来的是字符串类型
    {
      serviceOrLayerType="TileLayer";
    }
    else{
      serviceOrLayerType="MapImageLayer";
    }
  }else if(dataTpye.toLowerCase()=="imageserver"){
    serviceOrLayerType="ImageryLayer";
  }else if(dataTpye.toLowerCase()=="featureserver"){//图层
    serviceOrLayerType="FeatureLayer"
  }else if(dataTpye.toLowerCase()=="wmsserver"){
    serviceOrLayerType="wms"
  }else if(serviceOrLayerType="wmtsserver"){
    serviceOrLayerType="wmts"
  }
  return  serviceOrLayerType;
}

 /**
	 * @param {Object} json
	 * @param {Object} type： 默认不传 ==>全部小写;传1 ==>全部大写;传2 ==>首字母大写
	 * 将json的key值进行大小写转换
	 */
  function jsonKeysToCase(json,type){
		if(typeof json == 'object'){
			var tempJson = JSON.parse(JSON.stringify(json));
			toCase(tempJson);
			return tempJson;
		}else{
			return json;
		}		
		function toCase(json){
			if(typeof json == 'object'){
				if(Array.isArray(json)){
					json.forEach(function(item){
						toCase(item);
					})
				}else{
					for (var key in json){
						var item = json[key];
						if(typeof item == 'object'){
							toCase(item);
						}
						delete(json[key]);
						switch (type){
							case 1:
								//key值全部大写
								json[key.toLocaleUpperCase()] = item;
								break;
							case 2:
								//key值首字母大写，其余小写
								json[key.substring(0,1).toLocaleUpperCase() + key.substring(1).toLocaleLowerCase()] = item;
								break;
							default:
								//默认key值全部小写
								json[key.toLocaleLowerCase()] = item;
								break;
						}
					}
				}
			}
		}
	}
export default  {
  getArrPro,
  getUrl,
  getArrProkv,
  parseJson,
  getType,
  jsonKeysToCase,
};
