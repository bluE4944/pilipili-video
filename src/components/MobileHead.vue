<template>
  <div>
    <a-row type="flex" justify="space-between" align="middle">
      <a-col>
        <a-button class="pb-1 pl-2 pr-2" type="primary" @click="showDrawer">
          <a-icon type="caret-up" v-show="visible"/>
          <a-icon type="caret-down" v-show="!visible"/>
        </a-button>
      </a-col>

      <a-col><router-link to="/"><img alt="pilipili logo" class="logo" src="../assets/PILIPILI-logo-full.png"></router-link></a-col>

      <a-col>
        <a-dropdown placement="bottomCenter">
          <a-space @click="e => e.preventDefault()" class="link-hover">
            <a-avatar class="ant-card-grid-hoverable" :size="30" :src="src"/>
            <span>{{user.username}}</span>
          </a-space>
          <a-menu slot="overlay" @click="onClick">
            <a-menu-item class="p-2 pr-3 pl-3">
              <a class="ant-btn-link link" href="#">
                <a-space>
                  <a-icon class="p-1" type="user" />
                  <span class="pr-1">个人中心</span>
                </a-space>
              </a>
            </a-menu-item>
            <a-menu-item class="p-2 pr-3 pl-3">
              <a class="ant-btn-link link" href="#">
                <a-space>
                  <a-icon class="p-1" type="clock-circle" />
                  <span class="pr-1">历史记录</span>
                </a-space>
              </a>
            </a-menu-item>
            <a-menu-item class="p-2 pr-3 pl-3">
              <a class="ant-btn-link link" href="#">
                <a-space>
                  <a-icon class="p-1" type="video-camera" />
                  <span class="pr-1">视频管理</span>
                </a-space>
              </a>
            </a-menu-item>
            <a-menu-item class="p-2 pr-3 pl-3">
              <a class="ant-btn-link link" href="#">
                <a-space>
                  <a-icon class="p-1" type="export" />
                  <span class="pr-1">退出登录</span>
                </a-space>
              </a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-col>

    </a-row>

    <a-drawer
      title="pilipili-video"
      :placement="placement"
      :closable="false"
      :visible="visible"
      @close="onClose">
      <a-menu
        mode="inline"
        :selected-keys="[activeKey]"
        :style="menuStyle"
        :inline-collapsed="collapsed"
      >
        <a-menu-item key="home">
          <router-link class="link" to="/">首页</router-link>
        </a-menu-item>
        <a-menu-item key="videos">
          <router-link class="link" to="/videos">视频库</router-link>
        </a-menu-item>
        <a-menu-item key="blogs">
          <router-link class="link" to="/blogs">博客</router-link>
        </a-menu-item>
        <a-menu-item key="about">
          <router-link class="link" to="/about">关于</router-link>
        </a-menu-item>
      </a-menu>
    </a-drawer>
  </div>
</template>
<script>
  import Vue from 'vue'
  import { Menu, Layout, Icon, Breadcrumb } from 'ant-design-vue'
  Vue.use(Layout)
  export default {
    name: 'MobileHead',
    components: {
      'a-menu': Menu,
      'a-icon': Icon,
      'a-breadcrumb': Breadcrumb,
      'a-breadcrumb-item': Breadcrumb.Item,
      ASubMenu: Menu.SubMenu,
      AMenuItem: Menu.Item

    },
    data () {
      return {
        menuStyle:{
          fontWeight: 'bold',
          fontSize: '16px',
          background: '#fafafa',
          border: 0,
          padding: '0 10px',
        },
        collapsed: false,
        user:{
          username: 'bluE',
        },
        src:require('../assets/1464.jpg'),
        visible: false,
        placement: 'top',
      }
    },
    computed: {
      activeKey() {
        const path = this.$route.path || '/';
        if (path.startsWith('/videos')) return 'videos';
        if (path.startsWith('/blogs')) return 'blogs';
        if (path.startsWith('/about')) return 'about';
        return 'home';
      }
    },
    methods: {
      toggleCollapsed() {
        this.collapsed = !this.collapsed;
      },
      showDrawer() {
        this.visible = !this.visible;
      },
      onClose() {
        this.visible = false;
      },
      onChange(e) {
        this.placement = e.target.value;
      },
      onClick({ key }) {
        console.log(`Click on item ${key}`);
      },
    }
  }
</script>
<style lang="scss" >
  ::v-deep .ant-menu-horizontal{
    border-bottom: 0 !important;
  }

  ::v-deep .ant-menu-item{
    padding: 0 5px !important;
  }

  .link{
    text-decoration: none;
  }

  .link:hover{
    text-decoration: none;
  }

</style>
