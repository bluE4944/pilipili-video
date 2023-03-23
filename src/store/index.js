import Vue from 'vue'
import Vuex from 'vuex'
import state from './state';
import user from './modules/user';
import pilipili from './modules/pilipili';
import * as types from './mutation-types';

Vue.use(Vuex)

export default new Vuex.Store({
  namespaced: true,
  state,
  getters: {
    showLoading(state) {
      return state.showLoading
    },
    isPs(state){
      return state.isPs
    }
  },
  mutations: {
    [types.LOADING](state, loading) {
      state.showLoading = loading
    },
    [types.HIDE_LOADING](state) {
      state.showLoading = false
    },
    [types.SHOW_LOADING](state) {
      state.showLoading = true
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
    }
  },
  modules: {
    user,
    pilipili,
  }
})
