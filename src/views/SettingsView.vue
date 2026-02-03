<template>
  <div class="settings-view">
    <n-card>
      <n-space vertical :size="24">
        <h2>设置</h2>

        <n-card title="文件夹配置" size="small">
          <n-space vertical :size="16">
            <n-alert type="info" :show-icon="false">
              <n-text depth="3">
                由于浏览器安全限制，无法直接访问本地文件系统。
                请使用“添加视频”功能通过文件选择器添加视频文件。
                如需访问局域网文件夹，请配置后端 API 或使用 Electron 等桌面应用框架。
              </n-text>
            </n-alert>

            <n-list>
              <n-list-item v-for="folder in folderStore.folders" :key="folder.id">
                <n-thing>
                  <template #header>
                    <n-space justify="space-between" :wrap="true">
                      <n-text strong>{{ folder.name }}</n-text>
                      <n-space>
                        <n-switch
                          v-model:value="folder.enabled"
                          @update:value="handleToggleFolder(folder.id, $event)"
                        />
                        <n-button quaternary size="small" @click="handleEditFolder(folder)">
                          <template #icon>
                            <n-icon><EditIcon /></n-icon>
                          </template>
                        </n-button>
                        <n-button quaternary size="small" type="error" @click="handleDeleteFolder(folder.id)">
                          <template #icon>
                            <n-icon><TrashIcon /></n-icon>
                          </template>
                        </n-button>
                      </n-space>
                    </n-space>
                  </template>
                  <template #description>
                    <n-text depth="3" code>{{ folder.path }}</n-text>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>

            <n-button @click="showAddDialog = true" type="primary" dashed>
              <template #icon>
                <n-icon><AddIcon /></n-icon>
              </template>
              添加文件夹配置
            </n-button>
          </n-space>
        </n-card>

        <n-card title="主题设置" size="small">
          <n-space vertical :size="16">
            <n-radio-group v-model:value="themeStore.theme" @update:value="handleThemeChange">
              <n-space>
                <n-radio value="light">ǳɫ</n-radio>
                <n-radio value="dark">深色</n-radio>
                <n-radio value="auto">跟随系统</n-radio>
              </n-space>
            </n-radio-group>
            <n-text depth="3" style="font-size: 12px">
              当前主题：{{ themeStore.currentTheme === 'dark' ? '深色' : '浅色' }}
            </n-text>
          </n-space>
        </n-card>

        <n-card title="其他设置" size="small">
          <n-space vertical :size="16">
            <n-space justify="space-between" align="center" :wrap="true">
              <div>
                <n-text strong>自动播放下一集</n-text>
                <br>
                <n-text depth="3" style="font-size: 12px">当前集播放完成后自动切换到下一集</n-text>
              </div>
              <n-switch v-model:value="autoPlayNext" />
            </n-space>
          </n-space>
        </n-card>
      </n-space>
    </n-card>

    <n-modal v-model:show="showAddDialog" preset="dialog" title="文件夹配置">
      <n-form ref="formRef" :model="folderForm" :rules="formRules">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="folderForm.name" placeholder="输入文件夹名称" />
        </n-form-item>
        <n-form-item label="路径" path="path">
          <n-input v-model:value="folderForm.path" placeholder="输入文件夹路径（如：D:/Videos）" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showAddDialog = false">取消</n-button>
          <n-button type="primary" @click="handleSaveFolder">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useFolderStore } from '@/store/folder'
import { useThemeStore } from '@/store/theme'
import type { FolderConfig } from '@/types'
import { AddOutline as AddIcon, CreateOutline as EditIcon, TrashOutline as TrashIcon } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

const folderStore = useFolderStore()
const themeStore = useThemeStore()
const message = useMessage()

const showAddDialog = ref(false)
const editingFolderId = ref<string | null>(null)
const autoPlayNext = ref(true)

const folderForm = reactive({
  name: '',
  path: ''
})

const formRules = {
  name: {
    required: true,
    message: '请输入文件夹名称',
    trigger: 'blur'
  },
  path: {
    required: true,
    message: '请输入文件夹路径',
    trigger: 'blur'
  }
}

const handleToggleFolder = (id: string, enabled: boolean) => {
  folderStore.updateFolder(id, { enabled })
  message.success(enabled ? '已启用' : '已禁用')
}

const handleEditFolder = (folder: FolderConfig) => {
  editingFolderId.value = folder.id
  folderForm.name = folder.name
  folderForm.path = folder.path
  showAddDialog.value = true
}

const handleDeleteFolder = (id: string) => {
  folderStore.removeFolder(id)
  message.success('已删除')
}

const handleSaveFolder = () => {
  if (!folderForm.name || !folderForm.path) {
    message.warning('请填写完整信息')
    return
  }

  if (editingFolderId.value) {
    folderStore.updateFolder(editingFolderId.value, {
      name: folderForm.name,
      path: folderForm.path
    })
    message.success('更新成功')
  } else {
    folderStore.addFolder({
      name: folderForm.name,
      path: folderForm.path,
      enabled: true
    })
    message.success('添加成功')
  }

  showAddDialog.value = false
  editingFolderId.value = null
  folderForm.name = ''
  folderForm.path = ''
}

const handleThemeChange = (value: string) => {
  themeStore.setTheme(value as 'light' | 'dark' | 'auto')
  message.success('主题已切换')
}
</script>

<style scoped lang="scss">
.settings-view {
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .settings-view {
    max-width: 100%;
  }
}
</style>
