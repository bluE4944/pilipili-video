<template>
  <div class="pt-5 pl-5 pr-5">
    <a-card title="admin">
      <el-row>

      </el-row>
      <el-tabs tab-position="left" type="card" style="height: 100%;">
        <el-tab-pane label="用户管理">用户管理</el-tab-pane>
        <el-tab-pane label="配置管理">配置管理</el-tab-pane>
        <el-tab-pane label="角色管理">角色管理</el-tab-pane>
        <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
      </el-tabs>
      <el-form ref="form" :model="form" label-width="100px" >
        <el-form-item label="视频目录:">
          <el-button type="primary" @click="showModal">添加视频扫描目录</el-button>
        </el-form-item>
        <el-form-item label="修改密码:">
          <el-col :span="11">
            <el-input show-password v-model="form.password"></el-input>
          </el-col>
          <el-col class="line pl-2" :span="2">确认密码:</el-col>
          <el-col :span="11">
            <el-input show-password v-model="form.confirmPassword"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="活动区域:">
          <el-select v-model="form.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间:">
          <el-col :span="11">
            <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
          </el-col>
          <el-col class="line" :span="1">-</el-col>
          <el-col :span="11">
            <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
          </el-col>
        </el-form-item>
        <el-form-item label="即时配送:">
          <el-switch v-model="form.delivery"></el-switch>
        </el-form-item>
        <el-form-item label="活动性质:">
          <el-checkbox-group v-model="form.type">
            <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
            <el-checkbox label="地推活动" name="type"></el-checkbox>
            <el-checkbox label="线下主题活动" name="type"></el-checkbox>
            <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="特殊资源:">
          <el-radio-group v-model="form.resource">
            <el-radio label="线上品牌商赞助"></el-radio>
            <el-radio label="线下场地免费"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="活动形式:">
          <el-input type="textarea" v-model="form.desc"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即创建</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </a-card>

    <a-modal
      title="Title"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>{{ ModalText }}</p>
    </a-modal>
  </div>
</template>
<script>
    export default {
        name: 'AdminManage',
        data() {
            return {
              form: {
                name: '',
                region: '',
                date1: '',
                date2: '',
                delivery: false,
                type: [],
                resource: '',
                desc: ''
              },
              ModalText: '这是添加视频扫描目录画面',
              visible: false,
              confirmLoading: false,
            };
        },
        // 生命周期
        created() {
        },
        methods: {
          onSubmit(){
              console.log('submit!');
          },
          showModal() {
            this.visible = true;
          },
          handleOk(e) {
            this.ModalText = 'The modal will be closed after two seconds';
            this.confirmLoading = true;
            setTimeout(() => {
              this.visible = false;
              this.confirmLoading = false;
            }, 2000);
          },
          handleCancel(e) {
            console.log('Clicked cancel button');
            this.visible = false;
          },
        },
        mounted() {
        },
        beforeCreate() {
        },
        beforeMount() {
        },
        beforeUpdate() {
        },
        updated() {
        },
        beforeDestroy() {
        },
        destroyed() {
        },
        activated() {
        }
    }

</script>

<style scoped lang="less">

</style>