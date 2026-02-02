import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/video',
    name: 'video',
    component: () => import('@/views/VideoHome.vue'),
    meta: { title: '视频列表' }
  },
  {
    path: '/video/:id',
    name: 'videoDetail',
    component: () => import('@/views/VideoDetail.vue'),
    meta: { title: '视频详情' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置' }
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

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'PiliPili Video'
  next()
})

export default router
