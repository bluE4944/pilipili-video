<template>
  <a-card class="video-filters" :bordered="false">
    <div class="filters-row">
      <a-input-search
        v-model="localKeyword"
        placeholder="搜索视频标题/文件名"
        allowClear
        class="filter-search"
        @search="emitChange"
      />
      <a-select
        v-model="localCategory"
        allowClear
        placeholder="选择分类"
        class="filter-select"
        @change="emitChange"
      >
        <a-select-option v-for="item in categories" :key="item.id" :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
      <a-select
        v-model="localTags"
        mode="multiple"
        allowClear
        placeholder="筛选标签"
        class="filter-select"
        @change="emitChange"
      >
        <a-select-option v-for="item in tags" :key="item.id" :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
      <a-button icon="setting" @click="showManager = true">管理分类/标签</a-button>
    </div>
    <category-tag-manager
      v-if="showManager"
      :visible.sync="showManager"
      :categories="categories"
      :tags="tags"
      @save="onSaveManager"
    />
  </a-card>
</template>

<script>
import CategoryTagManager from './CategoryTagManager.vue';

export default {
  name: 'VideoFilters',
  components: { CategoryTagManager },
  props: {
    keyword: {
      type: String,
      default: '',
    },
    categoryId: {
      type: String,
      default: '',
    },
    tagIds: {
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
  },
  data() {
    return {
      localKeyword: this.keyword,
      localCategory: this.categoryId,
      localTags: this.tagIds.slice(),
      showManager: false,
    };
  },
  watch: {
    keyword(val) {
      this.localKeyword = val;
    },
    categoryId(val) {
      this.localCategory = val;
    },
    tagIds(val) {
      this.localTags = val.slice();
    },
  },
  methods: {
    emitChange() {
      this.$emit('change', {
        keyword: this.localKeyword,
        categoryId: this.localCategory,
        tagIds: this.localTags,
      });
    },
    onSaveManager(payload) {
      this.$emit('save-manager', payload);
      this.showManager = false;
    },
  },
};
</script>

<style scoped>
.video-filters {
  margin-bottom: 16px;
}
.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.filter-search {
  flex: 1 1 220px;
  min-width: 180px;
}
.filter-select {
  min-width: 160px;
}
</style>
