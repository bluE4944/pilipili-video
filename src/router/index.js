import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VideoDetail from "@/components/VideoDetail";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  //主页
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  //关于页面
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
  },
  //子画面 - 视频详情页
  {
    path: '/videoDetail',
    name: 'videoDetail',
    component: () => import(/* webpackChunkName: "about" */ '../components/VideoDetail.vue'),
  },
  //管理人员页
  {
    path: '/manageUsers',
    name: 'manageUsers',
    component: () => import(/* webpackChunkName: "about" */ '../views/manage/ManageUsers.vue'),
  },
  //管理视频页
  {
    path: '/manageVideos',
    name: 'manageVideos',
    component: () => import(/* webpackChunkName: "about" */ '../views/manage/ManageVideos.vue'),
  },
  //管理员页
  {
    path: '/adminManage',
    name: 'adminManage',
    component: () => import(/* webpackChunkName: "about" */ '../views/manage/AdminManage.vue'),
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
