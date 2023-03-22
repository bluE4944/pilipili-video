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
  },
  mutations: {
    [types.SET_LOADING]({state}, load) {
      state.showLoading = load
    }
  },
  actions: {
    [types.SET_LOADING]({commit},load){
      commit(types.SET_LOADING,load);
    }
  },
  modules: {
    user,
    pilipili,
  }
})
