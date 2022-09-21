import axios from 'axios';
import router from '../router';
import {Notification} from 'element-ui';
import sysConfig from "../config";

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'; //配置请求头
axios.defaults.timeout = 500000; //响应时间


axios.defaults.baseURL = sysConfig.LAND_SERVICE_URL;
//开发环境单点登录跳转
let $loginPath = sysConfig.LOGIN_PATH;
//开发环境登出跳转
let $logoutPath = sysConfig.LOGOUT_PATH;
let filePath = sysConfig.FILE_PATH;

let $auth = ",home,token,welcome,noAuth";
//文件允许发布SDE勾选类型
let gisFileType = ",.dbf,.prj,.shp,.shp.xml,.shx,.tfw,.tif,.tif.aux.xml,.tif.ovr,.sbn,.sbx,.mdb,.adf";

//添加请求拦截器
axios.interceptors.request.use(function(config) {
        if(config.url.indexOf('://')!=-1){
            var flag=false;
            //修改8099调用8088端口 token缺失问题
            for(let service_url in sysConfig) {
                if(config.url.indexOf(sysConfig[service_url])!=-1){
                    flag=true;
                }
            }
            if(flag){
                return interceptRequestToAddHeaders(config);
            }
            else{
                //其他系统请求，默认不加token，保持请求为GET、POST、HEAD位简单请求
                return config;
            }
        }
        return interceptRequestToAddHeaders(config);

        // else if(config.url != 'login'){
        //     // 跳转到登录页
        //     router.replace({
        //         path: '/',
        //         query: {
        //             redirect: router.currentRoute.path
        //         }
        //     })
        // }
    },function(err) {
        return Promise.reject(err)
    }
)

//添加响应拦截器
axios.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        console.log(error)
  // 对响应错误做点什么
  Notification({
    title: '请求错误',
    message: `${error}`
  });
  //仅对生产环境生效
  if(process.env.NODE_ENV === 'production'){
    if (error.response.status >= 500){
      router.push('HTTP.500')
    }else if(error.response.status < 500){
      router.push('HTTP.404')
    }
  }
  // return Promise.resolve();
    }
);

function interceptRequestToAddHeaders(config){
    if (localStorage.getItem('token')) {
        config.headers.token = localStorage.getItem('token');
        config.headers.Cookies = localStorage.getItem('userName');
        return config;
    }
    else {
        window.location.href = $loginPath + '?path='+ encodeURIComponent(window.location);// 跳转到登录页面
    }
    return config;
}


function processResult(response, req, body, refreshTokenCallback, resolve, reject) {
        if (response && response.data && response.data.code && response.data.code == 300) {
            localStorage.clear();
            // 跳转到登录页
            window.location.href = $loginPath + '?path='+ encodeURIComponent(window.location);// 跳转到登录页面
        } else {
            
            resolve(response.data);
        }
}

//refreshToken暂时不用了
function refreshToken(requestUrl, requestData, callback, resolve, reject) {
    var refreshToken = localStorage.getItem("refreshToken")
    if(refreshToken){
        post('refreshToken', {
            refreshToken: refreshToken,
            tokenLifeTime: 5 * 60,
            refreshTokenLifeTime: 12 * 60 * 60
        }).then(r => {
            if(r.code == 200){
                //setToken
                localStorage.setItem('token', r.data.token);
                localStorage.setItem('refreshToken', r.data.refreshToken);

                if (callback) {
                    if(requestUrl == 'checkToken'){
                        requestData.token =  r.data.token;
                        callback(requestUrl, requestData).then(r => resolve(r)).catch(error => { reject(error) });
                    }else{
                        callback(requestUrl, requestData).then(r => resolve(r)).catch(error => { reject(error) });
                    }
                }
            }else{
                window.location.href = $loginPath + '?path='+ encodeURIComponent(window.location);// 跳转到登录页面
            }
        }).catch(error => {

        })
    }
    else {
        window.location.href = $loginPath + '?path='+ encodeURIComponent(window.location);// 跳转到登录页面
    }
}


function getProcessResult(response, req, refreshTokenCallback, resolve, reject) {
    
        if (response && response.data && response.data.code && response.data.code == 300) {
            localStorage.clear();
            // 跳转到登录页
            window.location.href = $loginPath + '?path='+ encodeURIComponent(window.location);// 跳转到登录页面
        } else {
            resolve(response.data);
        }
}

//refreshToken暂时不用了
function getRefreshToken(requestUrl, callback, resolve, reject) {
    var refreshToken = localStorage.getItem("refreshToken")
    if(refreshToken){
        post('refreshToken', {
            refreshToken: refreshToken,
            tokenLifeTime: 5 * 60,
            refreshTokenLifeTime: 12 * 60 * 60
        }).then(r => {
            //setToken
            localStorage.setItem('token', r.data.token);
            localStorage.setItem('refreshToken', r.data.refreshToken);

            if (callback) {
                if(requestUrl == 'checkToken'){
                    requestData.token =  r.data.token;
                    callback(requestUrl).then(r => resolve(r)).catch(error => { reject(error) });
                }else{
                    callback(requestUrl).then(r => resolve(r)).catch(error => { reject(error) });
                }
            }
        }).catch(error => {

        })
    }
    else {
        window.location.href = $loginPath + '?path='+ encodeURIComponent(window.location);// 跳转到登录页面
    }
}

function post(req, body) {
    return new Promise(
        function(resolve, reject) {
            axios({
                method: 'post',
                url: req,
                headers: {
                    'contentType': 'json',
                },
                timeout: 50000,
                withCredentials: false,
                data: body
            }).then(function(response) {
                processResult(response, req, body, post, resolve, reject);
            }).catch(function(error) {
                reject(error);
            });
        }
    )
}

function get(req) {
    return new Promise(
        function(resolve, reject) {
            axios({
                method: 'get',
                url: req,
                headers: {
                    'contentType': 'json',
                },
                timeout: 50000,
                withCredentials: false,
            }).then(function(response) {
                getProcessResult(response, req, get, resolve, reject);
            }).catch(function(error) {
                reject(error);
            });
        }
    )
}

function gett(req) {
    return new Promise(
        function(resolve, reject) {
            axios({
                method: 'get',
                url: req,
                headers: {
                    'contentType': 'json'
                },
                timeout: 50000,
                withCredentials: false,
               responseType:"blob",
            }).then(function(response) {
                getProcessResult(response, req, get, resolve, reject);
            }).catch(function(error) {
                reject(error);
            });
        }
    )
}


function put(req, body) {
    return new Promise(
        function(resolve, reject) {
            axios({
                method: 'put',
                url: req,
                headers: {
                    'contentType': 'json'
                },
                timeout: 50000,
                withCredentials: false,
                data: body
            }).then(function(response) {
                processResult(response, req, body, put, resolve, reject);
            }).catch(function(error) {
                reject(error);
            });
        }
    )
}

function del(req) {
    return new Promise(
        function(resolve, reject) {
            axios({
                method: 'delete',
                url: req,
                headers: {
                    'contentType': 'json'
                },
                timeout: 50000,
                withCredentials: false,
            }).then(function(response) {
                getProcessResult(response, req, del, resolve, reject);
            }).catch(function(error) {
                reject(error);
            });
        }
    )
}

function dels(req, body) {
    return new Promise(
        function(resolve, reject) {
            axios({
                method: 'delete',
                url: req,
                headers: {
                    'contentType': 'json'
                },
                timeout: 50000,
                withCredentials: false,
                data: body
            }).then(function(response) {
                processResult(response, req, body, dels, resolve, reject);
            }).catch(function(error) {
                reject(error);
            });
        }
    )
}

function upload(req, body,config) {
    return new Promise(
        function(resolve, reject) {
            axios.post('/file/upload', body, config).then(response => processResult(response, req, body, post, resolve, reject))

            axios({
                method: 'post',
                url: req,
                headers: {
                    'contentType': 'json',
                },
                timeout: 50000,
                withCredentials: false,
                data: body
            }).then(function(response) {
                processResult(response, req, body, post, resolve, reject);
            }).catch(function(error) {
                reject(error);
            });
        }
    )
}

export default {
    get,
    post,
    put,
    del,
    gett,
    dels,
    $loginPath,
    $logoutPath,
    $auth,
    filePath,
    gisFileType
}
