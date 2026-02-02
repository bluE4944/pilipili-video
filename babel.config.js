const plugins = [];

// lazy load ant-design-vue
// if your use import on Demand, Use this code
plugins.push(['import', {
  'libraryName': 'Antd',
  'libraryDirectory': 'es',
  'style': true // `style: true` will load less files
}])
plugins.push(['@babel/plugin-proposal-class-properties', { loose: true }])
plugins.push(['@babel/plugin-proposal-private-methods', { loose: true }])
plugins.push(['@babel/plugin-proposal-private-property-in-object', { loose: true }])

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins
}
