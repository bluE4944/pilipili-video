import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VideoDetail from "@/components/VideoDetail";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'videoDetail',
    component: HomeView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  //视频主页
  {
    path: '/videoHome',
    name: 'videoHome',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/VideoHome.vue'),
    children: [
      //子画面 - 视频详情页
      {
        path: '/videoDetail',
        name: 'videoDetail',
        component: () => import(/* webpackChunkName: "about" */ VideoDetail),
      }
    ],
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
