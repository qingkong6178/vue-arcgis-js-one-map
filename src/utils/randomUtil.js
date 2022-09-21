//16位随机数
function getRandomNumber16(){
    var randomNum = Math.random();
    var numStr = randomNum.toPrecision();
    numStr = numStr.substring(2,numStr.length);
    while(numStr.startsWith("0")){
        numStr= numStr.substring(1,numStr.length);
    }
    if(numStr.length>16){
        return numStr.substr(0,16);
    }
    else if(numStr.length<16){
        return getRandomNumber16();
    }
    else{
        return numStr;
    }
}
//32位随机数
function getRandomNumber32(){
    return getRandomNumber16()+getRandomNumber16();
}
//64位随机数
function getRandomNumber64(){
    return getRandomNumber32()+getRandomNumber32();
}
//128位随机数
function getRandomNumber128(){
    return getRandomNumber64()+getRandomNumber64();
}
//指定长度随机数
function getRandomNumber(length){
    length = length?length:1;
    var s="";
    for(var i=0;i<length/16;i++){
        s = s + getRandomNumber16();
    }
    return s.substr(0,length);
}

//16位随机字符串
function getRandomString16(radix){
    return getRandomString(16,radix);
}
//32位随机字符串
function getRandomString32(radix){
    return getRandomString(32,radix);
}
//64位随机字符串
function getRandomString64(radix){
    return getRandomString(64,radix);
}
//128位随机字符串
function getRandomString128(radix){
    return getRandomString(128,radix);
}
//指定长度随机字符串
//param length 生成长度
//param radix 种子范围
function getRandomString(length,radix){
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    length = length || 16;
    radix = radix || chars.length;
    radix = radix>62? chars.length : radix;

    var i,s="";
    
     for (i = 0; i < length; i++) s = s+chars[0 | Math.random()*radix];

     return s;
}

export default {
    RanNum:getRandomNumber,
    RanNum16:getRandomNumber16,
    RanNum32:getRandomNumber32,
    RanNum64:getRandomNumber64,
    RanNum128:getRandomNumber128,
    getRandomNumber:getRandomNumber,
    getRandomNumber16:getRandomNumber16,
    getRandomNumber32:getRandomNumber32,
    getRandomNumber64:getRandomNumber64,
    getRandomNumber128:getRandomNumber128,
    RanStr:getRandomString,
    RanStr16:getRandomString16,
    RanStr32:getRandomString64,
    RanStr64:getRandomString64,
    RanStr128:getRandomString128,
    getRandomString:getRandomString,
    getRandomString16:getRandomString16,
    getRandomString32:getRandomString32,
    getRandomString64:getRandomString64,
    getRandomString128:getRandomString128,
}