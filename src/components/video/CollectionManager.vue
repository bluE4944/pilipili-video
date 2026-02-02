<template>
  <a-card class="collection-manager" :bordered="false">
    <div class="manager-header">
      <div>
        <div class="title">自动合集</div>
        <div class="desc">根据文件名自动归类，可手动重命名、合并或拆分。</div>
      </div>
      <div class="merge-box">
        <a-select
          v-model="selectedCollections"
          mode="multiple"
          placeholder="选择需要合并的合集"
          style="min-width: 240px"
        >
          <a-select-option v-for="item in collections" :key="item.name" :value="item.name">
            {{ item.name }}
          </a-select-option>
        </a-select>
        <a-input v-model="mergeName" placeholder="新合集名称" style="min-width: 160px" />
        <a-button type="primary" @click="mergeCollections">合并</a-button>
      </div>
    </div>
    <div v-if="collections.length" class="collection-list">
      <a-card v-for="item in collections" :key="item.name" class="collection-item">
        <div class="collection-header">
          <div class="name">
            <a-input v-model="renameMap[item.name]" />
          </div>
          <div class="actions">
            <a-button size="small" @click="renameCollection(item.name)">重命名</a-button>
            <a-button size="small" @click="splitCollection(item.name)">拆分</a-button>
          </div>
        </div>
        <div class="episodes">
          <span v-for="video in item.videos" :key="video.id" class="episode">
            第{{ video.episodeNumber || 0 }}集 · {{ video.title }}
          </span>
        </div>
      </a-card>
    </div>
    <a-empty v-else description="暂无合集" />
  </a-card>
</template>

<script>
export default {
  name: 'CollectionManager',
  props: {
    collections: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedCollections: [],
      mergeName: '',
      renameMap: {},
    };
  },
  watch: {
    collections: {
      immediate: true,
      handler(list) {
        const map = {};
        list.forEach((item) => {
          map[item.name] = item.name;
        });
        this.renameMap = map;
      },
    },
  },
  methods: {
    mergeCollections() {
      const name = this.mergeName.trim();
      if (!name || this.selectedCollections.length < 2) {
        this.$message.warning('请选择至少两个合集并填写新名称');
        return;
      }
      this.$emit('merge', {
        names: this.selectedCollections,
        targetName: name,
      });
      this.selectedCollections = [];
      this.mergeName = '';
    },
    renameCollection(name) {
      const newName = (this.renameMap[name] || '').trim();
      if (!newName || newName === name) return;
      this.$emit('rename', { name, newName });
    },
    splitCollection(name) {
      this.$emit('split', { name });
    },
  },
};
</script>

<style scoped>
.manager-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.desc {
  color: #6b7280;
  font-size: 13px;
}
.merge-box {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.collection-list {
  display: grid;
  gap: 16px;
}
.collection-item {
  background: #fff;
}
.collection-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  align-items: center;
}
.episodes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: #6b7280;
  font-size: 12px;
}
.episode {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 999px;
}
</style>
