const user = {
    state: {
      token: '',
      roles: null,
      isMasterAccount:true,
    },
    
    mutations: {
      SET_TOKEN: (state, token) => {
        state.token ="Bearer " +token 
      },
    },
    actions: {
      // 登录
      Login({
        commit
      }, userInfo) {
        return new Promise((resolve, reject) => {
          login(userInfo.account, userInfo.password).then(x => {
            if(x.status==200){
              const tokenV = x.data.token.tokenValue
              commit('SET_TOKEN', tokenV)
              document.cookie=`AuthInfo=Bearer ${tokenV};path:/`;
              token="Bearer "+tokenV;
              //setToken("Bearer " +token)
              resolve();
            }
            
          }).catch(error => {
            console.log("登录失败")
            reject(error)
          })
        })
      },
    }
}
export default user;