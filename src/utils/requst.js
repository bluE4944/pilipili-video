import axios from "axios";
import store from "@/store";

import { Message } from "ant-design-vue/types/message";

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

service.interceptors.request.use((confirm) => {
    confirm.cancelToken = new axios.CancelToken(function executor(c) {
        cancel = c;
    });
    store.dispatch('isShowLoading',true);
    return confirm;
});
service.interceptors.response.use();


export default service;