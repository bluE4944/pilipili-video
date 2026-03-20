const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // Vue CLI + thread-loader 在当前 Node 版本下构建不稳定，关闭并行编译避免构建失败。
  parallel: false,
  devServer: {
    port: 8080,
    host: '0.0.0.0', // 允许局域网访问
    allowedHosts: 'all'
  },
  configureWebpack: {
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json", ".vue"]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            appendTsSuffixTo: [/\.vue$/],
          }
        }
      ]
    }
  }
})
