<template>
  <a-modal
    title="分类与标签管理"
    :visible="visible"
    @ok="onSave"
    @cancel="onCancel"
    ok-text="保存"
    cancel-text="取消"
    width="680px"
  >
    <div class="manager">
      <div class="section">
        <div class="section-title">分类</div>
        <div class="section-actions">
          <a-input v-model="newCategory" placeholder="新增分类名称" />
          <a-button type="primary" @click="addCategory">添加</a-button>
        </div>
        <div class="chip-list">
          <div v-for="item in localCategories" :key="item.id" class="chip">
            <a-input v-model="item.name" class="chip-input" />
            <a-icon type="delete" class="chip-icon" @click="removeCategory(item.id)" />
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">标签</div>
        <div class="section-actions">
          <a-input v-model="newTag" placeholder="新增标签名称" />
          <a-button type="primary" @click="addTag">添加</a-button>
        </div>
        <div class="chip-list">
          <div v-for="item in localTags" :key="item.id" class="chip">
            <a-input v-model="item.name" class="chip-input" />
            <a-icon type="delete" class="chip-icon" @click="removeTag(item.id)" />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { uid } from '@/utils/storage';

export default {
  name: 'CategoryTagManager',
  props: {
    visible: {
      type: Boolean,
      default: false,
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
      localCategories: this.categories.map((item) => ({ ...item })),
      localTags: this.tags.map((item) => ({ ...item })),
      newCategory: '',
      newTag: '',
    };
  },
  watch: {
    categories(val) {
      this.localCategories = val.map((item) => ({ ...item }));
    },
    tags(val) {
      this.localTags = val.map((item) => ({ ...item }));
    },
  },
  methods: {
    addCategory() {
      const name = this.newCategory.trim();
      if (!name) return;
      this.localCategories.push({ id: uid('cat'), name });
      this.newCategory = '';
    },
    removeCategory(id) {
      this.localCategories = this.localCategories.filter((item) => item.id !== id);
    },
    addTag() {
      const name = this.newTag.trim();
      if (!name) return;
      this.localTags.push({ id: uid('tag'), name });
      this.newTag = '';
    },
    removeTag(id) {
      this.localTags = this.localTags.filter((item) => item.id !== id);
    },
    onSave() {
      this.$emit('save', {
        categories: this.localCategories.filter((item) => item.name.trim()),
        tags: this.localTags.filter((item) => item.name.trim()),
      });
      this.$emit('update:visible', false);
    },
    onCancel() {
      this.$emit('update:visible', false);
    },
  },
};
</script>

<style scoped>
.manager {
  display: grid;
  gap: 20px;
}
.section-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.section-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.chip-list {
  display: grid;
  gap: 10px;
}
.chip {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.chip-input {
  border: none;
  box-shadow: none;
}
.chip-icon {
  color: #ef4444;
  cursor: pointer;
}
</style>
