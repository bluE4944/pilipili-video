<template>
  <div>
    <a-menu
        mode="horizontal"
        :default-selected-keys="['1']"
        :style="{ lineHeight: '50px',background: 'none',fontWeight: 'bold',fontSize: '16px' }"
        class="mb-2"
    >
      <a-menu-item key="0" ><router-link to="/"><img alt="PILIPILI logo" class="logo" src="../assets/PILIPILI-logo-full.png"></router-link></a-menu-item>
      <a-menu-item key="1">
        <router-link class="link" to="/">首页</router-link>
      </a-menu-item>
      <a-menu-item key="2">
        <router-link class="link" to="/about">About</router-link>
      </a-menu-item>
      <a-menu-item  key="3">
        <router-link class="link" to="/videoDetail">视频</router-link>
      </a-menu-item>
    </a-menu>
  </div>
</template>
<script>
  import Vue from 'vue'
  import { Menu, Layout, Icon, Breadcrumb } from 'ant-design-vue' // 按需引入组件并注册
  Vue.use(Layout)
  export default {
    name: 'Head',
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
        collapsed: false
      }
    },
    methods: {
    }
  }
</script>
<style >
.ant-menu-horizontal{
  border-bottom: none;
}
.link{
  text-decoration: none;
}
</style>




