<template>
  <div class="blog-list">
    <blog-card v-for="item in blogs" :key="item.id" :blog="item" @like="$emit('like', $event)" />
    <a-empty v-if="!blogs.length" description="未找到相关博客" />
  </div>
</template>

<script>
import BlogCard from './BlogCard.vue';

export default {
  name: 'BlogList',
  components: { BlogCard },
  props: {
    blogs: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.blog-list {
  display: grid;
  gap: 16px;
}
</style>
