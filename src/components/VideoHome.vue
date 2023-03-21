<template>
    <div>
        <a-list :grid="{ gutter: 16, column: 4 }" :data-source="data">
            <a-list-item slot="renderItem" slot-scope="item, index">
              <a-card :title="item.title">
                Card content
              </a-card>
            </a-list-item>
        </a-list>
    </div>
</template>

<script>
    const data = [
        {
            title: 'Title 1',
        },
        {
            title: 'Title 2',
        },
        {
            title: 'Title 3',
        },
        {
            title: 'Title 4',
        },
    ];
    export default {
        name: "VideoHome",
        components: {},
        props: {},
        data() {
            return {
                data,
            }
        },
        // 计算属性 类似于 data 概念
        computed: {},
        // 监控 data 中的数据变化
        watch: {},
        methods: {},
        // 生命周期
        created() {
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