<!--响应-->
<template>
  <div>
    <el-tabs v-model="activeTabName" type="border-card">
      <!--response body start-->
      <el-tab-pane label="Body" name="body">
        <div ref="responseContainer" class="response-body"></div>
      </el-tab-pane>
      <!--response body end-->

      <!--response header start-->
      <el-tab-pane label="Header" name="header">
        <ul class="response-header">
          <li v-for="(value, key) in headers" :key="key">{{ key }}: {{ value }}</li>
        </ul>
      </el-tab-pane>
      <!--response header end-->
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as monaco from "monaco-editor";
import { fromBuffer, FileTypeResult } from "file-type";
import { PrettierFactory } from "@/util/PrettierFactory";

@Component({
  components: {}
})
export default class Response extends Vue {
  private static SUPPORT_VIDEO = ["video/mp4", "video/webm", "video/ogg"];
  private static SUPPORT_AUDIO = ["audio/mpeg", "audio/mp4", "audio/ogg", "audio/x-wav"];
  private static SUPPORT_IMAGE = [
    "image/apng",
    "image/gif",
    "image/x-icon",
    "image/jpeg",
    "image/pipeg",
    "image/png",
    "image/svg+xml"
  ];

  @Prop()
  private response: any = "";

  private model!: monaco.editor.ITextModel;

  private editor!: monaco.editor.IStandaloneCodeEditor;

  @Prop()
  private headers: any = "";

  private activeTabName = "body";

  /**
   * 监听响应, 按类型显示
   * @param newResponse
   */
  @Watch("response", { immediate: false, deep: true })
  responseChange(newResponse: ArrayBuffer) {
    fromBuffer(newResponse).then(type => {
      if (type) {
        this.preview(newResponse, type);
      } else {
        this.textPreview(newResponse);
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
    const element = this.$refs.responseContainer as HTMLElement;
    this.editor = monaco.editor.create(element, {
      model: this.model,
      minimap: { enabled: false },
      readOnly: true,
      contextmenu: false,
      automaticLayout: true // 当加载时被挂载的元素不可见时, monaco editor会设置为隐藏, 被挂载元素变为可见时不会自动更新为可见
    });
  }

  /**
   * 预览文本
   * @param arrayBuffer
   */
  private textPreview(arrayBuffer: ArrayBuffer) {
    const resBodyText = new TextDecoder().decode(arrayBuffer);
    const prettier = PrettierFactory.getPrettier(resBodyText);
    this.setEditorValue(prettier.pretty(), prettier.type);
  }

  /**
   * 预览多媒体格式
   * @param arrayBuffer
   * @param type
   */
  private preview(arrayBuffer: ArrayBuffer, type: FileTypeResult) {
    if (type.mime === "application/pdf") {
      const view = document.createElement("embed");
      view.style.height = "100%";
      view.style.width = "100%";
      view.src = URL.createObjectURL(new Blob([arrayBuffer], { type: type.mime }));
      this.appendToResponse(view);
    } else if (Response.SUPPORT_VIDEO.includes(type.mime)) {
      const view = document.createElement("video");
      view.style.height = "100%";
      view.style.width = "100%";
      view.controls = true;
      view.src = URL.createObjectURL(new Blob([arrayBuffer], { type: type.mime }));
      this.appendToResponse(view);
    } else if (Response.SUPPORT_AUDIO.includes(type.mime)) {
      const view = document.createElement("audio");
      view.style.width = "100%";
      view.controls = true;
      view.src = URL.createObjectURL(new Blob([arrayBuffer], { type: type.mime }));
      this.appendToResponse(view);
    } else if (Response.SUPPORT_IMAGE.includes(type.mime)) {
      const view = document.createElement("img");
      view.src = URL.createObjectURL(new Blob([arrayBuffer], { type: type.mime }));
      this.appendToResponse(view);
    } else {
      this.textPreview(arrayBuffer);
    }
  }

  private appendToResponse<T extends Node>(element: T) {
    const response = this.$refs.responseContainer as HTMLElement;
    if (!response) {
      return;
    }
    response.appendChild(element);
  }
}
</script>

<style lang="scss" scoped>
.response-body {
  height: calc(100vh - 317px);
}

.response-header {
  height: calc(100vh - 349px);
}
</style>
