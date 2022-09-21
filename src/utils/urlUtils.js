/// protocol://user:passwd@host:port/path?queryParams

var urlProvider=function(url){
  this.isURL=false;
  this.protocol="";
  this.hostName="";
  this.domain="";
  this.port=80;
  this.host=urlProvider.getHost(url);
  this.origin="";
  this.pathname="";
  this.queryString="";
  this.queryParam={};
  this.URL="";
}

var prototypeObject ={};
prototypeObject.includeUser=function(){

}

prototypeObject.includeUserAndPasswd=function(){

}

prototypeObject.getHost=function(url){
  if(url){
    var hostStratIndex=url.indexOf("://")+3;
    var hostEndIndex=url.indexOf("/",hostStratIndex);
    hostStratIndex=hostStratIndex<0?0:hostStratIndex;
    hostEndIndex=hostEndIndex>hostStratIndex?hostEndIndex:hostStratIndex;
    var hostString=url.split(hostStratIndex,hostEndIndex);
  }
  else{
    if(this && this.host){
      return this.host;
    }
    return null;
  }
};

prototypeObject.repaireUrl=function(){
  if(this.isURL){

  }
};


function CheckUrl(url){
  var result=false;
  var url
  try{
    url=new URL(url);
  }
  catch(ex){
    return result;
  }
  if(url.protocol && url.hostName){
    result=true;
  }
  return result;
}

/**
* 验证是否为网址URL
*/
function CheckURL(strValue) {
  var regTextUrl = /^(file|https|http|ftp|rtsp|mms|telnet|news|wais|mailto):\/\/(.+)$/;
  return regTextUrl.test(strValue);
}

// 验证是否为url
function IsURL (str_url) { 
  var strRegex = '^((file|https|http|ftp|rtsp|mms|telnet|news|wais|mailto)?://)'
  + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
  + '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
  + '|' // 允许IP和DOMAIN（域名） 
  + '([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
  + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
  + '[a-z]{2,6})' // first level domain- .com or .museum 
  + '(:[0-9]{1,4})?' // 端口- :80 
  + '((/?)|' // a slash isn't required if there is no file name 
  + '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$'; 
  var re=new RegExp(strRegex); 
  //re.test() 
  if (re.test(str_url)) { 
  return (true); 
  } else { 
  return (false); 
  } 
}
/**
 * @param {string} url
 * @returns {Boolean}
 */
function validURL(url) {
  const reg = /^(https?|ftp|http|rtsp|mms|telnet|news|wais|mailto|file):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}
export default {
  urlProvider,
  validURL,
}

