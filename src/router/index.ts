import { createRouter, createWebHistory } from 'vue-router'
import { createDiscreteApi } from 'naive-ui'

import type { RouteRecordRaw } from 'vue-router'



const routes: RouteRecordRaw[] = [

  {

    path: '/',

    name: 'home',

    component: () => import('@/views/HomeView.vue'),

    meta: { title: '首页', requiresAuth: true, allowGuest: true }

  },

  {

    path: '/video',

    name: 'video',

    component: () => import('@/views/VideoHome.vue'),

    meta: { title: '视频列表', requiresAuth: true, allowGuest: true }

  },

  {

    path: '/video/:id',

    name: 'videoDetail',

    component: () => import('@/views/VideoDetail.vue'),

    meta: { title: '视频详情', requiresAuth: true, allowGuest: true }

  },

  {

    path: '/blog',

    name: 'blog',

    component: () => import('@/views/BlogList.vue'),

    meta: { title: '博客', requiresAuth: true, allowGuest: true }

  },

  {

    path: '/blog/:id',

    name: 'blogDetail',

    component: () => import('@/views/BlogDetail.vue'),

    meta: { title: '博客详情', requiresAuth: true, allowGuest: true }

  },

  {

    path: '/settings',

    name: 'settings',

    component: () => import('@/views/SettingsView.vue'),

    meta: { title: '设置', requiresAuth: true }

  },

  {

    path: '/login',

    name: 'login',

    component: () => import('@/views/LoginView.vue'),

    meta: { title: '登录' }

  }

]



const router = createRouter({

  history: createWebHistory(process.env.BASE_URL || '/'),

  routes

})



const { message } = createDiscreteApi(['message'])

router.beforeEach((to, _from, next) => {

  document.title = (to.meta.title as string) || 'PiliPili Video'

  if (to.meta.requiresAuth && !to.meta.allowGuest) {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录')
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()

})



export default router



