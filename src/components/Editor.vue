<template>
  <div>
    <div id="editor-con" style="height: 100px; width: 100%"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as monaco from "monaco-editor";
import { get } from "@/util/Http";

@Component({
  components: {}
})
export default class Editor extends Vue {
  mounted() {
    get("/swagger-resources", {}).then((res: any) => {
      this.init();
    });
  }

  private init() {
    const jsonCode = ["{", '    "p1": "v3",', '    "p2": false', "}"].join(
      "\n"
    );

    const model = monaco.editor.createModel(jsonCode, "json");
    const element = window.document.getElementById("editor-con");
    if (element) {
      monaco.editor.create(element, {
        model: model,
        minimap: { enabled: false },
        automaticLayout: true // 当加载时被挂载的元素不可见时, monaco editor会设置为隐藏, 被挂载元素变为可见时不会自动更新为可见
      });
    }
  }
}
</script>

<style></style>
