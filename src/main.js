import Vue from 'vue';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCoreVideoPlayer from 'vue-core-video-player'
import Antd from 'ant-design-vue';

createApp(App).use(store).use(router).use(VueCoreVideoPlayer).use(Antd).mount('#app')
Vue.use(VueCoreVideoPlayer).use(Antd);
new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
