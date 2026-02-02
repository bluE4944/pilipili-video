<template>
  <a-card class="blog-card" hoverable @click="toDetail">
    <div class="title">{{ blog.title }}</div>
    <div class="summary">{{ blog.summary }}</div>
    <div class="meta">
      <span>{{ formatDate(blog.publishAt) }}</span>
      <span>阅读 {{ blog.views }}</span>
      <span>点赞 {{ blog.likes }}</span>
      <span>评论 {{ blog.comments.length }}</span>
    </div>
    <div class="actions">
      <a-button size="small" @click.stop="toggleLike" :type="blog.liked ? 'primary' : 'default'" title="点赞">
        <a-icon type="like" />
      </a-button>
      <a-button size="small" @click.stop="toDetail">阅读</a-button>
    </div>
  </a-card>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'BlogCard',
  props: {
    blog: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatDate(value) {
      return value ? dayjs(value).format('YYYY-MM-DD') : '-';
    },
    toDetail() {
      this.$router.push({ name: 'blogDetail', params: { id: this.blog.id } });
    },
    toggleLike() {
      this.$emit('like', this.blog);
    },
  },
};
</script>

<style scoped>
.blog-card {
  display: grid;
  gap: 8px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.summary {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #9ca3af;
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 8px;
}
</style>
