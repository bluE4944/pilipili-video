import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Theme } from '@/types'

const STORAGE_KEY = 'theme'
const THEME_ATTRIBUTE = 'data-theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('auto')
  const currentTheme = ref<'light' | 'dark'>('light')

  // 从localStorage加载主题设置
  const loadTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      theme.value = stored as Theme
    }
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    let effectiveTheme: 'light' | 'dark' = 'light'
    
    if (theme.value === 'auto') {
      // 跟随系统主题
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } else {
      effectiveTheme = theme.value
    }
    
    currentTheme.value = effectiveTheme
    document.documentElement.setAttribute(THEME_ATTRIBUTE, effectiveTheme)
  }

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme()
  }

  // 切换主题（在light和dark之间）
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme.value === 'auto') {
        applyTheme()
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }

  // 初始化
  loadTheme()
  watchSystemTheme()

  return {
    theme,
    currentTheme,
    setTheme,
    toggleTheme,
    applyTheme
  }
})
