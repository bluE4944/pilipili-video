<template>
  <div class="home page">
    <a-card :bordered="false" class="hero">
      <div class="hero-content">
        <div>
          <div class="hero-title">本地视频与博客管理中心</div>
          <div class="hero-desc">支持批量导入、分类标签、断点续播与 Markdown 博客管理。</div>
          <div class="hero-actions">
            <a-button type="primary" @click="$router.push('/videos')">进入视频库</a-button>
            <a-button @click="$router.push('/blogs')">进入博客</a-button>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">{{ videos.length }}</div>
            <div class="stat-label">视频数量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ favorites.length }}</div>
            <div class="stat-label">收藏视频</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ blogs.length }}</div>
            <div class="stat-label">博客文章</div>
          </div>
        </div>
      </div>
    </a-card>

    <a-row :gutter="16" class="quick-links">
      <a-col :xs="24" :md="12" :lg="8">
        <a-card hoverable @click="$router.push({ path: '/videos', query: { tab: 'collections' } })">
          <div class="card-title">合集管理</div>
          <div class="card-desc">自动识别剧集，支持合并与拆分。</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :lg="8">
        <a-card hoverable @click="$router.push({ path: '/videos', query: { tab: 'favorites' } })">
          <div class="card-title">我的收藏</div>
          <div class="card-desc">快速访问收藏的视频列表。</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :lg="8">
        <a-card hoverable @click="$router.push('/blogs')">
          <div class="card-title">博客目录</div>
          <div class="card-desc">上传与管理 Markdown 博客。</div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  computed: {
    videos() {
      return this.$store.getters['videoLibrary/videos'] || [];
    },
    favorites() {
      return this.$store.getters['videoLibrary/favorites'] || [];
    },
    blogs() {
      return this.$store.getters['blogLibrary/blogs'] || [];
    },
  },
}
</script>

<style scoped>
.home {
  padding: 16px 12px;
}
.hero {
  margin-bottom: 16px;
}
.hero-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}
.hero-title {
  font-size: 24px;
  font-weight: 700;
}
.hero-desc {
  color: #6b7280;
  margin-top: 6px;
}
.hero-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.stat-item {
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 10px;
  text-align: center;
  min-width: 120px;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
}
.stat-label {
  font-size: 12px;
  color: #6b7280;
}
.quick-links {
  margin-top: 16px;
}
.card-title {
  font-weight: 600;
  font-size: 16px;
}
.card-desc {
  color: #6b7280;
  margin-top: 6px;
}
@media (max-width: 768px) {
  .home {
    padding: 12px 8px;
  }
  .hero-content {
    flex-direction: column;
  }
}
</style>
