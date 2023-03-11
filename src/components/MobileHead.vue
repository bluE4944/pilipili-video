<template>
  <div>
    <a-space :size="10" class="mt-2">
      <router-link to="/"><img alt="pilipili logo" class="logo" src="../assets/PILIPILI-logo-full.png"></router-link>
      <a-avatar :size="35" :src="src"/>
      <span>{{user.username}}</span>
    </a-space>
      <a-menu
              mode="inline"
              :default-selected-keys="['1']"
              :style="menuStyle"
              class="mb-1"
              :inline-collapsed="collapsed"
      >
        <a-menu-item key="1">
          <router-link class="link" to="/"><span>首页</span></router-link>
        </a-menu-item>
        <a-menu-item  key="2" >
          <router-link class="link" to="/videoDetail">视频</router-link>
        </a-menu-item>
        <a-menu-item key="3">
          <router-link class="link" to="/about">About</router-link>
        </a-menu-item>
      </a-menu>

  </div>
</template>
<script>
  import Vue from 'vue'
  import { Menu, Layout, Icon, Breadcrumb } from 'ant-design-vue' // 按需引入组件并注册
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
          fontSize: '17px',
          background: '#fafafa',
          border: 0,
          padding: '0 10px',
        },
        collapsed: false,
        user:{
          username: 'bluE',
        },
        src:require('../assets/1464.jpg'),
      }
    },
    methods: {
      toggleCollapsed() {
        this.collapsed = !this.collapsed;
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




