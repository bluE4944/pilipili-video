<template>
  <a-card class="video-card" hoverable>
    <div class="cover" @click="toPlay">
      <div class="cover-inner">
        <a-icon type="play-circle" class="play-icon" />
        <div class="title">{{ titleText }}</div>
        <div class="meta">{{ durationText }} · {{ sizeText }}</div>
      </div>
    </div>
    <div class="info">
      <div class="row">
        <span class="label">分类</span>
        <span class="value">{{ categoryName || '未分类' }}</span>
      </div>
      <div class="row">
        <span class="label">标签</span>
        <span class="value">{{ tagNames || '未添加' }}</span>
      </div>
      <div class="row">
        <span class="label">合集</span>
        <span class="value">{{ collectionLabel }}</span>
      </div>
    </div>
    <div class="actions">
      <a-button size="small" @click="toggleLike" :type="video.liked ? 'primary' : 'default'" title="点赞">
        <a-icon type="like" />
      </a-button>
      <a-button size="small" @click="toggleFavorite" :type="video.favorited ? 'danger' : 'default'" title="收藏">
        <a-icon type="star" />
      </a-button>
      <a-dropdown>
        <a class="ant-dropdown-link" @click="e => e.preventDefault()">更多 <a-icon type="down" /></a>
        <a-menu slot="overlay">
          <a-menu-item @click="showEditor = true">编辑分类/标签</a-menu-item>
          <a-menu-item @click="emitClearHistory">清除播放记忆</a-menu-item>
          <a-menu-item @click="triggerRebind">{{ rebindLabel }}</a-menu-item>
          <a-menu-item @click="emitRemove">删除记录</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <a-modal
      title="编辑分类/标签"
      :visible="showEditor"
      @ok="saveMeta"
      @cancel="showEditor = false"
      ok-text="保存"
      cancel-text="取消"
      width="520px"
    >
      <div class="editor">
        <div class="editor-row">
          <span class="label">分类</span>
          <a-select v-model="localCategory" allowClear placeholder="选择分类" class="editor-select">
            <a-select-option v-for="item in categories" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="editor-row">
          <span class="label">标签</span>
          <a-select v-model="localTags" mode="multiple" allowClear placeholder="选择标签" class="editor-select">
            <a-select-option v-for="item in tags" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="editor-row">
          <span class="label">合集名称</span>
          <a-input v-model="localCollection" placeholder="不填则为单集" />
        </div>
        <div class="editor-row">
          <span class="label">集数</span>
          <a-input-number v-model="localEpisode" :min="0" />
        </div>
      </div>
    </a-modal>
    <input ref="rebindInput" class="hidden-input" type="file" accept="video/*" :multiple="isCollectionCard" @change="onRebind" />
  </a-card>
</template>

<script>
import { formatDuration, formatSize, getVideoDuration, isVideoFile, buildVideoSourceFromFile } from '@/utils/video';

export default {
  name: 'VideoCard',
  props: {
    video: {
      type: Object,
      required: true,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    tags: {
      type: Array,
      default: () => [],
    },
    categoryMap: {
      type: Object,
      default: () => ({}),
    },
    tagMap: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      showEditor: false,
      localCategory: this.video.categoryId || '',
      localTags: (this.video.tagIds || []).slice(),
      localCollection: this.video.collectionName || '',
      localEpisode: this.video.episodeNumber || 0,
    };
  },
  computed: {
    titleText() {
      return this.video.displayTitle || this.video.title;
    },
    isCollectionCard() {
      return Boolean(this.video.displayTitle && this.video.collectionName);
    },
    rebindLabel() {
      return this.isCollectionCard ? '重新绑定合集' : '重新绑定文件';
    },
    categoryName() {
      return this.categoryMap[this.video.categoryId] || '';
    },
    tagNames() {
      return (this.video.tagIds || [])
        .map((id) => this.tagMap[id])
        .filter(Boolean)
        .join(' / ');
    },
    durationText() {
      return formatDuration(this.video.duration || 0);
    },
    collectionLabel() {
      if (!this.video.collectionName) return '单集';
      if (this.video.collectionCount && this.video.displayTitle) {
        return `${this.video.collectionName} · ${this.video.collectionCount}集`;
      }
      return this.video.collectionName;
    },
    sizeText() {
      return formatSize(this.video.size || 0);
    },
  },
  watch: {
    video: {
      deep: true,
      handler(val) {
        this.localCategory = val.categoryId || '';
        this.localTags = (val.tagIds || []).slice();
        this.localCollection = val.collectionName || '';
        this.localEpisode = val.episodeNumber || 0;
      },
    },
  },
  methods: {
    toPlay() {
      this.$router.push({ name: 'videoPlayer', params: { id: this.video.id } });
    },
    toggleLike() {
      this.$emit('like', this.video);
    },
    toggleFavorite() {
      this.$emit('favorite', this.video);
    },
    saveMeta() {
      this.$emit('update-meta', {
        id: this.video.id,
        categoryId: this.localCategory,
        tagIds: this.localTags,
        collectionName: this.localCollection.trim(),
        episodeNumber: Number(this.localEpisode || 0),
      });
      this.showEditor = false;
    },
    emitClearHistory() {
      this.$emit('clear-history', this.video);
    },
    emitRemove() {
      this.$emit('remove', this.video);
    },
    triggerRebind() {
      this.$refs.rebindInput && this.$refs.rebindInput.click();
    },
    async onRebind(event) {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      if (!files.length) return;
      const validFiles = files.filter(isVideoFile);
      if (!validFiles.length) {
        this.$message.warning('请选择有效的视频文件');
        return;
      }
      if (this.isCollectionCard) {
        this.$emit('rebind-collection', {
          collectionName: this.video.collectionName,
          files: validFiles,
        });
        return;
      }
      const file = validFiles[0];
      const duration = await getVideoDuration(file);
      this.$emit('rebind-source', {
        id: this.video.id,
        sourceUrl: buildVideoSourceFromFile(file),
        duration,
        fileName: file.name,
        size: file.size,
        type: file.type,
      });
    },
  },
};
</script>

<style scoped>
.video-card {
  display: flex;
  flex-direction: column;
}
.cover {
  height: 140px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1f2937, #111827);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-inner {
  text-align: center;
}
.play-icon {
  font-size: 32px;
  margin-bottom: 6px;
}
.info {
  margin: 12px 0;
  font-size: 12px;
  color: #6b7280;
}
.info .row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.editor {
  display: grid;
  gap: 12px;
}
.editor-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 10px;
  align-items: center;
}
.editor-select {
  width: 100%;
}
.hidden-input {
  display: none;
}
</style>
