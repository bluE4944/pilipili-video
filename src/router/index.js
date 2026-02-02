import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VideoLibraryView from '../views/VideoLibraryView.vue'
import VideoPlayerView from '../views/VideoPlayerView.vue'
import BlogListView from '../views/BlogListView.vue'
import BlogDetailView from '../views/BlogDetailView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { keepAlive: true }
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/videos',
    name: 'videos',
    component: VideoLibraryView,
    meta: { keepAlive: true }
  },
  {
    path: '/videos/:id',
    name: 'videoPlayer',
    component: VideoPlayerView,
  },
  {
    path: '/blogs',
    name: 'blogs',
    component: BlogListView,
    meta: { keepAlive: true }
  },
  {
    path: '/blogs/:id',
    name: 'blogDetail',
    component: BlogDetailView,
  },
  {
    path: '/manageUsers',
    name: 'manageUsers',
    component: () => import(/* webpackChunkName: "about" */ '../views/manage/ManageUsers.vue'),
  },
  {
    path: '/manageVideos',
    name: 'manageVideos',
    component: () => import(/* webpackChunkName: "about" */ '../views/manage/ManageVideos.vue'),
  },
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
