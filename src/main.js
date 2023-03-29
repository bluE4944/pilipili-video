import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import VueCoreVideoPlayer from 'vue-core-video-player';
import Antd from "ant-design-vue";
import 'ant-design-vue/dist/antd.css';
import './utils/axios';
import * as types from './store/mutation-types';

//videojs-plugin
import VueVideoPlayer from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

//字体
import './assets/font/local-fonts.css'

// app.js
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './style/custom.css'

import Viewer from 'v-viewer';
import 'viewerjs/dist/viewer.css';

Vue.use(Viewer);
Viewer.setDefaults({
  Options: { "inline": true, "button": true, "navbar": true, "title": true, "toolbar": true, "tooltip": true, "movable": true, "zoomable": true, "rotatable": true, "scalable": true, "transition": true, "fullscreen": true, "keyboard": true, "url": "data-source" }
});


Vue.config.productionTip = false;

// Install BootstrapVue
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
// Install vue-core-video-player
Vue.use(VueCoreVideoPlayer);

Vue.use(Antd);

Vue.use(VueVideoPlayer);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

Vue.prototype.$types = types;
