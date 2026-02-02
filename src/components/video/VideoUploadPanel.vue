<template>
  <a-card class="video-upload-panel" :bordered="false">
    <div class="panel-header">
      <div class="title">本地视频导入</div>
      <div class="desc">支持单个/批量上传，或选择文件夹模拟扫描导入。</div>
    </div>
    <div class="actions">
      <a-button type="primary" icon="upload" @click="triggerFileSelect">上传视频</a-button>
      <a-button icon="folder-open" class="ml-2" @click="triggerFolderSelect">导入文件夹</a-button>
      <span class="hint">支持 mp4/avi/mkv/mov/webm</span>
    </div>
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="video/*"
      class="hidden-input"
      @change="onFileChange"
    />
    <input
      ref="folderInput"
      type="file"
      multiple
      webkitdirectory
      directory
      class="hidden-input"
      @change="onFolderChange"
    />
    <div v-if="queue.length" class="queue">
      <div v-for="item in queue" :key="item.id" class="queue-item">
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="size">{{ item.sizeText }}</span>
        </div>
        <a-progress :percent="item.progress" size="small" />
      </div>
    </div>
    <a-alert
      v-if="errors.length"
      type="warning"
      show-icon
      class="mt-3"
      message="部分文件未导入"
      :description="errors.join('；')"
    />
  </a-card>
</template>

<script>
import { buildVideoFromFile, buildVideoKey, formatSize, getVideoDuration, isVideoFile, buildVideoSourceFromFile } from '@/utils/video';

export default {
  name: 'VideoUploadPanel',
  props: {
    existingKeys: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      queue: [],
      errors: [],
      uploading: false,
    };
  },
  methods: {
    triggerFileSelect() {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    triggerFolderSelect() {
      this.$refs.folderInput && this.$refs.folderInput.click();
    },
    async onFileChange(event) {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      await this.handleFiles(files);
    },
    async onFolderChange(event) {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      await this.handleFiles(files);
    },
    async handleFiles(files) {
      if (!files.length) return;
      this.errors = [];
      this.uploading = true;
      const videoItems = [];
      for (const file of files) {
        if (!isVideoFile(file)) {
          this.errors.push(`${file.name} 格式不支持`);
          continue;
        }
        const key = buildVideoKey(file.name, file.size);
        if (this.existingKeys.includes(key)) {
          this.errors.push(`${file.name} 已存在，已跳过`);
          continue;
        }
        const queueItem = {
          id: key,
          name: file.name,
          sizeText: formatSize(file.size),
          progress: 0,
        };
        this.queue.push(queueItem);
        const progressTimer = setInterval(() => {
          queueItem.progress = Math.min(queueItem.progress + 8, 90);
        }, 120);
        const duration = await getVideoDuration(file);
        const videoItem = buildVideoFromFile(file, {
          duration,
          sourceUrl: buildVideoSourceFromFile(file),
        });
        clearInterval(progressTimer);
        queueItem.progress = 100;
        videoItems.push(videoItem);
      }
      if (videoItems.length) {
        this.$emit('uploaded', videoItems);
      }
      setTimeout(() => {
        this.queue = [];
      }, 800);
      this.uploading = false;
    },
  },
};
</script>

<style scoped>
.video-upload-panel {
  margin-bottom: 16px;
}
.panel-header {
  margin-bottom: 12px;
}
.panel-header .title {
  font-size: 18px;
  font-weight: 600;
}
.panel-header .desc {
  color: #6b7280;
  font-size: 13px;
  margin-top: 4px;
}
.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.hint {
  color: #9ca3af;
  font-size: 12px;
}
.hidden-input {
  display: none;
}
.queue {
  margin-top: 12px;
}
.queue-item {
  padding: 8px 0;
}
.queue-item .info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}
</style>
