import { createRouter, createWebHistory } from 'vue-router'
import { createDiscreteApi } from 'naive-ui'
import { useUserStore } from '@/store/user'
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
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { title: '个人信息', requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'adminUsers',
    component: () => import('@/views/AdminUsersView.vue'),
    meta: { title: '用户管理', requiresAuth: true, allowedRoles: ['admin', 'manage'] }
  },
  {
    path: '/admin/videos',
    name: 'adminVideos',
    component: () => import('@/views/AdminVideosView.vue'),
    meta: { title: '视频管理', requiresAuth: true, allowedRoles: ['admin', 'manage'] }
  },
  {
    path: '/admin/collections',
    name: 'adminCollections',
    component: () => import('@/views/AdminCollectionsView.vue'),
    meta: { title: '合集管理', requiresAuth: true, allowedRoles: ['admin', 'manage'] }
  },
  {
    path: '/admin/transcode-tasks',
    name: 'adminTranscodeTasks',
    component: () => import('@/views/AdminTranscodeTasksView.vue'),
    meta: { title: '转换任务', requiresAuth: true, allowedRoles: ['admin', 'manage'] }
  },
  {
    path: '/admin/download-tasks',
    name: 'adminDownloadTasks',
    component: () => import('@/views/AdminDownloadTasksView.vue'),
    meta: { title: '下载管理', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/dict',
    name: 'adminDict',
    component: () => import('@/views/AdminDictView.vue'),
    meta: { title: '字典管理', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于', requiresAuth: false, allowGuest: true }
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

  if (to.meta.requiresAdmin) {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录')
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    const userStore = useUserStore()
    if (userStore.currentUser?.role !== 'admin') {
      message.error('仅管理员可访问')
      next({ name: 'home' })
      return
    }
  }

  const allowedRoles = to.meta.allowedRoles as string[] | undefined
  if (allowedRoles && allowedRoles.length) {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录')
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    const userStore = useUserStore()
    if (!userStore.currentUser?.role || !allowedRoles.includes(userStore.currentUser.role)) {
      message.error('无权限访问')
      next({ name: 'home' })
      return
    }
  }

  next()
})

export default router
