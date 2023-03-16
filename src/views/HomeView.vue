<template>
  <div class="home mt-sm-1 mt-xl-5 pt-xl-5 pt-sm-1">
    <h1 style="text-align: center;">Welcome to pilipili-video App</h1>

    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld';

export default {
  name: 'HomeView',
  components: {
    HelloWorld,
  },
  data(){
    return{
      carouselHeight:0,
    }
  },
  methods:{
  },
  mounted(){
    this.carouselHeight = this.$el.clientHeight;
  },
  created() {
    this.$store._isLoading = false;
  }

}
</script>

<style scoped >
</style>
