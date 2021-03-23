<template>
  <div ref="editorContainer" class="editor"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as monaco from "monaco-editor";
import { createSuggestions } from "@/type/Suggestion";

@Component({
  components: {}
})
export default class HeaderEditor extends Vue {
  static LANG = "http-request-header";

  static THEME = "header-theme";

  @Prop()
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
}
</script>

<style lang="scss" scoped>
.editor {
  width: 100%;
  height: 100%;
}
</style>
