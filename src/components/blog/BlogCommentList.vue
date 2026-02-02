<template>
  <div class="comment-section">
    <div class="comment-title">评论区</div>
    <a-form layout="vertical" class="comment-form">
      <a-form-item label="用户名">
        <a-input v-model="form.user" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item label="评论内容">
        <a-textarea v-model="form.content" :rows="3" placeholder="请输入评论内容" />
      </a-form-item>
      <a-button type="primary" @click="submitComment">提交评论</a-button>
    </a-form>
    <div class="comment-list">
      <a-card v-for="item in comments" :key="item.id" class="comment-item">
        <div class="comment-header">
          <span class="user">{{ item.user }}</span>
          <span class="time">{{ formatDate(item.createdAt) }}</span>
        </div>
        <div class="content">{{ item.content }}</div>
        <div class="actions">
          <a-button size="small" @click="toggleLike(item)" :type="item.liked ? 'primary' : 'default'" title="点赞">
            <a-icon type="like" />
          </a-button>
          <span class="like-count">{{ item.likes }}</span>
        </div>
      </a-card>
      <a-empty v-if="!comments.length" description="暂无评论" />
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { buildComment } from '@/utils/blog';

export default {
  name: 'BlogCommentList',
  props: {
    comments: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: {
        user: '',
        content: '',
      },
    };
  },
  methods: {
    formatDate(value) {
      return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
    },
    submitComment() {
      if (!this.form.content.trim()) {
        this.$message.warning('请输入评论内容');
        return;
      }
      const comment = buildComment({
        user: this.form.user,
        content: this.form.content,
      });
      this.$emit('submit', comment);
      this.form.content = '';
    },
    toggleLike(item) {
      this.$emit('like', item);
    },
  },
};
</script>

<style scoped>
.comment-section {
  margin-top: 20px;
}
.comment-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.comment-form {
  margin-bottom: 16px;
}
.comment-list {
  display: grid;
  gap: 12px;
}
.comment-item .comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}
.comment-item .content {
  margin: 8px 0;
  font-size: 14px;
}
.comment-item .actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.comment-item .like-count {
  font-size: 12px;
  color: #6b7280;
}
</style>
