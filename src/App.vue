<template>
  <div id="app" >
    <div class="first-loading-wrp bg" v-if="$store.state.showLoading">
        <a-spin tip=" Loading..." :indicator="indicator" size="large" />
    </div>
      <!-- 桌面端 -->
      <a-layout  class="layout" v-if="isPc">
          <a-layout-header class="shadow-sm bg-color" :style="{ position: 'fixed', zIndex: 99, width: '100%',background: '#fafafa',height:'55px',lineHeight: '55px'}">
              <pc-head />
          </a-layout-header>
          <a-layout-content style="margin-top: 55px;">
            <a-spin :spinning="$store.state.showLoading" :indicator="indicatorNo">
              <keep-alive>
                <router-view v-if="$route.meta.keepAlive" class="container-fluid"/>
              </keep-alive>
              <router-view v-if="!$route.meta.keepAlive" class="container-fluid"/>
                <a-back-top />  
            </a-spin>
          </a-layout-content>
          <a-layout-footer v-if="footerRouteName.includes($route.name)" :style="{ textAlign: 'center',background:'none' }">
              <a-divider />
              pilipili-video ©2023 Created by Liam
          </a-layout-footer>
      </a-layout>

      <!-- 移动端 -->
      <a-layout style="min-height: 100vh ; background:#fafafa " v-if="!isPc">
          <!-- <a-layout-sider style="background:#fafafa;"
                          v-model="collapsed"
                          collapsible
                          :collapsedWidth="0"
                          :defaultCollapsed=true
                          :zeroWidthTriggerStyle="{
                              backgroundImage: 'linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%)',
                              top: 10,
                              paddingBottom: 10,
                          }"
                          :trigger="indicator"
                          >
              <mobile-head/>
          </a-layout-sider> -->
          <a-layout>
              <a-layout-header class="bg-color" :style="{ position: 'fixed', zIndex: 99, width: '100%',background: '#fafafa',height:'55px',padding: '0 30px',lineHeight: '55px'}">
                <mobile-head/>
              </a-layout-header>
              <a-layout-content style="margin-top: 55px;">
                <a-spin class="center" :spinning="$store.state.showLoading" :indicator="indicator" tip=" Loading..." size="large">
                    <router-view/>
                </a-spin>
              </a-layout-content>
              <a-layout-footer v-if="footerRouteName.includes($route.name)" :style="{ textAlign: 'center',background:'none' }">
                <a-divider/>
                  pilipili-video ©2023 Created by Liam
              </a-layout-footer>
          </a-layout>
      </a-layout>
      <a-back-top />
  </div>
</template>

<script>
  import PcHead from "@/components/Head";
  import MobileHead from "@/components/MobileHead";
  import {isMobile,isPhone,_isMobile} from "@/utils/utils"

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
              indicator: <a-icon type="play-circle"  spin />,
              indicatorNo: <a-icon type="1"  />,
              banner: "",
              footerRouteName: ["home", "videoHome", "videoDetail", ],
          };
      },
      methods:{
        loadTextFromFile(){
            var file = "/assets/banner.txt";
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(e) {
                this.banner = e.target.result;
                console.log(this.banner);
            }.bind(this);
        },
        
      },
      mounted() {
          this.pathName = this.$route.name;
          console.log(this.pathName);
      },
      created() {
          //pc
          this.isPc = !_isMobile();
          this.isPc = !isMobile;
          console.log('isPhone:',isPhone);
          console.log('isMobile:',isMobile);
          console.log('isPc',this.$store.getters.isPc);
        //   this.loadTextFromFile();
          console.log(this.banner);
          setTimeout(() => {
                    this.$store.dispatch(this.$types.HIDE_LOADING);
                },4000);
      }

  };
</script>

<style lang="scss">
    #app {
      font-family: "HarmonyOS Sans Medium", sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #2c3e50;
      .ant-table-thead > tr > th {  
        background: #f1f6ff !important;
      }
    }

    body {
      .ant-table-thead > tr > th {  
        background: #f1f6ff !important;
      }
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

    .ant-divider-horizontal{
        margin: 14px 0;
    }

    .first-loading-wrp {
            position: absolute;
            width: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;

            height: 100%;

        }

    .bg {
        position: fixed;
        background-color: rgba(200, 200, 200, 0.1);
        z-index: 999999;
    }

</style>
