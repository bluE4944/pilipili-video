import * as types from '@/store/mutation-types'

export default{
    namespaced: true,
    state: {
        token: null,
        user: null,
        loading: false,
    },
    getters:{
        token: state => state.token,
        user: state => state.user,
        loading: state => state.loading,
    },
    mutations:{
        [types.SET_TOKEN](state, token){
            state.token = token
        }
    },
    actions:{
        [types.SET_TOKEN]({commit}, token){
            commit(types.SET_TOKEN, token)
        }
    }
}