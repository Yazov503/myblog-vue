const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
module.exports = defineConfig({
  devServer: {
    host: '0.0.0.0',
    port: 8000,
    client: {
      webSocketURL: 'ws://0.0.0.0:8000/ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        'window.Quill': 'quill/dist/quill.js',
        'Quill': 'quill/dist/quill.js'
      })
    ]
  },
})
