import axios from "axios";
import iView from "iview";
// import Vue from 'vue'

// axios默认配置
axios.defaults.timeout = 100000; // 超时时间
// axios.defaults.baseURL = 'http://127.0.0.1/developers-server/rest' // 默认为当前访问地址，部署到服务器时使用该地址
axios.defaults.baseURL = "https://delivery.paas.talkweb.com.cn/wiki-server/developers-server/rest";//生产配置
// 使用开发环境下的代理
if (location.href.includes('127.0.0.1') || location.href.includes('localhost')) {
//   axios.defaults.baseURL = 'http://localhost:8080' // 本地 forum-java 应用服务地址
     axios.defaults.baseURL = "/api";
}

// 整理数据
// axios.defaults.transformRequest = function (data) {
//   // data = Qs.stringify(data);
//   data = JSON.stringify(data)
//   return data
// }

// axios.defaults.headers['Content-Type'] = 'application/json;charset=UTF-8'
// axios.defaults.headers['token'] = localStorage.getItem('token')

// 路由请求拦截
// http request 拦截器
axios.interceptors.request.use(
  config => {
    if (config.headers["Content-Type"] !== "multipart/form-data") {
      config.headers["Content-Type"] = "application/json;charset=UTF-8";
    }
    // config.headers.token = getCookie("__dp_tk__");
    // 使用硬编码的token
    config.headers.token = "77a92fce48134eebbdb8ba6b08f1ebf2";
    return config;
  },
  error => {
    return Promise.reject(error.response);
  }
);

function getCookie(cName) {
  if (document.cookie.length > 0) {
    let cStart = document.cookie.indexOf(cName + "=");
    if (cStart !== -1) {
      cStart = cStart + cName.length + 1;
      let cEnd = document.cookie.indexOf(";", cStart);
      if (cEnd === -1) {
        cEnd = document.cookie.length;
      }
      return unescape(document.cookie.substring(cStart, cEnd));
    }
  }
  return "";
}

// 路由响应拦截
// http response 拦截器
axios.interceptors.response.use(
  response => {
    // console.info('response info ===>', response) 80008998
    if (response.data.code === 80008998) {
      iView.Message.error(response.data.message);
      window.location.href =
        window.location.origin + "/?toast=" + response.data.message;
    }
    return response.data;
  },
  error => {
    return Promise.reject(error.response); // 返回接口返回的错误信息
  }
);

export default axios;
