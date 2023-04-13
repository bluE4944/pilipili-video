<template>
    <div class="pt-4 pl-5 pr-5">
      <a-card class="mb-4 shadow-sm">
        <a-form class="ant-advanced-search-form" :form="form" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" @submit="handleSearch">
          <a-row :gutter="[24,16]">
            <a-col
              :span="6"
              >
                <a-form-item :label="`Field 1`">
                  <a-input
                    v-decorator="[
                      `field-1`,
                      {
                        rules: [
                          {
                            required: true,
                            message: 'Input something!',
                          },
                        ],
                      },
                    ]"
                    placeholder="placeholder"
                  />
                </a-form-item>
              </a-col>
              <a-col
              :span="6"
              >
                <a-form-item :label="`Field 2`">
                  <a-input
                    v-decorator="[
                      `field-2`,
                      {
                        rules: [
                          {
                            required: true,
                            message: 'Input something!',
                          },
                        ],
                      },
                    ]"
                    placeholder="placeholder"
                  />
                </a-form-item>
              </a-col>
              <a-col
              :span="6"
              >
                <a-form-item :label="`Field 3`">
                  <a-input
                    v-decorator="[
                      `field-3`,
                      {
                        rules: [
                          {
                            required: true,
                            message: 'Input something!',
                          },
                        ],
                      },
                    ]"
                    placeholder="placeholder"
                  />
                </a-form-item>
              </a-col>
              <a-col
              :span="6"
              >
                <a-form-item :label="`Field 4`">
                  <a-input
                    v-decorator="[
                      `field-4`,
                      {
                        rules: [
                          {
                            required: true,
                            message: 'Input something!',
                          },
                        ],
                      },
                    ]"
                    placeholder="placeholder"
                  />
                </a-form-item>
              </a-col>
          </a-row>
          <el-collapse-transition>
            <a-row :gutter="24" v-show="expand">
              <a-col
              :span="6"
              >
                <a-form-item :label="`Field 5`">
                  <a-input
                    v-decorator="[
                      `field-5`,
                      {
                        rules: [
                          {
                            required: true,
                            message: 'Input something!',
                          },
                        ],
                      },
                    ]"
                    placeholder="placeholder"
                  />
                </a-form-item>
              </a-col>
              <a-col
              :span="6"
              >
                <a-form-item :label="`Field 6`">
                  <a-input
                    v-decorator="[
                      `field-6`,
                      {
                        rules: [
                          {
                            required: true,
                            message: 'Input something!',
                          },
                        ],
                      },
                    ]"
                    placeholder="placeholder"
                  />
                </a-form-item>
              </a-col>
              <a-col
              :span="6"
              >
                <a-form-item :label="`Field 7`">
                  <a-input
                    v-decorator="[
                      `field-7`,
                      {
                        rules: [
                          {
                            required: true,
                            message: 'Input something!',
                          },
                        ],
                      },
                    ]"
                    placeholder="placeholder"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </el-collapse-transition>
          <a-row>
            <a-col :span="24" :style="{ textAlign: 'right' }">
              <a-button type="primary" html-type="submit">
                Search
              </a-button>
              <a-button :style="{ marginLeft: '8px' }" @click="handleReset">
                Clear
              </a-button>
              <a :style="{ marginLeft: '8px', fontSize: '12px' }" @click="toggle">
                Collapse <a-icon :type="expand ? 'up' : 'down'" />
              </a>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
 
      <a-card class="mb-1 shadow-sm" :bodyStyle="{paddingBottom:'0'}" title="视频管理">
          <a-table bordered :columns="columns" :data-source="data" :scroll="{ x: 1500, y: 240 }">
            <el-link type="primary" slot="action" slot-scope="text">action</el-link>
          </a-table>
      </a-card>
    </div>
</template>
<script>
    // fade/zoom 等
    import 'element-ui/lib/theme-chalk/base.css';
    // collapse 展开折叠
    import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';
    import Vue from 'vue'

    Vue.component(CollapseTransition.name, CollapseTransition);
    const columns = [
      { title: '视频名称', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
      { title: '导演', width: 100, dataIndex: 'age', key: 'age', fixed: 'left' },
      { title: '简介', dataIndex: 'address', key: '1', width: 150 },
      { title: '发布时间', dataIndex: 'address', key: '2', width: 150 },
      { title: '时长', dataIndex: 'address', key: '3', width: 150 },
      { title: '上传人', dataIndex: 'address', key: '4', width: 150 },
      { title: '上传时间', dataIndex: 'address', key: '5', width: 150 },
      { title: '修改人', dataIndex: 'address', key: '6', width: 150 },
      { title: '修改时间', dataIndex: 'address', key: '7', width: 150 },
      { title: '分集', dataIndex: 'address', key: '8' },
      {
        title: 'Action',
        key: 'operation',
        fixed: 'right',
        width: 100,
        scopedSlots: { customRender: 'action' },
      },
    ];
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        key: i,
        name: `Edrward ${i}`,
        age: 32,
        address: `London Park no. ${i}`,
      });
    }
    
    export default {
        name: 'ManageVideos',
        data() {
            return {
              data,
              columns,
              expand: false,
              form: this.$form.createForm(this, { name: 'advanced_search' }),
            };
        },
        methods: {
          handleSearch(e) {
            e.preventDefault();
            this.form.validateFields((error, values) => {
              console.log('error', error);
              console.log('Received values of form: ', values);
            });
          },

          handleReset() {
            this.form.resetFields();
          },

          toggle() {
            this.expand = !this.expand;
          },
        },
        computed: {
          count() {
            return this.expand ? 10 : 4;
          },
        },
        // 生命周期
        created() {
        },
        mounted() {
            this.getData(res => {
                this.loading = false;
                this.data = res.results;
            });
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

  .ant-card-body{
    padding-bottom: 0 !important;
  }

  .ant-advanced-search-form .ant-form-item {
      margin-bottom: 8px;
  }

  .ant-pagination {
      margin: 16px 0 0 !important;
  }
 
</style>