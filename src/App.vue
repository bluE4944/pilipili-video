<template>
  <div id="app" class="">
      <a-affix :offset-top="top">
          <nav class="p-3 flex-column justify-content-center ">
              <router-link to="/"><img alt="PILIPILI logo" class="logo pr-3 " src="./assets/PILIPILI-logo-full.png"></router-link>
            <router-link class="p-2 pt-1" to="/">Home</router-link>
            <router-link class="p-2 pt-1" to="/about">About</router-link>
            <router-link class="p-2 pt-1" to="/videoDetail">视频</router-link>
          </nav>
      </a-affix>
    <router-view/>

  </div>
</template>

<script>
  import { Menu } from 'ant-design-vue';
  export default {
    components:{
      Menu,
    },
    data() {
      return {
        current: ['home'],
        top: 10,
      };
    },
  };
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
    .logo{

    }

</style>
