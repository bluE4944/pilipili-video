<template>
  <a-card class="blog-search" :bordered="false">
    <div class="search-row">
      <a-input
        v-model="localKeyword"
        allowClear
        placeholder="搜索标题或内容关键词"
        @input="onInput"
      />
    </div>
  </a-card>
</template>

<script>
import debounce from 'lodash/debounce';

export default {
  name: 'BlogSearchBar',
  props: {
    keyword: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      localKeyword: this.keyword,
    };
  },
  watch: {
    keyword(val) {
      this.localKeyword = val;
    },
  },
  created() {
    this.emitChange = debounce(() => {
      this.$emit('change', this.localKeyword);
    }, 200);
  },
  methods: {
    onInput() {
      this.emitChange();
    },
  },
};
</script>

<style scoped>
.blog-search {
  margin-bottom: 16px;
}
.search-row {
  display: flex;
  gap: 12px;
}
</style>
