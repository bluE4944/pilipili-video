declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'video.js' {
  import videojs from 'video.js'
  export default videojs
}
