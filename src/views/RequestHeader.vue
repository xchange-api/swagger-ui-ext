<template>
  <div>
    <div ref="editorContainer" class="editor"></div>
    <div @click="focus">
      <div class="placeholder" v-show="value === '' || value === undefined">
        <slot name="placeholder"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Model, Vue, Watch } from "vue-property-decorator";
import * as monaco from "monaco-editor";
import { createSuggestions } from "@/type/Suggestion";

@Component({
  components: {}
})
export default class HeaderEditor extends Vue {
  static LANG = "http-request-header";

  static THEME = "header-theme";

  @Model("change")
  private value!: string;

  private model!: monaco.editor.ITextModel;

  private editor!: monaco.editor.IStandaloneCodeEditor;

  beforeCreate() {
    HeaderEditor.customEditorInit();
  }

  static customEditorInit() {
    if (monaco.languages.getEncodedLanguageId(HeaderEditor.LANG)) {
      return;
    }

    // 注册自定义语言
    monaco.languages.register({ id: HeaderEditor.LANG });

    // 定义语言的tokens
    monaco.languages.setMonarchTokensProvider(HeaderEditor.LANG, {
      tokenizer: { root: [[/^[a-zA-Z-]*:/, "key"]] }
    });

    // 主题设置
    monaco.editor.defineTheme(this.THEME, {
      base: "vs",
      inherit: false,
      rules: [{ token: "key", foreground: "#000000", fontStyle: "bold" }]
    } as monaco.editor.IStandaloneThemeData);

    // 代码提示
    monaco.languages.registerCompletionItemProvider(HeaderEditor.LANG, {
      provideCompletionItems: function(model, position) {
        // 提示区域
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: 1,
          endColumn: position.column
        };

        // 当前行内容
        const currentLine = model.getValueInRange(range);
        if (!currentLine.match(/^[a-zA-Z-]*$/) || currentLine.includes(":")) {
          return { suggestions: [] };
        }

        // 提示
        return { suggestions: createSuggestions(range) };
      }
    });
  }

  mounted() {
    this.init();
  }

  private init() {
    const element = this.$refs.editorContainer as HTMLElement;
    if (!element) {
      return;
    }
    this.model = monaco.editor.createModel(this.value, HeaderEditor.LANG);

    // 监听内容修改
    this.model.onDidChangeContent(() => {
      this.$emit("change", this.model.getValue());
    });

    // 挂载编辑器
    this.editor = monaco.editor.create(element, {
      model: this.model,
      theme: HeaderEditor.THEME,
      minimap: { enabled: false },
      contextmenu: false,
      automaticLayout: true // 如果false,当加载时节点不可见下,editor会设置为隐藏,且不会自适应大小
    });
  }

  @Watch("value", { immediate: false, deep: true })
  private valueChange(newValue: string) {
    if (newValue != this.editor.getValue()) {
      this.editor.setValue(newValue);
    }
  }

  /**
   * 点击placeholder时光标移到编辑器上
   */
  private focus() {
    this.editor.focus();
  }
}
</script>

<style lang="scss" scoped>
/**编辑器placeholder*/
.placeholder {
  position: absolute;
  left: 64px;
  top: 0;
  z-index: 1;
  font-size: 14px;
  color: #b7b7b7;
}

.editor {
  width: 100%;
  height: 100%;
}
</style>
