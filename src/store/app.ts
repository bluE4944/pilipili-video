import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const isPc = ref(true)

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setIsPc = (value: boolean) => {
    isPc.value = value
  }

  return {
    loading,
    isPc,
    setLoading,
    setIsPc
  }
})
