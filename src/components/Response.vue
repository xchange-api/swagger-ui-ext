<!---->
<template>
  <div>
    <div ref="editorContainer" style="height: 500px; width: 100%"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as monaco from "monaco-editor";

@Component({
  components: {}
})
export default class Response extends Vue {
  @Prop()
  private response: any = "";

  private model!: monaco.editor.ITextModel;

  private editor!: monaco.editor.IStandaloneCodeEditor;

  @Watch("response", { immediate: false, deep: true })
  responseChange(curVal: any) {
    this.model = monaco.editor.createModel(
      JSON.stringify(curVal, null, "\t"),
      "json"
    );
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
