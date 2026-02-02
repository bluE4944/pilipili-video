<template>
  <div class="video-home">
    <n-card>
      <n-space vertical :size="20">
        <!-- 搜索栏 -->
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索视频..."
          clearable
          @update:value="handleSearch"
        >
          <template #prefix>
            <n-icon><SearchIcon /></n-icon>
          </template>
        </n-input>

        <!-- 操作栏 -->
        <n-space justify="space-between">
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
            <n-popover trigger="hover">
              <template #trigger>
                <n-button quaternary circle>
                  <template #icon>
                    <n-icon><InfoIcon /></n-icon>
                  </template>
                </n-button>
              </template>
              <span>由于浏览器安全限制，无法直接访问本地文件系统。<br/>请使用"添加视频"功能选择视频文件。</span>
            </n-popover>
          </n-space>
          <n-space>
            <n-text depth="3">共 {{ filteredCollections.length }} 个合集</n-text>
          </n-space>
        </n-space>

        <!-- 视频列表 -->
        <n-grid v-if="filteredCollections.length > 0" :cols="5" :x-gap="16" :y-gap="16">
          <n-gi v-for="collection in filteredCollections" :key="collection.id">
            <n-card hoverable @click="goToVideoDetail(collection.id)" class="collection-card">
              <template #cover>
                <div class="collection-cover">
                  <n-icon :size="50">
                    <VideoLibraryIcon />
                  </n-icon>
                  <div class="episode-badge">{{ collection.totalEpisodes }} 集</div>
                </div>
              </template>
              <n-ellipsis :tooltip="false" style="font-weight: 500">
                {{ collection.title }}
              </n-ellipsis>
              <div class="collection-meta">
                <n-text depth="3" style="font-size: 12px">
                  {{ collection.description }}
                </n-text>
              </div>
            </n-card>
          </n-gi>
        </n-grid>

        <!-- 空状态 -->
        <n-empty v-else description="暂无视频，请先添加视频文件">
          <template #extra>
            <n-button type="primary" @click="handleAddVideos">
              添加视频
            </n-button>
          </template>
        </n-empty>
      </n-space>
    </n-card>

    <!-- 文件选择器（隐藏） -->
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '@/store/video'
import { scanVideosFromFiles, groupVideosIntoCollections, isVideoFile } from '@/utils/videoScanner'
import { registerVideoFile } from '@/utils/videoFileManager'
import { 
  SearchOutline as SearchIcon, 
  AddOutline as AddIcon, 
  RefreshOutline as RefreshIcon, 
  VideoLibraryOutline as VideoLibraryIcon, 
  InformationCircleOutline as InfoIcon 
} from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

const router = useRouter()
const videoStore = useVideoStore()
const message = useMessage()

const searchQuery = ref('')
const fileInputRef = ref<HTMLInputElement>()

const filteredCollections = computed(() => {
  if (!searchQuery.value) {
    return videoStore.collections
  }
  
  const query = searchQuery.value.toLowerCase()
  return videoStore.collections.filter(collection =>
    collection.title.toLowerCase().includes(query) ||
    collection.description.toLowerCase().includes(query)
  )
})

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
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
    
    // 使用后端API上传视频
    let uploadedVideos: any[] = []
    
    if (files.length === 1) {
      // 单个文件上传
      const video = await videoStore.uploadVideo(files[0], (progress) => {
        message.loading(`上传中... ${progress}%`, { duration: 0, key: 'loading' })
      })
      uploadedVideos = [video]
    } else {
      // 批量上传
      uploadedVideos = await videoStore.uploadVideos(files, (progress) => {
        message.loading(`上传中... ${progress}%`, { duration: 0, key: 'loading' })
      })
    }
    
    // 注册文件到文件管理器（用于本地播放）
    uploadedVideos.forEach((video) => {
      const matchingFile = files.find(f => f.name === video.name && isVideoFile(f.name))
      if (matchingFile && matchingFile instanceof File && matchingFile.size > 0) {
        registerVideoFile(video.id, matchingFile)
        console.log(`✓ Registered: ${video.name} (ID: ${video.id})`)
      }
    })
    
    // 重新加载合集列表
    await videoStore.loadCollections()
    
    message.destroyAll()
    message.success(`成功上传 ${uploadedVideos.length} 个视频文件`)
    
    // 清空文件选择
    if (target) target.value = ''
  } catch (error) {
    console.error('Failed to upload videos:', error)
    message.destroyAll()
    
    // 如果后端API失败，降级到本地模式
    try {
      message.loading('后端上传失败，切换到本地模式...', { duration: 0, key: 'loading' })
      
      const { initDB, saveVideos } = await import('@/utils/storage')
      await initDB()
      
      const videoFiles = await scanVideosFromFiles(files)
      
      // 注册文件到文件管理器
      videoFiles.forEach((video) => {
        const matchingFile = files.find(f => f.name === video.name && isVideoFile(f.name))
        if (matchingFile && matchingFile instanceof File && matchingFile.size > 0) {
          registerVideoFile(video.id, matchingFile)
        }
      })
      
      const newCollections = groupVideosIntoCollections(videoFiles)
      
      // 保存到IndexedDB
      await saveVideos(videoFiles.map(v => ({
        ...v,
        fileData: undefined
      })))
      
      // 更新store
      videoStore.collections.push(...newCollections)
      
      message.destroyAll()
      message.success(`成功添加 ${newCollections.length} 个视频合集（本地模式）`)
      
      if (target) target.value = ''
    } catch (localError) {
      message.destroyAll()
      message.error('添加视频失败：' + (error as Error).message)
    }
  }
}

const handleScanVideos = async () => {
  // 由于浏览器安全限制，无法直接访问文件系统
  // 扫描视频功能实际上就是添加视频文件
  // 提示用户使用文件选择器
  message.info('由于浏览器安全限制，请使用"添加视频"功能选择视频文件', {
    duration: 3000
  })
  
  // 也可以直接触发文件选择器
  setTimeout(() => {
    handleAddVideos()
  }, 500)
}

const goToVideoDetail = (id: string) => {
  router.push({ name: 'videoDetail', params: { id } })
}
</script>

<style scoped lang="scss">
.video-home {
  max-width: 1400px;
  margin: 0 auto;
}

.collection-card {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
}

.collection-cover {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;

  .icon-placeholder {
    font-size: 50px;
  }

  .episode-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.collection-meta {
  margin-top: 8px;
}
</style>
