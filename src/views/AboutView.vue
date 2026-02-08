<template>
  <div class="about bg-about">
    <n-card class="about-card" size="large">
      <n-space vertical align="center" :size="8">
        <pre class="about-banner">{{ bannerText }}</pre>
        <h2>PiliPili-video</h2>
        <h4>B站，人称小P站</h4>
        <h5>为了能在家里PB切换，我制作了这个视频网站，当然可能不只视频功能，还有一些个人相关的功能，具体看我的后续吧...</h5>
        <h4>author: Liam</h4>
        <h4>贡献: 渔关</h4>
        <n-space :size="12">
          <n-icon class="about-icon" size="22" @click="open(githubUrl)">
            <LogoGithub />
          </n-icon>
          <n-icon class="about-icon" size="22" @click="open(twitterUrl)">
            <LogoTwitter />
          </n-icon>
        </n-space>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { LogoGithub, LogoTwitter } from '@vicons/ionicons5'

const githubUrl = 'https://github.com/bluE4944/pilipili-video'
const twitterUrl = 'https://www.twitter.com'
const bannerText = String.raw` ________  ___  ___       ___  ________  ___  ___       ___     
|\   __  \|\  \|\  \     |\  \|\   __  \|\  \|\  \     |\  \    
\ \  \|\  \ \  \ \  \    \ \  \ \  \|\  \ \  \ \  \    \ \  \   
 \ \   ____\ \  \ \  \    \ \  \ \   ____\ \  \ \  \    \ \  \  
  \ \  \___|\ \  \ \  \____\ \  \ \  \___|\ \  \ \  \____\ \  \ 
   \ \__\    \ \__\ \_______\ \__\ \__\    \ \__\ \_______\ \__\
    \|__|     \|__|\|_______|\|__|\|__|     \|__|\|_______|\|__|`

const open = (url: string) => {
  window.open(url, '_blank')
}
</script>

<style lang="scss">
  .about {
    font-family: "HarmonyOS Sans Medium", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    min-height: calc(100vh - 55px - 40px);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    font-size: 16px;
  }
  .bg-about{
    background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
    width: 100%;
  }
  .about-card {
    width: min(75%, 720px);
    border-radius: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .about-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.95);
  }
  .about-banner {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.2;
    white-space: pre;
    margin: 0;
    background: linear-gradient(90deg, #1f7cc0 0%, #7b61ff 50%, #00b5e5 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .about h2 {
    font-size: 28px;
  }
  .about h4 {
    font-size: 18px;
  }
  .about h5 {
    font-size: 16px;
    font-weight: 500;
  }
  .about-icon {
    cursor: pointer;
    color: #1f7cc0;
  }
  .about-icon:hover {
    color: #1890ff;
  }



</style>
