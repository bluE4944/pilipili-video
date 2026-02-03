<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <n-layout class="app-layout">
              <n-layout-header class="app-header" bordered>
                <AppHeader />
              </n-layout-header>
              <n-layout-content class="app-content">
                <router-view v-slot="{ Component }">
                  <transition name="fade" mode="out-in">
                    <component :is="Component" />
                  </transition>
                </router-view>
              </n-layout-content>
              <n-layout-footer class="app-footer" v-if="showFooter">
                <div class="footer-content">
                  PiliPili Video 2024 由 Vue3 + TypeScript 构建</div>
              </n-layout-footer>
            </n-layout>
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { darkTheme, type GlobalTheme, type GlobalThemeOverrides } from 'naive-ui'
import { useThemeStore } from '@/store/theme'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const themeStore = useThemeStore()

const theme = computed<GlobalTheme | null>(() => {
  return themeStore.currentTheme === 'dark' ? darkTheme : null
})

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  return {
    common: {
      primaryColor: '#00a1d6',
      primaryColorHover: '#00b5e5',
      primaryColorPressed: '#0084b4'
    }
  }
})

const showFooter = computed(() => {
  return ['home', 'video'].includes(route.name as string)
})
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: "HarmonyOS Sans Medium", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

.app-layout {
  min-height: 100vh;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 55px;
  background: var(--n-color);
}

.app-content {
  margin-top: 55px;
  min-height: calc(100vh - 55px);
  padding: 20px;
}

.app-footer {
  padding: 20px;
  text-align: center;
  background: var(--n-color);
}

.footer-content {
  color: var(--n-text-color);
  opacity: 0.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

[data-theme="dark"] {
  --n-color: #1a1a1a;
  --n-text-color: #e5e5e5;
}

[data-theme="light"] {
  --n-color: #ffffff;
  --n-text-color: #333333;
}
</style>

