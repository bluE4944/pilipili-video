<template>
  <div id="app" >
      <a-affix :offset-top="top">
          <nav v-if="false" class="p-3 flex-column justify-content-center ">
            <router-link to="/"><img alt="PILIPILI logo" class="logo pr-3 " src="./assets/PILIPILI-logo-full.png"></router-link>
            <router-link class="p-2 pt-1" to="/">首页</router-link>
            <router-link class="p-2 pt-1" to="/about">About</router-link>
            <router-link class="p-2 pt-1" to="/videoDetail">视频</router-link>
          </nav>
        <my-head/>
      </a-affix>
    <router-view class="container-fluid"/>

  </div>
</template>

<script>
  import myHead from "@/components/Head";

  export default {
    isSubMenu: false,
    components:{
      myHead
    },
    data() {
      return {
        top: 5,
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
        color: #546497;

        &.router-link-exact-active {
          color: #207bd0;
        }
      }
    }

</style>
