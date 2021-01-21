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
export default class Editor extends Vue {
  @Prop()
  private value!: string;

  @Prop()
  private language = "json";

  private model!: monaco.editor.ITextModel;

  private editor!: monaco.editor.IStandaloneCodeEditor;

  mounted() {
    this.init();
  }

  private init() {
    const element = this.$refs.editorContainer as HTMLElement;
    this.model = monaco.editor.createModel(this.value, this.language);
    this.editor = monaco.editor.create(element, {
      model: this.model,
      minimap: { enabled: false },
      automaticLayout: true // 当加载时被挂载的元素不可见时, monaco editor会设置为隐藏, 被挂载元素变为可见时不会自动更新为可见
    });

    this.editor.addAction({
      id: "Full screen",
      label: "Full screen",
      keybindings: [monaco.KeyCode.F11],
      run: editor => {
        console.log("");
      }
    });

    this.model.onDidChangeContent(() => {
      this.$emit("update:value", this.model.getValue());
    });
  }

  @Watch("language", { immediate: false, deep: true })
  private languageChange(newLanguage: string) {
    monaco.editor.setModelLanguage(this.model, newLanguage);
  }
}
</script>

<style></style>
