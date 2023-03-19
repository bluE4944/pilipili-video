<template>
  <div>
    <a-row type="flex" justify="space-between" align="middle">
      <a-col>
        <a-button class="pb-1 pl-2 pr-2" type="primary" @click="showDrawer">
          <a-icon type="caret-up" v-if="visible"/>
          <a-icon type="caret-down" v-else/>
        </a-button>
      </a-col>

      <a-col><router-link to="/"><img alt="pilipili logo" class="logo" src="../assets/PILIPILI-logo-full.png"></router-link></a-col>

      <a-col>
        <a-space>
          <a-avatar :size="35" :src="src"/>
          <span>{{user.username}}</span>
        </a-space>

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
      :default-selected-keys="['1']"
      :style="menuStyle"
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
    </a-drawer>
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
        //显示抽屉菜单
        visible: false,
        //显示位置
        placement: 'top',
      }
    },
    methods: {
      toggleCollapsed() {
        this.collapsed = !this.collapsed;
      },
      //显示抽屉菜单
      showDrawer() {
        this.visible = !this.visible;
      },
      //隐藏抽屉菜单
      onClose() {
        this.visible = false;
      },
      //切换菜单样式
      onChange(e) {
        this.placement = e.target.value;
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




