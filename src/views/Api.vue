<!--api树-->
<template>
  <div class="api">
    <el-tree :data="apiThree" @node-click="clickNode" @node-contextmenu="showMenu">
      <div slot-scope="{ node }">
        <span class="multi-line">{{ node.label }}</span>
      </div>
    </el-tree>
    <my-menu :data="menuData" @select="menuSelect" ref="apiMenu" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { get } from "@/util/Http";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import { RequesterData } from "@/type/RequesterData";
import { MenuData } from "@/type/ComponentType";
import Menu from "@/components/Menu.vue";

@Component({
  components: {
    MyMenu: Menu
  }
})
export default class Api extends Vue {
  private apiDoc!: any;

  private apiThree: Array<any> = [];

  private reqData!: RequesterData;

  private menuData: MenuData = {
    items: [
      { command: "openInCurrentTab", text: "当前标签打开" },
      { command: "openInBackgroundTab", text: "后台打开" }
    ],
    display: false,
    position: { top: "0px", left: "0px" }
  };

  created() {
    this.initApiDoc();
  }

  mounted() {
    // TODO 修复菜单不消失bug
    document.onclick = event => {
      if (this.menuData.display && event.target !== this.$refs.apiMenu) {
        this.menuData.display = false;
      }
    };
  }

  /**
   * 访问swagger, 初始化api文档
   */
  private initApiDoc() {
    get("/swagger-resources", {})
      .then((res: any) => {
        return res[0].location; // api doc url
      })
      .then((url: string) => {
        return get(url, {});
      })
      .then(res => {
        this.apiDoc = res;
        this.apiDoc2Three();
      })
      .catch(e => console.error(e));
  }

  /**
   * 处理一级（controller）节点
   */
  private apiDoc2Three() {
    const three = [];
    const tags = this.apiDoc.tags;
    for (const tag of tags) {
      const children = this.getChildrenThree(tag.name);
      three.push({ label: tag.name, children: children });
    }
    this.apiThree = three;
  }

  /**
   * 处理二级（方法）节点
   * @param tagName controller名称
   */
  private getChildrenThree(tagName: string) {
    const children = [];
    const paths = this.apiDoc.paths;
    for (const path in paths) {
      for (const reqType in paths[path]) {
        const reqInfo = paths[path][reqType];
        if (reqInfo.tags.includes(tagName)) {
          const url = (this.apiDoc.basePath === "/" ? "" : this.apiDoc.basePath) + path;
          children.push({
            label: url,
            reqData: new RequesterData(reqType, url, reqInfo.parameters, this.apiDoc.definitions, this.apiDoc.host)
          });
        }
      }
    }
    return children;
  }

  private clickNode(data: any, node: any) {
    if (node.level === 2) {
      Bus.$emit(BusEvent.OPEN_TAB, data.reqData, { type: BusEvent.OPEN_IN_NEW_TAB });
    }
  }

  /**
   * 右键菜单
   * @param e
   * @param data
   * @param node
   */
  private showMenu(e: MouseEvent, data: any, node: any) {
    if (node.level === 2) {
      this.menuData.position = { top: e.pageY + "px", left: e.pageX + "px" };
      this.menuData.display = true;
      this.reqData = data.reqData;
    }
  }

  /**
   * 右键菜单选择
   * @param command
   */
  private menuSelect(command: string) {
    switch (command) {
      case "openInCurrentTab":
        this.openInCurrentTab();
        break;
      case "openInBackgroundTab":
        this.openInBackgroundTab();
        break;
    }
  }

  private openInCurrentTab() {
    Bus.$emit(BusEvent.OPEN_TAB, this.reqData, { type: BusEvent.OPEN_IN_CURRENT_TAB });
  }

  private openInBackgroundTab() {
    Bus.$emit(BusEvent.OPEN_TAB, this.reqData, { type: BusEvent.OPEN_IN_BACKGROUND_TAB });
  }
}
</script>

<style lang="scss" scoped>
.api {
  /**多行文本*/
  .multi-line {
    overflow-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
    height: auto;
  }
  /deep/ .el-tree-node {
    white-space: normal;
    .el-tree-node__content {
      height: 100%;
      align-items: start;
    }
  }
}
</style>
