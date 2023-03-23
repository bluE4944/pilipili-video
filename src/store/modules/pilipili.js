import * as types from '@/store/mutation-types'

export default{
    namespaced: true,
    state: {
        token: null,
        user: null,
        loading: true,
    },
    getters:{
        token: state => state.token,
        user: state => state.user,
        loading: state => state.loading,
    },
    mutations:{
        [types.LOADING](state, loading){
            state.loading = loading
        },
        [types.TOKEN](state, token){
            state.token = token
        }
    },
    actions:{
        [types.TOKEN]({commit}, token){
            commit(types.TOKEN, token)
        },
        [types.LOADING]({commit}, loading){
            commit(types.LOADING, loading)
        }
    }
}