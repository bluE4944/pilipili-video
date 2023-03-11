<template>
    <div class="main mt-5 pt-5">
      <a-row>
        <a-col push="2" span="14" >
          <div id="vue-core-video-player-box" class="example-player">
            <vue-core-video-player :cover="currentMovie.cover3" :src="url" :auto-play="false"></vue-core-video-player>
          </div>
          <div class="movie-detail">
            <h1 class="title">{{currentMovie.title}}</h1>
            <div class="date">{{currentMovie.author}} - {{currentMovie.date}}</div>
            <div class="desc">{{currentMovie.desc}} </div>
            <div class="btn-wrap">
              <b-button variant="outline-primary" @click="open">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="#ff6060"><path d="M5 15a.502.502 0 0 1-.354-.146l-4-4a.5.5 0 0 1 0-.707l4-4a.5.5 0 0 1 .707.707L1.707 10.5l3.646 3.646a.5.5 0 0 1-.354.853zM15 15a.5.5 0 0 1-.354-.853l3.646-3.646-3.646-3.646a.5.5 0 0 1 .707-.707l4 4a.5.5 0 0 1 0 .707l-4 4a.498.498 0 0 1-.354.146zM7.5 15a.5.5 0 0 1-.424-.765l5-8a.5.5 0 0 1 .848.53l-5 8A.5.5 0 0 1 7.5 15z"/></svg>
                View Code
              </b-button>
            </div>
          </div>
        </a-col>
        <a-col push="3" span="5" v-if="isPc" class="play-list">
          <h2>Play List</h2>
          <MovieItem v-for="movie in movieList" :key="movie.cover" :item="movie"></MovieItem>
        </a-col>


      </a-row>
      <a-row>
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
import DATA from '../assets/data'

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
    }
  },
  methods: {
    open() {
      window.open('https://github.com/core-player/vue-core-video-player-examples')
    }
  },
  created() {
    this.isPc = this.$store.isPc;
  }
}
</script>

<style>
  .example-player {
    height: 710px;
    background-color: #000;
    font-weight: normal;
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
