<template>
  <div>
    <div ref="editorContainer" :class="fullscreen ? 'editor-fullscreen' : 'editor'"></div>
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
  private language!: string;

  private model!: monaco.editor.ITextModel;

  private editor!: monaco.editor.IStandaloneCodeEditor;

  private fullscreen = false;

  mounted() {
    this.init();
  }

  private init() {
    const element = this.$refs.editorContainer as HTMLElement;
    if (!element) {
      return;
    }
    this.model = monaco.editor.createModel(this.value, this.language);

    // 监听内容修改
    this.model.onDidChangeContent(() => {
      this.$emit("update:value", this.model.getValue());
    });

    // 挂载编辑器
    this.editor = monaco.editor.create(element, {
      model: this.model,
      minimap: { enabled: false },
      automaticLayout: true // 如果false,当加载时节点不可见下,editor会设置为隐藏,且不会自适应大小
    });

    // 全屏
    this.editor.addAction({
      id: "Full screen",
      label: "Full screen",
      contextMenuGroupId: "1_modification",
      contextMenuOrder: 5,
      keybindings: [monaco.KeyCode.F11],
      run: () => {
        this.fullscreen = !this.fullscreen;
      }
    });
  }

  @Watch("language", { immediate: false, deep: true })
  private languageChange(newLanguage: string) {
    monaco.editor.setModelLanguage(this.model, newLanguage);
  }

  @Watch("value", { immediate: false, deep: true })
  private valueChange(newValue: string) {
    if (newValue !== this.editor.getValue()) {
      this.editor.setValue(newValue);
    }
  }
}
</script>

<style lang="scss" scoped>
.editor-fullscreen {
  position: fixed !important;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100% !important;
  z-index: 1000;
}

.editor {
  width: 100%;
  height: 100%;
}
</style>
