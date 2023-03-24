import axios from "axios";
import store from "@/store";

import { message } from "ant-design-vue";

/**
 * 全局消息
 * @param {*} content 消息内容
 */
function SingleMessage(content){
    let title = content.title;
    let type = content.type;
    let duration = content.duration;
    message.destroy();
    switch(type){
        case 'error':
            message.error(content.message,duration);break
        case 'info':
            message.info(content.message,duration);break
        case 'success':
            message.success(content.message,duration);break
        case 'warning':
            message.warning(content.message,duration);break
        default:
            message.info(content.message,duration);break
    }
    store.dispatch('hideLoading');
}

const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    headers: { 
        //异步处理
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json' 
    },
    //请求超时时间
    timeout: 500000 
});

service.interceptors.request.use((config) => {
  this.$store.dispatch(this.$types.SHOW_LOADING);
  if(config.url === '/doLogin'){
    return config;
  }

  const token = localStorage.getItem('token');
  config.headers.Authorization = token ? ('Bearer ' + token) : '';
  // 在请求发送前做的操作
  config.cancelToken = new axios.CancelToken(function executor(c) {
        // executor 函数接收一个 cancel 函数作为参数
        cancel = c;
    });
    
    return config;
},
error => {
  // Do something with request error
  SingleMessage({
    title: '请求错误',
    message: '登录失败！',
    type: 'error',
    duration: 3
  })
  this.$store.dispatch(this.$types.HIDE_LOADING);
  return Promise.reject(error)
}
);


// service.interceptors.request.use(
//     config => {
//     // 在请求发送前做的操作
//     config.cancelToken = new CancelToken(function executor(c) {
//       // executor 函数接收一个 cancel 函数作为参数
//       pending.push(c)
//     });

//     return config
//   },
//   error => {
//     // do something with request error
//     SingleMessage({
//       title: '请求错误',
//       message: '登录失败！',
//       type: 'error',
//       duration: 3 * 1000
//     })
//     // 清除浏览器保存的信息
//     delSessionStorage()
//     // 清除搜索组件保存的信息，防止显示旧数据
//     delLocalStorage('Enterprise')
//     // 删除路由和 vuex 的store
//     delLocalStorage('router')
//     delLocalStorage('store')
//     router.replace('/login')
//     return Promise.reject(error)
//   }
// );

let int = null
service.interceptors.response.use(
    /**
     * 如果您想要获取诸如头或状态之类的http信息
     * 就 return  response => response
     */
  
    /**
     *通过自定义代码确定请求状态
     *这里只是一个例子
     *您还可以通过HTTP状态代码判断状态
     */
    response => {
      var res = response.data
      this.$store.dispatch(this.$types.HIDE_LOADING);
      if (res.status === 200) {
        if (res.msg !== '获取成功！') {
          SingleMessage({
            message: res.msg || '成功',
            type: 'success',
            duration: 3
          })
        }
      } else if (res.status === 501) {
        SingleMessage({
          message: res.msg || '操作被取消，暂时不能操作',
          type: 'warning',
          duration: 3
        })
      } else if (res.status === 500) {
        SingleMessage({
          message: res.msg || '未知异常！请重试，仍不能操作请联系管理员',
          type: 'error',
          duration: 3
        })
      }
      return response
    },
    error => {
      if (error.response) {
        const res = error.response.data
        if (res.status === 401) {
          while (pending.length > 0) {
            pending.pop()('请求中断')
          }

          // 定义定时器去主动点击遮罩层让第一个弹窗后的弹窗自己主动关闭
          int = setInterval(() => {
            const ele = document.getElementsByClassName('v-modal')[0]
            // 当检测到document中没有遮罩层的时候 清除计时器
            if (!ele) {
              clearInterval(int)
            } else {
              // 进行点击，触发弹窗的关闭
              ele.click()
            }
          }, 0)
          // 清除浏览器保存的信息
          delSessionStorage()
          // 清除搜索组件保存的信息，防止显示旧数据
          delLocalStorage('Enterprise')
          // 删除路由和 vuex 的store
          delLocalStorage('router')
          delLocalStorage('store')
          router.replace('/login')
          
        } else if (res.status === 400) {
          SingleMessage({
            message: res.msg || '客户端错误',
            type: 'error',
            duration: 3
          })
        } else if (res.status === 403) {
          SingleMessage({
            message: res.msg || '您的权限不足',
            type: 'error',
            duration: 3
          })
        } else if (res.status === 404) {
          SingleMessage({
            message: '网络请求不存在',
            type: 'error',
            duration: 3
          })
        } else if (res.status === 500) {
          SingleMessage({
            message: res.msg || '服务器异常',
            type: 'error',
            duration: 3
          })
        } else if (res.status === 501) {
          SingleMessage({
            message: res.msg || '您的操作被取消或不允许提交',
            type: 'warning',
            duration: 3
          })
        } else {
          SingleMessage({
            message: '服务器正在开小差。。。。',
            type: 'error',
            duration: 3
          })
        }
      } else if (error.message.includes('timeout')) {
        SingleMessage({
          message: '请求超时，请检查网络连接!',
          type: 'error',
          duration: 3
        })
      }
  
      // console.log(error)
      return Promise.reject(error)
      // return new Promise(() => {
      //   console.dir(error, '错误')
      // })
    }
  )


export default service;