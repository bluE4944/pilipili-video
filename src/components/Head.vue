<template>
  <div>
    <a-row type="flex" class="bg-color" justify="space-between" align="middle">

      <router-link to="/"><img alt="pilipili logo" class="logo" src="../assets/PILIPILI-logo-full.png"></router-link>
      <a-menu
              mode="horizontal"
              :default-selected-keys="['1']"
              :style="menuStyle"
              class="mb-1 bg-color"
              @change="routerViewChange"
      >
        <a-menu-item key="1">
          <router-link class="link" to="/"><span>首页</span></router-link>
        </a-menu-item>
        <a-menu-item  key="2" >
          <router-link class="link" to="/videoHome">视频</router-link>
        </a-menu-item>
        <a-menu-item key="3">
          <router-link class="link" to="/about">About</router-link>
        </a-menu-item>
      </a-menu>

      <a-col :span="1" :lg="2" :sm="5">
        <a-dropdown placement="bottomCenter">
          <a-space @click="e => e.preventDefault()" class="link-hover">
            <a-avatar class="ant-card-grid-hoverable" :size="35" :src="src"/>
            <span>{{user.username}}</span>
          </a-space>
          <a-menu slot="overlay" @click="onClick">
            <a-menu-item class="p-2 pr-3 pl-3">
              <a target="_blank" rel="noopener noreferrer" class="ant-btn-link link" href="#"
                ><a-space>
                  <a-icon class="p-1" type="user" /> 
                  <span class="pr-1">个人中心</span>
                </a-space> </a>
            </a-menu-item>
            <a-menu-item class="p-2 pr-3 pl-3">
              <a target="_blank" rel="noopener noreferrer" class="ant-btn-link link" href="#" 
                ><a-space>
                  <a-icon class="p-1" type="clock-circle" /> 
                  <span class="pr-1">历史记录</span>
                </a-space>
                </a>
            </a-menu-item>
            <a-menu-item class="p-2 pr-3 pl-3">
              <a target="_blank" rel="noopener noreferrer" class="ant-btn-link link" href="#" 
                ><a-space>
                  <a-icon class="p-1" type="video-camera" />
                  <span class="pr-1">投稿管理</span>
                </a-space>
                </a>
            </a-menu-item>
            <a-menu-item class="p-2 pr-3 pl-3">
              <a target="_blank" rel="noopener noreferrer" class="ant-btn-link link" href="#">
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
            debugger;
            this.$store.state.showLoading = true;
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

</style>




