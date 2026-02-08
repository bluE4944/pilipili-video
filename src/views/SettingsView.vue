<template>
  <div class="settings-view">
    <n-card>
      <n-space vertical :size="24">
        <h2>设置</h2>

        <n-card title="视频管理" size="small">
          <n-space vertical :size="12">
            <n-space>
              <n-button type="primary" @click="handleAddVideos">
                <template #icon>
                  <n-icon><AddIcon /></n-icon>
                </template>
                添加视频
              </n-button>
              <n-button @click="handleScanVideos" :loading="videoStore.scanning">
                <template #icon>
                  <n-icon><RefreshIcon /></n-icon>
                </template>
                扫描视频
              </n-button>
            </n-space>
            <n-text depth="3">
              如需访问局域网文件夹，请先在下方配置后端扫描目录。
            </n-text>
          </n-space>
        </n-card>

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
                <n-radio value="light">浅色</n-radio>
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

    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="video/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useFolderStore } from '@/store/folder'
import { useThemeStore } from '@/store/theme'
import { useVideoStore } from '@/store/video'
import type { FolderConfig } from '@/types'
import { AddOutline as AddIcon, CreateOutline as EditIcon, TrashOutline as TrashIcon, RefreshOutline as RefreshIcon } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { getErrorMessage } from '@/utils/error'
import { isVideoFile } from '@/utils/videoScanner'
import { registerVideoFile } from '@/utils/videoFileManager'

const folderStore = useFolderStore()
const themeStore = useThemeStore()
const videoStore = useVideoStore()
const message = useMessage()

const showAddDialog = ref(false)
const editingFolderId = ref<string | null>(null)
const autoPlayNext = ref(true)
const fileInputRef = ref<HTMLInputElement>()

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

const handleToggleFolder = async (id: string, enabled: boolean) => {
  try {
    await folderStore.updateFolder(id, { enabled })
    message.success(enabled ? '已启用' : '已禁用')
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleEditFolder = (folder: FolderConfig) => {
  editingFolderId.value = folder.id
  folderForm.name = folder.name
  folderForm.path = folder.path
  showAddDialog.value = true
}

const handleDeleteFolder = async (id: string) => {
  try {
    await folderStore.removeFolder(id)
    message.success('已删除')
  } catch (error) {
    message.error(getErrorMessage(error))
  }
}

const handleSaveFolder = async () => {
  if (!folderForm.name || !folderForm.path) {
    message.warning('请填写完整信息')
    return
  }

  try {
    if (editingFolderId.value) {
      await folderStore.updateFolder(editingFolderId.value, {
        name: folderForm.name,
        path: folderForm.path
      })
      message.success('更新成功')
    } else {
      await folderStore.addFolder({
        name: folderForm.name,
        path: folderForm.path,
        enabled: true
      })
      message.success('添加成功')
    }
  } catch (error) {
    message.error(getErrorMessage(error))
    return
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

const handleAddVideos = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  try {
    message.loading('正在上传视频文件...', { duration: 0, key: 'loading' })

    let uploadedVideos: any[] = []

    if (files.length === 1) {
      const video = await videoStore.uploadVideo(files[0], (progress) => {
        message.loading(`上传中... ${progress}%`, { duration: 0, key: 'loading' })
      })
      uploadedVideos = [video]
    } else {
      uploadedVideos = await videoStore.uploadVideos(files, (progress) => {
        message.loading(`上传中... ${progress}%`, { duration: 0, key: 'loading' })
      })
    }

    uploadedVideos.forEach((video) => {
      const matchingFile = files.find(f => f.name === video.name && isVideoFile(f.name))
      if (matchingFile && matchingFile instanceof File && matchingFile.size > 0) {
        registerVideoFile(video.id, matchingFile)
      }
    })

    await videoStore.loadCollections()

    message.destroyAll()
    message.success(`成功上传 ${uploadedVideos.length} 个视频文件`)
  } catch (error) {
    console.error('Failed to upload videos:', error)
    message.destroyAll()
    message.error(getErrorMessage(error))
  } finally {
    if (target) target.value = ''
  }
}

const handleScanVideos = async () => {
  message.loading('正在请求后端扫描...', { duration: 0, key: 'scan' })
  try {
    await videoStore.scanAllVideos()
    message.destroyAll()
    message.success('扫描完成')
  } catch (error) {
    message.destroyAll()
    message.error(getErrorMessage(error))
  }
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
