<template>
  <div class="page video-player">
    <a-card :bordered="false" class="player-card">
      <div v-if="!video" class="empty">
        <a-empty description="未找到该视频" />
      </div>
      <div v-else>
        <video
          ref="videoEl"
          class="video-js vjs-default-skin video-player-box"
          playsinline
        ></video>
        <div class="player-meta">
          <div class="title">{{ video.title }}</div>
          <div class="meta-row">
            <span>文件名：{{ video.fileName }}</span>
            <span>合集：{{ video.collectionName || '单集' }}</span>
          </div>
          <div class="meta-row">
            <span>时长：{{ durationText }}</span>
            <span>上传时间：{{ formatDate(video.uploadAt) }}</span>
          </div>
          <div class="controls">
            <a-button size="small" @click="toggleLike" :type="video.liked ? 'primary' : 'default'" title="点赞">
              <a-icon type="like" />
            </a-button>
            <a-button size="small" @click="toggleFavorite" :type="video.favorited ? 'danger' : 'default'" title="收藏">
              <a-icon type="star" />
            </a-button>
            <a-select v-model="localRate" size="small" class="rate-select" @change="applyRate">
              <a-select-option v-for="rate in rates" :key="rate" :value="rate">{{ rate }}x</a-select-option>
            </a-select>
            <a-button size="small" @click="clearHistory">清除播放记忆</a-button>
            <div class="auto-play">
              <span class="auto-play-label">自动下一集</span>
              <a-switch v-model="autoPlayEnabled" size="small" />
            </div>
          </div>
          <div v-if="historyTime" class="history-tip">
            上次播放到 {{ formatDuration(historyTime) }}，将自动续播
          </div>
          <a-alert
            v-if="!video.sourceUrl"
            type="warning"
            show-icon
            message="播放源缺失"
            description="请在视频库中点击“重新绑定文件”以恢复播放。"
          />
        </div>
      </div>
    </a-card>

    <a-card v-if="collectionVideos.length" class="collection-card" :bordered="false">
      <div class="collection-title">合集剧集</div>
      <div class="episode-list">
        <a-button
          v-for="item in collectionVideos"
          :key="item.id"
          :type="item.id === videoId ? 'primary' : 'default'"
          size="small"
          @click="playEpisode(item.id)"
        >
          第{{ item.episodeNumber || 0 }}集
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import throttle from 'lodash/throttle';
import dayjs from 'dayjs';
import { createHistoryItem, formatDuration, sortByEpisode } from '@/utils/video';

export default {
  name: 'VideoPlayerView',
  data() {
    return {
      player: null,
      localRate: 1,
      rates: [0.5, 1, 1.25, 1.5, 2],
      autoPlayNext: false,
    };
  },
  computed: {
    videoId() {
      return this.$route.params.id;
    },
    video() {
      return this.$store.getters['videoLibrary/videoById'](this.videoId);
    },
    playHistory() {
      return this.$store.getters['videoLibrary/playHistory'] || {};
    },
    historyTime() {
      const item = this.playHistory[this.videoId];
      return item ? item.time : 0;
    },
    durationText() {
      return formatDuration((this.video && this.video.duration) || 0);
    },
    collectionVideos() {
      if (!this.video || !this.video.collectionName) return [];
      const list = this.$store.getters['videoLibrary/videos'] || [];
      return list
        .filter((item) => item.collectionName === this.video.collectionName)
        .slice()
        .sort(sortByEpisode);
    },
    autoPlayEnabled: {
      get() {
        return this.$store.getters['videoLibrary/autoPlayNext'];
      },
      set(value) {
        this.$store.dispatch('videoLibrary/setAutoPlayNext', value);
      },
    },
  },
  created() {
    this.localRate = this.$store.getters['videoLibrary/playRate'] || 1;
  },
  mounted() {
    this.initPlayer();
  },
  beforeDestroy() {
    this.disposePlayer();
  },
  watch: {
    videoId() {
      this.initPlayer();
    },
    video() {
      this.initPlayer();
    },
  },
  methods: {
    formatDate(value) {
      return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
    },
    formatDuration,
    initPlayer() {
      this.$nextTick(() => {
        if (!this.video || !this.$refs.videoEl) return;
        const source = {
          src: this.video.sourceUrl || '',
          type: this.video.type || 'video/mp4',
        };
        if (this.player) {
          this.player.src(source);
          this.player.one('loadedmetadata', () => {
            this.restorePlayback();
          });
          return;
        }
        const options = {
          controls: true,
          autoplay: false,
          fluid: true,
          playbackRates: this.rates,
          sources: [source],
        };
        this.player = videojs(this.$refs.videoEl, options, () => {
          this.restorePlayback();
        });
        this.bindPlayerEvents();
      });
    },
    bindPlayerEvents() {
      if (!this.player) return;
      this.player.on('timeupdate', () => {
        this.throttledSave(this.player.currentTime());
      });
      this.player.on('ended', () => {
        this.onEnded();
      });
      this.player.on('ratechange', () => {
        this.onRateChange();
      });
      this.player.on('error', () => {
        if (this.video && this.video.sourceUrl) {
          this.$message.warning('播放源可能已失效，请重新绑定文件');
        }
      });
    },
    restorePlayback() {
      if (!this.player) return;
      if (this.historyTime) {
        this.player.currentTime(this.historyTime);
      }
      if (this.localRate) {
        this.player.playbackRate(this.localRate);
      }
      if (this.autoPlayNext) {
        this.player.play();
        this.autoPlayNext = false;
      }
    },
    disposePlayer() {
      if (this.player) {
        this.player.dispose();
        this.player = null;
      }
    },
    onEnded() {
      if (!this.video) return;
      const list = this.collectionVideos;
      const index = list.findIndex((item) => item.id === this.videoId);
      if (index >= 0 && index < list.length - 1) {
        if (!this.autoPlayEnabled) {
          this.$message.info('自动下一集已关闭');
          return;
        }
        const next = list[index + 1];
        this.autoPlayNext = true;
        this.$router.push({ name: 'videoPlayer', params: { id: next.id } });
        return;
      }
      this.$message.info('合集已播放完毕');
    },
    onRateChange() {
      const rate = this.player ? this.player.playbackRate() : 1;
      this.localRate = rate;
      this.$store.dispatch('videoLibrary/setPlayRate', rate);
    },
    applyRate(rate) {
      if (this.player) {
        this.player.playbackRate(rate);
      }
      this.$store.dispatch('videoLibrary/setPlayRate', rate);
    },
    throttledSave: throttle(function (time) {
      const history = { ...this.playHistory };
      history[this.videoId] = createHistoryItem(time);
      this.$store.dispatch('videoLibrary/setPlayHistory', history);
    }, 2000),
    clearHistory() {
      const history = { ...this.playHistory };
      delete history[this.videoId];
      this.$store.dispatch('videoLibrary/setPlayHistory', history);
      this.$message.success('已清除播放记忆');
    },
    toggleLike() {
      this.updateVideoMeta({ liked: !this.video.liked });
    },
    toggleFavorite() {
      this.updateVideoMeta({ favorited: !this.video.favorited });
    },
    updateVideoMeta(patch) {
      const list = this.$store.getters['videoLibrary/videos'] || [];
      const next = list.map((item) => (item.id === this.videoId ? { ...item, ...patch } : item));
      this.$store.dispatch('videoLibrary/setVideos', next);
    },
    playEpisode(id) {
      if (id === this.videoId) return;
      this.$router.push({ name: 'videoPlayer', params: { id } });
    },
  },
};
</script>

<style scoped>
.video-player {
  padding: 16px 12px;
}
.player-card {
  margin-bottom: 16px;
}
.video-player-box {
  width: 100%;
}
.player-meta {
  margin-top: 16px;
}
.title {
  font-size: 20px;
  font-weight: 600;
}
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #6b7280;
  font-size: 13px;
  margin-top: 6px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}
.auto-play {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.auto-play-label {
  font-size: 12px;
  color: #6b7280;
}
.rate-select {
  min-width: 100px;
}
.history-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #2563eb;
}
.collection-card {
  margin-top: 16px;
}
.collection-title {
  font-weight: 600;
  margin-bottom: 10px;
}
.episode-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.empty {
  padding: 32px 0;
}
@media (max-width: 768px) {
  .video-player {
    padding: 12px 8px;
  }
}
</style>
