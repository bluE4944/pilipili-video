import Vue from 'vue'
import Vuex from 'vuex'
import state from './state';
import user from './modules/user';
import pilipili from './modules/pilipili';
import * as types from './mutation-types';
import { Loading } from 'element-ui';

Vue.use(Vuex)

export default new Vuex.Store({
  namespaced: true,
  state,
  getters: {
    showLoading(state) {
      return state.showLoading
    },
    isPs(state){
      return state.isPc
    }
  },
  mutations: {
    [types.LOADING](state, loading) {
      state.showLoading = loading
    },
    [types.HIDE_LOADING](state) {
      state.showLoading = false
      state.loadingInstance.close();
    },
    [types.SHOW_LOADING](state) {
      state.showLoading = true
      state.loadingInstance = Loading.service(types.LOADIBG_OPTIONS);
    },
    [types.IS_PC](state,isPc) {
      state.isPc = isPc
    }
  },
  actions: {
    [types.LOADING]({commit},loading){
      commit(types.LOADING,loading);
    },
    [types.HIDE_LOADING]({commit}){
      commit(types.HIDE_LOADING);
    },
    [types.SHOW_LOADING]({commit}){
      commit(types.SHOW_LOADING);
    },
    [types.IS_PC]({commit},isPc){
      commit(types.IS_PC,isPc);
    },
  },
  modules: {
    user,
    pilipili,
  }
})
