<template>
  <a-card class="blog-upload-panel" :bordered="false">
    <div class="panel-header">
      <div class="title">Markdown 博客上传</div>
      <div class="desc">上传 .md 文件后自动解析标题、摘要与正文。</div>
    </div>
    <div class="actions">
      <a-button type="primary" icon="upload" @click="triggerSelect">上传 Markdown</a-button>
      <span class="hint">支持 .md 格式</span>
    </div>
    <input ref="fileInput" class="hidden-input" type="file" accept=".md" @change="onFileChange" />
    <a-alert
      v-if="preview.title"
      type="success"
      show-icon
      class="mt-3"
      message="解析成功"
      :description="`标题：${preview.title} / 摘要：${preview.summary}`"
    />
  </a-card>
</template>

<script>
import { marked } from 'marked';
import hljs from 'highlight.js';
import { buildBlogFromMarkdown } from '@/utils/blog';

export default {
  name: 'BlogUploadPanel',
  data() {
    return {
      preview: {
        title: '',
        summary: '',
      },
    };
  },
  methods: {
    triggerSelect() {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    onFileChange(event) {
      const file = (event.target.files || [])[0];
      event.target.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result || '';
        marked.setOptions({
          highlight(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
              return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
          },
        });
        const html = marked.parse(content);
        const blog = buildBlogFromMarkdown(content, html);
        this.preview = {
          title: blog.title,
          summary: blog.summary,
        };
        this.$emit('created', blog);
        this.$message.success('博客已导入');
      };
      reader.readAsText(file, 'utf-8');
    },
  },
};
</script>

<style scoped>
.blog-upload-panel {
  margin-bottom: 16px;
}
.panel-header .title {
  font-size: 18px;
  font-weight: 600;
}
.panel-header .desc {
  color: #6b7280;
  font-size: 13px;
  margin-top: 4px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.hint {
  color: #9ca3af;
  font-size: 12px;
}
.hidden-input {
  display: none;
}
</style>
