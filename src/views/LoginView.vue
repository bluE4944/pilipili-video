<template>
  <div class="login-view">
    <n-card style="max-width: 400px; margin: 100px auto">
      <n-space vertical :size="24">
        <div class="login-header">
          <h2>{{ isRegister ? '注册' : '登录' }}</h2>
          <n-text depth="3">PiliPili Video 账号系统</n-text>
        </div>

        <n-form ref="formRef" :model="form" :rules="rules">
          <n-form-item label="用户名" path="username">
            <n-input v-model:value="form.username" placeholder="请输入用户名" />
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="form.password"
              type="password"
              placeholder="请输入密码"
              show-password-on="click"
            />
          </n-form-item>
          <n-form-item v-if="isRegister" label="确认密码" path="confirmPassword">
            <n-input
              v-model:value="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password-on="click"
            />
          </n-form-item>
        </n-form>

        <n-space vertical :size="16">
          <n-button type="primary" block @click="handleSubmit" :loading="loading">
            {{ isRegister ? '注册' : '登录' }}
          </n-button>
          <n-button quaternary block @click="isRegister = !isRegister">
            {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
          </n-button>
          <n-button quaternary block @click="handleGuestLogin">
            游客模式登录
          </n-button>
        </n-space>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useMessage } from 'naive-ui'
import type { FormInst } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const message = useMessage()

const isRegister = ref(route.query.action === 'register')
const loading = ref(false)
const formRef = ref<FormInst | null>(null)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const rules = computed(() => ({
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
    min: 6,
    message: '密码长度至少6位',
    trigger: 'blur'
  },
  confirmPassword: isRegister.value ? {
    required: true,
    message: '请确认密码',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      if (value !== form.password) {
        return new Error('两次输入的密码不一致')
      }
      return true
    },
    trigger: 'blur'
  } : {}
}))

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((errors) => {
    if (errors) return

    loading.value = true

    try {
      if (isRegister.value) {
        const success = userStore.register(form.username, form.password)
        if (success) {
          message.success('注册成功')
          router.push({ name: 'home' })
        } else {
          message.error('用户名已存在')
        }
      } else {
        const success = userStore.login(form.username, form.password)
        if (success) {
          message.success('登录成功')
          router.push({ name: 'home' })
        } else {
          message.error('用户名或密码错误')
        }
      }
    } catch (error) {
      message.error('操作失败：' + (error as Error).message)
    } finally {
      loading.value = false
    }
  })
}

const handleGuestLogin = () => {
  userStore.loginAsGuest()
  message.success('已以游客身份登录')
  router.push({ name: 'home' })
}
</script>

<style scoped lang="scss">
.login-view {
  min-height: calc(100vh - 55px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-header {
  text-align: center;
  
  h2 {
    margin-bottom: 8px;
  }
}
</style>
