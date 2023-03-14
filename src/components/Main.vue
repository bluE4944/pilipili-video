<template>
    <div class="main mt-sm-2 mt-xl-5 pt-xl-5 pt-sm-2 pt-lg-2 ">
      <a-row>
        <a-col :push="videoParam.videoPush" :span="videoParam.videoSpan" >
          <div id="vue-core-video-player-box" class="example-player" :style="videoStyle" ref="videoPlayerBox">
            <vue-core-video-player :cover="currentMovie.cover3" :src="currentMovie.source" :auto-play="false"></vue-core-video-player>
          </div>
          <div class="movie-detail">
            <a-row type="flex" justify="space-between" align="middle">
              <a-col>
                <span class="title h3">{{currentMovie.title}}</span> 
              </a-col>
            <a-col class="btn-wrap">
              <a-button @click="open">
                <a-icon type="ordered-list" :style="{ fontSize: '17px', color: '#08c'}" class="pb-1"/>
              </a-button>
            </a-col>
          </a-row>
            <div class="date">{{currentMovie.author}} - {{currentMovie.date}}</div>
            <div class="desc">{{currentMovie.desc}} </div>
            
          </div>
        </a-col>
        <a-col :push="playList.push" :span="playList.span" class="play-list">
          <h2>Play List</h2>
          <MovieItem v-for="movie in movieList" :key="movie.cover" :item="movie"></MovieItem>
        </a-col>
      </a-row>
      <a-row v-if="isPc">
        <a-col push="2" span="21">
          <div  class="recommend-list">
            <RecommendedItem v-for="movie in recommendList" :key="movie.cover" :item="movie"></RecommendedItem>
          </div>
        </a-col>

      </a-row>

    </div>
</template>

<script>

import MovieItem from './MovieItem.vue'
import RecommendedItem from './Recommended.vue'
import DATA from '../assets/data';
import {calculateHigh} from '@/components/utils/utils'

let movie = DATA[2];

if (location.search) {
  var vid = location.search.split('=')[1];
  DATA.forEach(item => {
    if (item.id === vid) {
      movie = item
    }
  })
}

export default {
  name: 'Main',
  components: {
    MovieItem,
    RecommendedItem
  },
  data() {
    return {
      title: '',
      movieList: DATA,
      recommendList: [DATA[2], DATA[4], DATA[1], DATA[0]],
      currentMovie: movie,
      url: require("../assets/sparkle_your_name_am720p.mp4"),
      isPc: true,
      mainClassName: 'main mt-5 pt-5',
      videoParam: {
        videoSpan: 14,
        videoPush: 2,
      },
      videoStyle:{
        height: '32vw',
      },
      playList:{
        push: 3,
        span: 5,
      },
    }
  },
  watch:{
  },
  methods: {
    open() {
      window.open('https://github.com/core-player/vue-core-video-player-examples')
    },
    //初始话视频
    initVideo() {
      this.currentMovie.source = this.url;
      if (!this.isPc) {
        this.videoParam.videoSpan = 24;
        this.videoParam.videoPush = 0;
        this.playList.push = 0;
        this.playList.span = 24;
        this.currentMovie.desc = this.currentMovie.desc.substring(0, 150) + '...';
      }
    },
    //重新计算视频高度
    reCalVideoHeight(){
      let videoPlayerBox = this.$refs.videoPlayerBox;
      this.videoStyle.height = calculateHigh(videoPlayerBox.clientWidth) + 'px';
      console.log(this.videoStyle.height);
    }
  },
  mounted() {
    this.reCalVideoHeight();
  },
  created() {
    this.isPc = this.$store.isPc;
    this.initVideo();
  }
}
</script>

<style>
  .example-player {
    background-color: #000;
    min-width: 56vw;
  }
  .movie-detail{
    padding-top: 20px;
    color: rgba(0,0,0, .65);
  }
  .movie-detail h1{
    font-size: 20px;
    color: #000;
  }
  .movie-detail .date {
    font-size: 14px;
  }
  .movie-detail .desc {
    font-size: 13px;
    padding: 10px 20px 10px 0;
  }
  .movie-detail .btn-wrap {
    padding-right: 20px;
    text-align: right;
  }
  .play-list h2 {
    font-size: 18px;
    color: rgba(0,0,0, .85);
    padding-bottom: 10px;
  }
  .recommend-list {
    margin-top: 40px;
    padding-top: 40px;
    padding-bottom: 40px;
    border-top: 1px solid #ddd;
  }
  .recommend-list:after{
    content: '';
    display: block;
    clear: both;
  }

</style>
