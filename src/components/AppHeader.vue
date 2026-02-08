<template>
  <div class="header-container">
    <div class="header-left">
      <router-link to="/" class="logo-link">
        <span class="logo-text">PiliPili</span>
      </router-link>
      <n-menu
        class="header-menu"
        v-model:value="activeKey"
        mode="horizontal"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />
    </div>
    <div class="header-right">
      <n-dropdown class="header-menu-mobile" trigger="click" :options="menuOptions" @select="handleMenuSelect">
        <n-button quaternary circle>
          <template #icon>
            <n-icon><MenuIcon /></n-icon>
          </template>
        </n-button>
      </n-dropdown>
      <n-button quaternary circle @click="toggleTheme">
        <template #icon>
          <n-icon>
            <SunnyIcon v-if="themeStore.currentTheme === 'dark'" />
            <MoonIcon v-else />
          </n-icon>
        </template>
      </n-button>
      <n-dropdown trigger="click" :options="userOptions" @select="handleUserAction">
        <n-button quaternary class="user-button">
          <template #icon>
            <n-icon><PersonIcon /></n-icon>
          </template>
          <span class="user-name">{{ userStore.currentUser?.username || '游客' }}</span>
        </n-button>
      </n-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme'
import { useUserStore } from '@/store/user'
import {
  PersonCircleOutline as PersonIcon,
  SunnyOutline as SunnyIcon,
  MoonOutline as MoonIcon,
  MenuOutline as MenuIcon
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const userStore = useUserStore()

const resolveActiveKey = () => {
  if (route.name === 'videoDetail') return 'video'
  if (route.name === 'blogDetail') return 'blog'
  return route.name as string
}

const activeKey = ref(resolveActiveKey())

watch(
  () => route.name,
  () => {
    activeKey.value = resolveActiveKey()
  }
)

const menuOptions = [
  {
    label: '首页',
    key: 'home'
  },
  {
    label: '视频',
    key: 'video'
  },
  {
    label: '博客',
    key: 'blog'
  },
  {
    label: '设置',
    key: 'settings'
  }
]

const userOptions = computed(() => {
  if (userStore.currentUser && !userStore.currentUser.id.startsWith('guest_')) {
    return [
      {
        label: '退出登录',
        key: 'logout'
      }
    ]
  }
  return [
    {
      label: '登录',
      key: 'login'
    },
    {
      label: '注册',
      key: 'register'
    }
  ]
})

const handleMenuSelect = (key: string) => {
  activeKey.value = key
  router.push({ name: key })
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const handleUserAction = (key: string) => {
  if (key === 'logout') {
    userStore.logout()
  } else if (key === 'login') {
    router.push({ name: 'login' })
  } else if (key === 'register') {
    router.push({ name: 'login', query: { action: 'register' } })
  }
}
</script>

<style scoped lang="scss">
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #00a1d6;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-menu-mobile {
  display: none;
}

.user-name {
  display: inline-block;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 12px;
  }

  .header-left {
    gap: 12px;
  }

  .header-menu {
    display: none;
  }

  .header-menu-mobile {
    display: inline-flex;
  }

  .user-name {
    display: none;
  }

  .logo-text {
    font-size: 18px;
  }
}
</style>
