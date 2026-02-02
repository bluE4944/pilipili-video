import { loadStorage, saveStorage } from '@/utils/storage';
import { buildCollections } from '@/utils/video';

const STORAGE_KEY = 'video_library_v1';

const defaultState = {
  videos: [],
  categories: [],
  tags: [],
  playHistory: {},
  playRate: 1,
  autoPlayNext: true,
};

const state = loadStorage(STORAGE_KEY, defaultState);

const getters = {
  videos: (s) => s.videos,
  categories: (s) => s.categories,
  tags: (s) => s.tags,
  playHistory: (s) => s.playHistory,
  playRate: (s) => s.playRate,
  autoPlayNext: (s) => s.autoPlayNext !== false,
  favorites: (s) => s.videos.filter((v) => v.favorited),
  videoById: (s) => (id) => s.videos.find((v) => v.id === id),
  collections: (s) => buildCollections(s.videos),
};

const mutations = {
  SET_STATE(state, payload) {
    Object.assign(state, payload);
  },
  SET_VIDEOS(state, list) {
    state.videos = list;
  },
  SET_CATEGORIES(state, list) {
    state.categories = list;
  },
  SET_TAGS(state, list) {
    state.tags = list;
  },
  SET_PLAY_HISTORY(state, history) {
    state.playHistory = history;
  },
  SET_PLAY_RATE(state, rate) {
    state.playRate = rate;
  },
  SET_AUTO_PLAY_NEXT(state, value) {
    state.autoPlayNext = value;
  },
};

const actions = {
  init({ commit }) {
    commit('SET_STATE', loadStorage(STORAGE_KEY, defaultState));
  },
  persist({ state }) {
    saveStorage(STORAGE_KEY, state);
  },
  setVideos({ commit, dispatch }, list) {
    commit('SET_VIDEOS', list);
    dispatch('persist');
  },
  setCategories({ commit, dispatch }, list) {
    commit('SET_CATEGORIES', list);
    dispatch('persist');
  },
  setTags({ commit, dispatch }, list) {
    commit('SET_TAGS', list);
    dispatch('persist');
  },
  setPlayHistory({ commit, dispatch }, history) {
    commit('SET_PLAY_HISTORY', history);
    dispatch('persist');
  },
  setPlayRate({ commit, dispatch }, rate) {
    commit('SET_PLAY_RATE', rate);
    dispatch('persist');
  },
  setAutoPlayNext({ commit, dispatch }, value) {
    commit('SET_AUTO_PLAY_NEXT', value);
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
