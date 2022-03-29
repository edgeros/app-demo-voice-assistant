module.exports = {
  publicPath: './',
  devServer: {
    https: true,
    // disableHostCheck: true,
    proxy: {
      '/edgerApi': {
        target: 'https://192.168.128.1:7370',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/edgerApi': ''
        }
      },
      '/socket.io': {
        target: 'https://192.168.128.1:7381',
        ws: true,
        changeOrigin: true
      }
    }
  },

  configureWebpack: config => {
    config.module.rules.push({
      test: /.worker.js$/,
      use: { loader: 'worker-loader' }
    });
  }
};
