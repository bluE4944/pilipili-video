<template>
  <div class="home mt-2">
    <a-row type="flex" justify="space-around" align="middle">
      <a-carousel autoplay class="w-50">
        <div><img alt="your-name" src="../../public/images/vpc-example-cover-your-name-c.png"></div>
        <div><img alt="5cm" src="../../public/images/vpc-example-cover-5cm.png"></div>
        <div><img alt="weathering" src="../../public/images/vpc-example-cover-weathering-c.jpg"></div>
        <div><img alt="the-garden" src="../../public/images/vpc-example-cover-the-garden.png"></div>
      </a-carousel>
    </a-row>

    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
export default {
  name: 'HomeView',
  components: {
    HelloWorld,
  }
}
</script>

<style scoped>
/* For demo */
.ant-carousel >>> .slick-slide {
  text-align: center;
  height: 500px;
  line-height: 500px;
  background: #364d79;
  overflow: hidden;
}

.ant-carousel >>> .slick-slide h3 {
  color: #fff;
}
</style>
