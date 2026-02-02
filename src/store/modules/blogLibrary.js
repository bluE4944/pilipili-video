import { loadStorage, saveStorage } from '@/utils/storage';

const STORAGE_KEY = 'blog_library_v1';

const defaultState = {
  blogs: [],
};

const state = loadStorage(STORAGE_KEY, defaultState);

const getters = {
  blogs: (s) => s.blogs,
  blogById: (s) => (id) => s.blogs.find((b) => b.id === id),
};

const mutations = {
  SET_STATE(state, payload) {
    Object.assign(state, payload);
  },
  SET_BLOGS(state, list) {
    state.blogs = list;
  },
};

const actions = {
  init({ commit }) {
    commit('SET_STATE', loadStorage(STORAGE_KEY, defaultState));
  },
  persist({ state }) {
    saveStorage(STORAGE_KEY, state);
  },
  setBlogs({ commit, dispatch }, list) {
    commit('SET_BLOGS', list);
    dispatch('persist');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
