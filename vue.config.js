const MonacoEditorWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  // 仅用于测试, 代理到swagger所在服务器地址
  devServer: {
    proxy: "http://localhost:8082",
    port: 8080
  },

  chainWebpack: config => {
    config.plugin("monaco-editor").use(MonacoEditorWebpackPlugin, [
      {
        // Languages are loaded on demand at runtime
        languages: ["json", "javascript", "html", "xml"]
      }
    ]);
  }
};
