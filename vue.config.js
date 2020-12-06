const MonacoEditorWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
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
