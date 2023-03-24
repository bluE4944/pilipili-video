<template>
    <div>
        <a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-form-model-item label="用户名">
                <a-input v-model="formData.username" placeholder="用户名/邮箱/电话">
                  <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
                </a-input>
              </a-form-model-item>
              <a-form-model-item>
                <a-input v-model="formData.password" type="password" placeholder="Password">
                  <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" />
                </a-input>
              </a-form-model-item>
            <a-form-model-item label="Instant delivery">
              <a-switch v-model="form.delivery" />
            </a-form-model-item>
            <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
              <a-button type="primary" @click="doLogin">
                登录
              </a-button>
            </a-form-model-item>
          </a-form-model>
    </div>
</template>

<script>
    export default {
        name: 'login',
        data() {
            return {
                formData:{
                    username: '',
                    password: '',
                    delivery: false,
                    type: [1],
                    resource: [1],
                    desc: ''
                }
            }
        },
        methods: {
            doLogin() {
                console.log(this.formData);
            }
        }
    }
</script>