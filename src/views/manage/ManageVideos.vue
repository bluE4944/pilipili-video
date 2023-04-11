<template>
    <div class="pt-4 pl-5 pr-5">
      <a-card class="mb-4">
        <a-form class="ant-advanced-search-form" :form="form" @submit="handleSearch">
          <a-row :gutter="24">
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

      <a-card class="pb-0" title="视频管理">
          <a-table bordered :columns="columns" :data-source="data" :scroll="{ x: 1500, y: 160 }">
            <a slot="action" slot-scope="text" style="color: blue;">action</a>
          </a-table>
      </a-card>
    </div>
</template>
<script>
    const columns = [
      { title: '电影名', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
      { title: '时长', width: 100, dataIndex: 'age', key: 'age', fixed: 'left' },
      { title: 'Column 1', dataIndex: 'address', key: '1', width: 150 },
      { title: 'Column 2', dataIndex: 'address', key: '2', width: 150 },
      { title: 'Column 3', dataIndex: 'address', key: '3', width: 150 },
      { title: 'Column 4', dataIndex: 'address', key: '4', width: 150 },
      { title: 'Column 5', dataIndex: 'address', key: '5', width: 150 },
      { title: 'Column 6', dataIndex: 'address', key: '6', width: 150 },
      { title: 'Column 7', dataIndex: 'address', key: '7', width: 150 },
      { title: 'Column 8', dataIndex: 'address', key: '8' },
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

.ant-table-thead > tr > th {  
  background: #f1f6ff !important;
}

.ant-card .ant-card-body{
  padding-bottom: 0;
}
 
</style>