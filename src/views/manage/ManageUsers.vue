<template>
    <div class="pt-5 pl-5 pr-5">
        <a-card title="用户管理">
          <a-table :columns="columns" :data-source="data" :scroll="{ x: 1500, y: 300 }">
            <a slot="action" slot-scope="text">action</a>
          </a-table>
        </a-card>
    </div>
</template>
<script>
    const columns = [
      { title: 'Full Name', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
      { title: 'Age', width: 100, dataIndex: 'age', key: 'age', fixed: 'left' },
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
        name: 'ManageUsers',
        data() {
            return {
            data,
            columns,
            };
        },
        // 生命周期
        created() {
        },
        methods: {
          action(text, record) {
            console.log(text, record);
          },
          
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

</style>