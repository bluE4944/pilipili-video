<template>
  <div>
    <a-row type="flex" justify="space-between" align="middle">

      <router-link to="/"><img alt="pilipili logo" class="logo" src="../assets/PILIPILI-logo-full.png"></router-link>
      <a-menu
              mode="horizontal"
              :default-selected-keys="['1']"
              :style="menuStyle"
              class="mb-1"
              @change="routerViewChange"
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

      <a-col :span="1" :lg="2" :sm="5" class="mr-3">
        <a-space>
          <a-avatar :size="35" :src="src"/>
          <span>{{user.username}}</span>
        </a-space>


      </a-col>

    </a-row>
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
        menuStyle:{
          fontWeight: 'bold',
          fontSize: '17px',
          border: 0,
          padding: '0 10px',
          background: 'none',
        },
        collapsed: false,
        user:{
          username: 'bluE',
        },
        src:require('../assets/1464.jpg'),
      }
    },
    methods: {
      routerViewChange(){
            this.$store._isLoading = true;
        }
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




