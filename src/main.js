// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from "axios";
import splitPane from 'vue-splitpane'
import './theme/defaultTheme/index.css';
import '@/assets/theme/iconfont.css'

import moment from 'moment';
const Base64 = require('js-base64').Base64;
import sysConfig from "./config/sysConfig";
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'; //配置请求头
axios.defaults.timeout = 500000; //响应时间
axios.defaults.baseURL = sysConfig.DATA_CENTER_URL;

Vue.prototype.$Base64=Base64;
moment.locale('zh-cn');
Vue.prototype.$moment = moment;

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.prototype.$axios=axios;

Vue.component('split-pane', splitPane);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

function formatDate(date, fmt) {
  date = new Date(date);
  if (typeof(fmt) === "undefined") {
      fmt = "yyyy-MM-dd HH:mm:ss";
  }
  if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'H+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
  }
  for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
          let str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : ('00' + str).substr(str.length));
      }
  }
  return fmt
}
//定义一个时间过滤器
Vue.filter("FormatDate", function(date, fmt) {
    if(date==null){
        return "";
    }
  return formatDate(date, fmt);
});
