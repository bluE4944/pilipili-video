<template>
  <div>
    <div class="logo" />
    <a-menu
        theme="dark"
        mode="horizontal"
        :default-selected-keys="['2']"
        :style="{ lineHeight: '64px' }"
    >
      <a-menu-item key="1">
        nav 1
      </a-menu-item>
      <a-menu-item key="2">
        nav 2
      </a-menu-item>
      <a-menu-item key="3">
        nav 3
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
<style>
</style>




