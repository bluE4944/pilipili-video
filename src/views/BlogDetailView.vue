<template>
  <div class="page blog-detail-page">
    <a-card :bordered="false" class="detail-card">
      <div v-if="!blog">
        <a-empty description="未找到该博客" />
      </div>
      <div v-else>
        <div class="header">
          <div class="title">{{ blog.title }}</div>
          <div class="meta">
            <span>{{ formatDate(blog.publishAt) }}</span>
            <span>阅读 {{ blog.views }}</span>
            <span>点赞 {{ blog.likes }}</span>
            <span>评论 {{ blog.comments.length }}</span>
          </div>
          <div class="actions">
            <a-button size="small" @click="toggleLike" :type="blog.liked ? 'primary' : 'default'" title="点赞">
              <a-icon type="like" />
            </a-button>
            <a-button size="small" @click="$router.push({ name: 'blogs' })">返回目录</a-button>
          </div>
        </div>
        <div class="content markdown-body" v-html="blog.html"></div>
      </div>
    </a-card>
    <blog-comment-list
      v-if="blog"
      :comments="sortedComments"
      @submit="addComment"
      @like="toggleCommentLike"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { marked } from 'marked';
import hljs from 'highlight.js';
import BlogCommentList from '@/components/blog/BlogCommentList.vue';

export default {
  name: 'BlogDetailView',
  components: { BlogCommentList },
  computed: {
    blogId() {
      return this.$route.params.id;
    },
    blog() {
      return this.$store.getters['blogLibrary/blogById'](this.blogId);
    },
    sortedComments() {
      if (!this.blog) return [];
      return (this.blog.comments || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
  },
  mounted() {
    if (!this.blog) return;
    let html = this.blog.html;
    if (!html && this.blog.md) {
      marked.setOptions({
        highlight(code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          return hljs.highlightAuto(code).value;
        },
      });
      html = marked.parse(this.blog.md);
    }
    this.updateBlog({ html });
    this.updateBlog({ views: (this.blog.views || 0) + 1 });
  },
  methods: {
    formatDate(value) {
      return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
    },
    updateBlog(patch) {
      const list = this.$store.getters['blogLibrary/blogs'] || [];
      const next = list.map((item) => (item.id === this.blogId ? { ...item, ...patch } : item));
      this.$store.dispatch('blogLibrary/setBlogs', next);
    },
    toggleLike() {
      const likes = this.blog.liked ? this.blog.likes - 1 : this.blog.likes + 1;
      this.updateBlog({ liked: !this.blog.liked, likes });
    },
    addComment(comment) {
      const nextComments = [comment, ...(this.blog.comments || [])];
      this.updateBlog({ comments: nextComments });
    },
    toggleCommentLike(comment) {
      const nextComments = (this.blog.comments || []).map((item) => {
        if (item.id !== comment.id) return item;
        const liked = !item.liked;
        return {
          ...item,
          liked,
          likes: liked ? item.likes + 1 : Math.max(0, item.likes - 1),
        };
      });
      this.updateBlog({ comments: nextComments });
    },
  },
};
</script>

<style scoped>
.blog-detail-page {
  padding: 16px 12px;
}
.detail-card {
  margin-bottom: 16px;
}
.header {
  margin-bottom: 16px;
}
.title {
  font-size: 24px;
  font-weight: 700;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #6b7280;
  font-size: 12px;
  margin-top: 6px;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.content {
  line-height: 1.7;
  font-size: 15px;
  color: #1f2937;
}
@media (max-width: 768px) {
  .blog-detail-page {
    padding: 12px 8px;
  }
}
</style>
