<template>
  <div class="profile-view">
    <n-card title="个人信息" size="large" class="profile-card">
      <n-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-placement="left" label-width="80">
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="profileForm.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="profileForm.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="手机号" path="phone">
          <n-input v-model:value="profileForm.phone" placeholder="请输入手机号" />
        </n-form-item>
        <n-space>
          <n-button type="primary" :loading="savingProfile" @click="handleSaveProfile">保存</n-button>
          <n-button @click="resetProfile">重置</n-button>
        </n-space>
      </n-form>
    </n-card>

    <n-card title="修改密码" size="large" class="profile-card">
      <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-placement="left" label-width="80">
        <n-form-item label="旧密码" path="oldPassword">
          <n-input v-model:value="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </n-form-item>
        <n-form-item label="新密码" path="newPassword">
          <n-input v-model:value="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </n-form-item>
        <n-form-item label="确认密码" path="confirmPassword">
          <n-input v-model:value="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </n-form-item>
        <n-space>
          <n-button type="primary" :loading="savingPassword" @click="handleChangePassword">修改密码</n-button>
          <n-button @click="resetPassword">重置</n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInst, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/store/user'
import { userApi } from '@/api/user'

const message = useMessage()
const userStore = useUserStore()

const profileFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)

const profileForm = reactive({
  username: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const savingProfile = ref(false)
const savingPassword = ref(false)

const profileRules = computed<FormRules>(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: ['blur', 'input'] }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: ['blur', 'input'], required: false }]
}))

const passwordRules = computed<FormRules>(() => ({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: ['blur', 'input'] }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: ['blur', 'input'] }],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: ['blur', 'input'] },
    {
      validator: (_rule, value) => {
        if (!value || value !== passwordForm.newPassword) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: ['blur', 'input']
    }
  ]
}))

const syncProfile = () => {
  const user = userStore.currentUser
  profileForm.username = user?.username || ''
  profileForm.email = user?.email || ''
  profileForm.phone = user?.phone || ''
}

watch(
  () => userStore.currentUser,
  () => {
    syncProfile()
  },
  { immediate: true }
)

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  try {
    await profileFormRef.value.validate()
    savingProfile.value = true
    await userStore.updateUser({
      username: profileForm.username,
      email: profileForm.email,
      phone: profileForm.phone
    })
    message.success('个人信息已更新')
  } catch (error) {
    if (error) {
      message.error('请检查表单填写是否正确')
    }
  } finally {
    savingProfile.value = false
  }
}

const resetProfile = () => {
  syncProfile()
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
    savingPassword.value = true
    await userApi.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    message.success('密码修改成功')
    resetPassword()
  } catch (error) {
    if (error) {
      message.error('修改密码失败，请检查输入')
    }
  } finally {
    savingPassword.value = false
  }
}

const resetPassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}
</script>

<style scoped lang="scss">
.profile-view {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card {
  border-radius: 12px;
}
</style>
