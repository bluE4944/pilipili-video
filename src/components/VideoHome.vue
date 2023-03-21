<template>
    <div class="p-5">
        <a-list :grid="{ gutter: 16, column: 5 }" :data-source="data">
            <a-list-item slot="renderItem" slot-scope="item, index">
              <a-card hoverable @click="toVideoDetail(item.videoId)">
                <img
                    slot="cover"
                    alt="example"
                    :src="item.img"
                />
                <a-card-meta :title="item.title">
                    <template slot="description">
                        {{item.description}}
                    </template>
                </a-card-meta>
                
              </a-card>
            </a-list-item>
        </a-list>
    </div>

</template>

<script>
    const data = [
        {
            title: 'Title 1',
            img: require('../../public/images/vpc-example-cover-the-garden-v.jpg'),
            description: 'Description 1',
            videoId: 1,
        },
        {
            title: 'Title 2',
            img: require('../../public/images-ppt/1678187827665.png'),
            description: 'Description 2',
            videoId: 2,
        },
        {
            title: 'Title 3',
            img: require('../../public/images-ppt/1678187847254.jpg'),
            description: 'Description 3',
            videoId: 3,
        },
        {
            title: 'Title 4',
            img: require('../../public/images/vpc-example-cover-your-name-v.jpg'),
            description: 'Description 4',
            videoId: 4,
        },
    ];
    export default {
        name: "VideoHome",
        components: {},
        props: {},
        data() {
            return {
                loading: true,
                data,
            }
        },
        // 计算属性 类似于 data 概念
        computed: {},
        // 监控 data 中的数据变化
        watch: {},
        methods: {
            // 监听 data 中的数据变化
            toVideoDetail(videoId) {
                debugger;
                this.$router.push({
                    path: '/videoDetail',
                    params: { videoId: videoId }
                })
            },
        },
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