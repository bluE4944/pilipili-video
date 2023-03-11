<template>
  <div class="about pt-2 bg-about">

    <a-row type="flex" justify="space-around" align="middle">
      <a-card class="card w-75 " >
        <a-space direction="vertical">
          <img alt="logo" src="../assets/pilipili-logo.png">
          <h2> pilipili-video </h2>
          <h4> author: Liam</h4>
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
    height: 95vh;
    position: absolute;
  }



</style>