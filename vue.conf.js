// vue.config.js
module.exports = {
    chainWebpack: (config) => {
      config.plugin('define').tap((definitions) => {
        definitions[0]['process.env'].VUE_APP_API_BASE_URL = JSON.stringify(process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000');
        return definitions;
      });
    },
  };