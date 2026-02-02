<template>
  <div class="page video-library">
    <video-upload-panel
      :existing-keys="existingKeys"
      @uploaded="onUploaded"
    />
    <a-alert
      type="info"
      show-icon
      class="mb-3"
      message="提示"
      description="浏览器限制下无法持久保存视频文件，仅保存元数据；刷新后如需播放请重新绑定文件。"
    />
    <a-tabs v-model="activeTab" @change="onTabChange">
      <a-tab-pane key="library" tab="视频库">
        <video-filters
          :keyword="filters.keyword"
          :category-id="filters.categoryId"
          :tag-ids="filters.tagIds"
          :categories="categories"
          :tags="tags"
          @change="onFilterChange"
          @save-manager="onSaveManager"
        />
        <video-grid
          :videos="displayVideos"
          :categories="categories"
          :tags="tags"
          :category-map="categoryMap"
          :tag-map="tagMap"
          @like="toggleLike"
          @favorite="toggleFavorite"
          @update-meta="updateVideoMeta"
          @clear-history="clearHistory"
          @rebind-source="rebindSource"
          @rebind-collection="rebindCollection"
          @remove="removeVideo"
        />
      </a-tab-pane>
      <a-tab-pane key="collections" tab="合集管理">
        <collection-manager
          :collections="collections"
          @merge="mergeCollections"
          @rename="renameCollection"
          @split="splitCollection"
        />
      </a-tab-pane>
      <a-tab-pane key="favorites" tab="我的收藏">
        <video-grid
          :videos="favoriteVideos"
          :categories="categories"
          :tags="tags"
          :category-map="categoryMap"
          :tag-map="tagMap"
          @like="toggleLike"
          @favorite="toggleFavorite"
          @update-meta="updateVideoMeta"
          @clear-history="clearHistory"
          @rebind-source="rebindSource"
          @rebind-collection="rebindCollection"
          @remove="removeVideo"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import VideoUploadPanel from '@/components/video/VideoUploadPanel.vue';
import VideoFilters from '@/components/video/VideoFilters.vue';
import VideoGrid from '@/components/video/VideoGrid.vue';
import CollectionManager from '@/components/video/CollectionManager.vue';
import {
  buildVideoKey,
  extractCollectionInfo,
  getVideoDuration,
  buildVideoSourceFromFile,
  sortByEpisode,
  isVideoFile,
} from '@/utils/video';

export default {
  name: 'VideoLibraryView',
  components: {
    VideoUploadPanel,
    VideoFilters,
    VideoGrid,
    CollectionManager,
  },
  data() {
    return {
      activeTab: 'library',
      filters: {
        keyword: '',
        categoryId: '',
        tagIds: [],
      },
    };
  },
  computed: {
    videos() {
      return this.$store.getters['videoLibrary/videos'] || [];
    },
    categories() {
      return this.$store.getters['videoLibrary/categories'] || [];
    },
    tags() {
      return this.$store.getters['videoLibrary/tags'] || [];
    },
    collections() {
      return this.$store.getters['videoLibrary/collections'] || [];
    },
    favoriteVideos() {
      return this.$store.getters['videoLibrary/favorites'] || [];
    },
    categoryMap() {
      return this.categories.reduce((map, item) => {
        map[item.id] = item.name;
        return map;
      }, {});
    },
    tagMap() {
      return this.tags.reduce((map, item) => {
        map[item.id] = item.name;
        return map;
      }, {});
    },
    existingKeys() {
      return this.videos.map((item) => buildVideoKey(item.fileName, item.size));
    },
    filteredVideos() {
      const keyword = (this.filters.keyword || '').toLowerCase();
      return this.videos.filter((video) => {
        const matchKeyword =
          !keyword ||
          (video.title || '').toLowerCase().includes(keyword) ||
          (video.fileName || '').toLowerCase().includes(keyword);
        const matchCategory = !this.filters.categoryId || video.categoryId === this.filters.categoryId;
        const matchTags =
          !this.filters.tagIds.length ||
          this.filters.tagIds.every((id) => (video.tagIds || []).includes(id));
        return matchKeyword && matchCategory && matchTags;
      });
    },
    displayVideos() {
      const list = this.filteredVideos || [];
      const counts = {};
      list.forEach((video) => {
        if (video.collectionName) {
          counts[video.collectionName] = (counts[video.collectionName] || 0) + 1;
        }
      });
      const seen = new Set();
      const result = [];
      list.forEach((video) => {
        if (!video.collectionName) {
          result.push(video);
          return;
        }
        if (seen.has(video.collectionName)) return;
        seen.add(video.collectionName);
        const group = list.filter((item) => item.collectionName === video.collectionName);
        const sorted = group.slice().sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
        const first = sorted[0] || video;
        result.push({
          ...first,
          displayTitle: video.collectionName,
          collectionCount: counts[video.collectionName] || group.length,
        });
      });
      return result;
    },
  },
  watch: {
    '$route.query.tab': {
      immediate: true,
      handler(tab) {
        if (tab) {
          this.activeTab = tab;
        }
      },
    },
  },
  methods: {
    onTabChange(tab) {
      this.$router.replace({ query: { ...this.$route.query, tab } });
    },
    onFilterChange(payload) {
      this.filters = { ...this.filters, ...payload };
    },
    onSaveManager({ categories, tags }) {
      const categoryIds = new Set(categories.map((item) => item.id));
      const tagIds = new Set(tags.map((item) => item.id));
      const nextVideos = this.videos.map((video) => ({
        ...video,
        categoryId: categoryIds.has(video.categoryId) ? video.categoryId : '',
        tagIds: (video.tagIds || []).filter((id) => tagIds.has(id)),
      }));
      this.$store.dispatch('videoLibrary/setCategories', categories);
      this.$store.dispatch('videoLibrary/setTags', tags);
      this.$store.dispatch('videoLibrary/setVideos', nextVideos);
    },
    onUploaded(videoItems) {
      const existing = this.videos.slice();
      const keys = new Set(existing.map((item) => buildVideoKey(item.fileName, item.size)));
      const merged = existing.concat(videoItems.filter((item) => !keys.has(buildVideoKey(item.fileName, item.size))));
      this.$store.dispatch('videoLibrary/setVideos', merged);
      this.$message.success(`成功导入 ${videoItems.length} 个视频`);
    },
    updateVideoMeta({ id, ...patch }) {
      const next = this.videos.map((video) => (video.id === id ? { ...video, ...patch } : video));
      this.$store.dispatch('videoLibrary/setVideos', next);
    },
    toggleLike(video) {
      this.updateVideoMeta({ id: video.id, liked: !video.liked });
    },
    toggleFavorite(video) {
      this.updateVideoMeta({ id: video.id, favorited: !video.favorited });
    },
    clearHistory(video) {
      const history = { ...(this.$store.getters['videoLibrary/playHistory'] || {}) };
      delete history[video.id];
      this.$store.dispatch('videoLibrary/setPlayHistory', history);
      this.$message.success('已清除播放记忆');
    },
    rebindSource(payload) {
      const { id, sourceUrl, duration, fileName, size, type } = payload;
      const { collectionName, episodeNumber } = extractCollectionInfo(fileName);
      this.updateVideoMeta({
        id,
        sourceUrl,
        duration,
        fileName,
        size,
        type,
        collectionName,
        episodeNumber,
      });
      this.$message.success('已重新绑定文件');
    },
    async rebindCollection(payload) {
      const { collectionName, files } = payload || {};
      const targetVideos = this.videos.filter((video) => video.collectionName === collectionName);
      if (!targetVideos.length) {
        this.$message.warning('未找到可绑定的合集');
        return;
      }
      const validFiles = (files || []).filter(isVideoFile);
      if (!validFiles.length) {
        this.$message.warning('请选择有效的视频文件');
        return;
      }
      const fileInfos = await Promise.all(
        validFiles.map(async (file) => {
          const duration = await getVideoDuration(file);
          const info = extractCollectionInfo(file.name);
          return {
            file,
            duration,
            episodeNumber: info.episodeNumber || 0,
          };
        })
      );
      const byEpisode = {};
      targetVideos.forEach((video) => {
        const ep = Number(video.episodeNumber || 0);
        if (ep) {
          byEpisode[ep] = video;
        }
      });
      const updates = [];
      const usedIds = new Set();
      const unmatched = [];
      const buildPatch = (target, info) => ({
        id: target.id,
        sourceUrl: buildVideoSourceFromFile(info.file),
        duration: info.duration,
        fileName: info.file.name,
        size: info.file.size,
        type: info.file.type,
        collectionName: target.collectionName || collectionName,
        episodeNumber: info.episodeNumber || target.episodeNumber || 0,
      });
      fileInfos.forEach((info) => {
        const ep = Number(info.episodeNumber || 0);
        const target = ep ? byEpisode[ep] : null;
        if (target && !usedIds.has(target.id)) {
          updates.push(buildPatch(target, info));
          usedIds.add(target.id);
        } else {
          unmatched.push(info);
        }
      });
      const remaining = targetVideos.filter((video) => !usedIds.has(video.id)).slice().sort(sortByEpisode);
      unmatched.forEach((info, index) => {
        const target = remaining[index];
        if (!target) return;
        updates.push(buildPatch(target, info));
        usedIds.add(target.id);
      });
      if (!updates.length) {
        this.$message.warning('未匹配到可绑定的文件');
        return;
      }
      const map = updates.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
      const next = this.videos.map((video) => (map[video.id] ? { ...video, ...map[video.id] } : video));
      this.$store.dispatch('videoLibrary/setVideos', next);
      this.$message.success(`已绑定 ${updates.length} 个文件`);
    },
    removeVideo(video) {
      const next = this.videos.filter((item) => item.id !== video.id);
      const history = { ...(this.$store.getters['videoLibrary/playHistory'] || {}) };
      delete history[video.id];
      this.$store.dispatch('videoLibrary/setVideos', next);
      this.$store.dispatch('videoLibrary/setPlayHistory', history);
    },
    renameCollection({ name, newName }) {
      const next = this.videos.map((video) =>
        video.collectionName === name ? { ...video, collectionName: newName } : video
      );
      this.$store.dispatch('videoLibrary/setVideos', next);
      this.$message.success('合集已重命名');
    },
    splitCollection({ name }) {
      const next = this.videos.map((video) =>
        video.collectionName === name ? { ...video, collectionName: '' } : video
      );
      this.$store.dispatch('videoLibrary/setVideos', next);
      this.$message.success('合集已拆分');
    },
    mergeCollections({ names, targetName }) {
      const nameSet = new Set(names);
      const next = this.videos.map((video) =>
        nameSet.has(video.collectionName) ? { ...video, collectionName: targetName } : video
      );
      this.$store.dispatch('videoLibrary/setVideos', next);
      this.$message.success('合集已合并');
    },
  },
};
</script>

<style scoped>
.video-library {
  padding: 16px 12px;
}
@media (max-width: 768px) {
  .video-library {
    padding: 12px 8px;
  }
}
</style>
