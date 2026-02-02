<template>
  <div class="video-grid">
    <video-card
      v-for="item in videos"
      :key="item.id"
      :video="item"
      :categories="categories"
      :tags="tags"
      :category-map="categoryMap"
      :tag-map="tagMap"
      @like="$emit('like', $event)"
      @favorite="$emit('favorite', $event)"
      @update-meta="$emit('update-meta', $event)"
      @clear-history="$emit('clear-history', $event)"
      @rebind-source="$emit('rebind-source', $event)"
      @rebind-collection="$emit('rebind-collection', $event)"
      @remove="$emit('remove', $event)"
    />
    <a-empty v-if="!videos.length" description="暂无视频" />
  </div>
</template>

<script>
import VideoCard from './VideoCard.vue';

export default {
  name: 'VideoGrid',
  components: { VideoCard },
  props: {
    videos: {
      type: Array,
      default: () => [],
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
};
</script>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}
@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>
