import sysConfig from "../config";
import {Notification} from 'element-ui';
import {EVENT_TYPE} from "../const";
let ws;
export function openSocket(userId) {
  if (!ws) {
    ws = new WebSocket(`${sysConfig.SOCKET_URL}/${userId}`);
    // let ws = new WebSocket(`ws://121.40.165.18:8800`);
    ws.onopen = function (evt) {
      // Notification({
      //   title: '欢迎回来！',
      //   message: `${sysConfig.SOCKET_URL}/${userId}`
      // });
    };
    ws.onmessage = function (e) {
      console.log(typeof e.data);
      try {
        if (e.data != undefined || e.data != null) {
          let json = JSON.parse(e.data);
          Notification({
            title: json.messageTitle,
            message: json.messageText
          });
          //通知页面更新
          window.postMessage(EVENT_TYPE.updateMessage, '/');
        }
      } catch (err) {
        console.log("webSocket异常,异常信息:" + err)
      }


      //ws.close();
    };
    ws.onclose = function (evt) {
      console.log('Connection closed.');
    };
  }
}
