import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import VueCoreVideoPlayer from 'vue-core-video-player';
import Antd from "ant-design-vue";
import 'ant-design-vue/dist/antd.css';

//字体
import './assets/font/local-fonts.css'

// app.js
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './style/custom.css'


Vue.config.productionTip = false;

// Install BootstrapVue
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
// Install vue-core-video-player
Vue.use(VueCoreVideoPlayer);

Vue.use(Antd);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
