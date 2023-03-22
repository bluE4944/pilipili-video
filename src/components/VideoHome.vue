<template>
    <div class="pl-5 pr-5 pt-4">
        <a-card :bordered="false">
            <!--检索框-->
            <a-row type="flex" justify="center" class="mb-4">
                <a-input-search allowClear v-model="formDate.title"  placeholder="input search text"  class="w-25 bg-a-25" @search="onSearch" :loading="$store.state.showLoading"/>
            </a-row>
            
            <!--电影列表-->
            <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 5 }" :data-source="data">
                <div
                    v-if="showLoadingMore"
                    slot="loadMore"
                    :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }"
                    >
                    <a-spin v-if="loadingMore" />
                    <a-button v-else @click="onLoadMore">
                        loading more
                    </a-button>
                </div>
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
        </a-card>
        
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
                loading: true,
                loadingMore: false,
                showLoadingMore: true,
                formDate:{
                    page: 1,
                    pageSize: 10,
                    title: "",
                },
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
            getData(callback) {
                
            },
            //加载更多
            onLoadMore() {
                this.loadingMore = true;
                this.getData(res => {
                    this.data = this.data.concat(res.results);
                    this.loadingMore = false;
                    this.$nextTick(() => {
                    window.dispatchEvent(new Event('resize'));
                    });
                });
            },
            //搜索
            onSearch(){
                this.formDate;
                debugger;
                this.$store.commit('loading', true);
                setTimeout(() => {
                    this.$store.commit('loading', false);
                },4000);
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

</style>