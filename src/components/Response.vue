<!---->
<template>
  <div>
    <el-tabs v-model="activeTabName">
      <el-tab-pane label="Body" name="body">
        <div ref="editorContainer" style="height: 500px; width: 100%"></div>
      </el-tab-pane>
      <el-tab-pane label="Header" name="header">
        <li v-for="(value, key) in headers" :key="key">{{ key }}: {{ value }}</li>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as monaco from "monaco-editor";
import { fromBuffer } from "file-type";
import { formatJson, isHtml, isJson, isXml } from "@/util/TextUtil";

@Component({
  components: {}
})
export default class Response extends Vue {
  @Prop()
  private response: any = "";

  private model!: monaco.editor.ITextModel;

  private editor!: monaco.editor.IStandaloneCodeEditor;

  @Prop()
  private headers: any = "";

  private activeTabName = "body";

  @Watch("response", { immediate: false, deep: true })
  responseChange(curVal: ArrayBuffer) {
    fromBuffer(curVal).then(type => {
      if (type) {
        // TODO 按类型显示
      } else {
        const resBodyText = new TextDecoder().decode(curVal);
        const json = isJson(resBodyText);
        if (json) {
          this.setEditorValue(formatJson(json), "json");
        } else if (isHtml(resBodyText)) {
          this.setEditorValue(resBodyText, "html");
        } else if (isXml(resBodyText)) {
          this.setEditorValue(resBodyText, "xml");
        }
      }
    });
  }

  /**
   * 设置编辑器内容
   * @param value
   * @param language
   */
  private setEditorValue(value: string, language: string) {
    this.model = monaco.editor.createModel(value, language);
    const element = this.$refs.editorContainer as HTMLElement;
    this.editor = monaco.editor.create(element, {
      model: this.model,
      minimap: { enabled: false },
      automaticLayout: true // 当加载时被挂载的元素不可见时, monaco editor会设置为隐藏, 被挂载元素变为可见时不会自动更新为可见
    });
  }
}
</script>

<style></style>
