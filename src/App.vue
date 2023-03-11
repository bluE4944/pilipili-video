<template>
  <div id="app" >
      <a-layout  class="layout" v-if="isPc">
          <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%',background: '#fafafa' }">
              <pc-head />
          </a-layout-header>
          <a-layout-content>
              <router-view class="container-fluid"/>
          </a-layout-content>
          <a-layout-footer :style="{ textAlign: 'center',background:'none' }">
              pilipili-video ©2023 Created by Liam
          </a-layout-footer>
      </a-layout>


      <a-layout style="min-height: 100vh ; background:#fafafa " v-if="!isPc">
          <a-layout-sider style="background:#fafafa;"
                          v-model="collapsed"
                          collapsible
                          :collapsedWidth="0"
                          :defaultCollapsed=true
                          :zeroWidthTriggerStyle="{
                              backgroundImage: 'linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%)',
                              top: 10,
                          }">
              <mobile-head/>
          </a-layout-sider>
          <a-layout>

              <a-layout-content>
                  <router-view class="container-fluid"/>
              </a-layout-content>
              <a-layout-footer :style="{ textAlign: 'center',background:'none' }">
                  pilipili-video ©2023 Created by Liam
              </a-layout-footer>
          </a-layout>
      </a-layout>



  </div>
</template>

<script>
  import PcHead from "@/components/Head";
  import MobileHead from "@/components/MobileHead";

  export default {
      isSubMenu: false,
      components:{
          PcHead,
          MobileHead,
      },
      data() {
          return {
              top: 5,
              isPc: true,
              pathName: '',
              collapsed: true,
          };
      },
      methods:{
          _isMobile() {
              let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
              console.log("flag:",flag);
              return !!flag;
          }
      },
      mounted() {
          this.pathName = this.$route.name;
          console.log(this.pathName);
      },
      created() {
          //pc
          this.isPc = !this._isMobile();
          this.$store.isPc = this.isPc;
          console.log('isPc',this.$store.isPc);
      }

  };
</script>

<style lang="scss">
    #app {
      font-family: "HarmonyOS Sans Medium", sans-serif;
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
