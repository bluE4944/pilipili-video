<template>
  <div class="about bg-about">

    <a-row class="h-100" type="flex" justify="space-around" align="middle">
      <a-card class="card w-75 h-75">
        <a-space direction="vertical">
          <img alt="logo" src="../assets/pilipili-logo.png">
          <h2> pilipili-video </h2>
          <h4> B站，人称小P站 </h4>
          <h5>为了能在家里PB切换，我制作了这个视频网站，当然可能不只视频功能，还有一些个人相关的功能，具体看我的后续吧...</h5>
          <h4> author: Liam</h4>
          <h4> 贡献: 渔关</h4>
          <h4>
            <a-space :size="8">
              <a-icon type="github" @click="open(githubUrl)"/>
              <a-icon type="twitter" @click="open(twitterUrl)"/>
            </a-space>
          </h4>
        </a-space>
      </a-card>
    </a-row>

  </div>
</template>
<script>

  export default {
    name: 'AboutView.vue',
    components: {
    },
    data() {
      return {
        githubUrl: 'https://github.com/bluE4944/pilipili-video',
        twitterUrl: 'https://www.twitter.com',
      }
    },
    methods: {
      open(url) {
        window.open(url);
      }
    },
  }

</script>

<style lang="scss">
  .about {
    font-family: "HarmonyOS Sans Medium",sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  .bg-about{
    background-image:linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%);
    height: 92.7vh;
    position: absolute;
  }



</style>