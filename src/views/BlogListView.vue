<template>
  <div class="page blog-list-page">
    <blog-upload-panel @created="addBlog" />
    <blog-search-bar :keyword="keyword" @change="keyword = $event" />
    <blog-list :blogs="filteredBlogs" @like="toggleLike" />
  </div>
</template>

<script>
import BlogUploadPanel from '@/components/blog/BlogUploadPanel.vue';
import BlogSearchBar from '@/components/blog/BlogSearchBar.vue';
import BlogList from '@/components/blog/BlogList.vue';

export default {
  name: 'BlogListView',
  components: {
    BlogUploadPanel,
    BlogSearchBar,
    BlogList,
  },
  data() {
    return {
      keyword: '',
    };
  },
  computed: {
    blogs() {
      return this.$store.getters['blogLibrary/blogs'] || [];
    },
    filteredBlogs() {
      const keyword = (this.keyword || '').toLowerCase();
      return this.blogs
        .filter((blog) => {
          if (!keyword) return true;
          const text = `${blog.title} ${blog.md}`.toLowerCase();
          return text.includes(keyword);
        })
        .slice()
        .sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt));
    },
  },
  methods: {
    addBlog(blog) {
      const next = [blog, ...this.blogs];
      this.$store.dispatch('blogLibrary/setBlogs', next);
    },
    toggleLike(blog) {
      const next = this.blogs.map((item) =>
        item.id === blog.id
          ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
          : item
      );
      this.$store.dispatch('blogLibrary/setBlogs', next);
    },
  },
};
</script>

<style scoped>
.blog-list-page {
  padding: 16px 12px;
}
@media (max-width: 768px) {
  .blog-list-page {
    padding: 12px 8px;
  }
}
</style>
