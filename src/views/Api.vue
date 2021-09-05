<!--api树-->
<template>
  <div class="api">
    <scroll-bar>
      <el-tree
        class="aside-tab-content"
        :data="apiThree"
        @node-click="openInNewTab"
        @node-contextmenu="showMenu"
        node-key="label"
        :default-expanded-keys="expandedKeys"
      >
        <div slot-scope="{ node }">
          <span class="multi-line" v-if="node.level === 1">{{ node.label }}</span>
          <span class="multi-line" v-if="node.level === 2">
            <span class="method">{{ node.data.reqData.type.toUpperCase() }}</span>
            {{ node.data.reqData.url }}
          </span>
        </div>
      </el-tree>
    </scroll-bar>
    <context-menu :data="menuData" :show.sync="menuShow" @select="menuSelect" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { get } from "@/util/Http";
import Bus from "@/util/Bus";
import { RequestData } from "@/type/RequestData";
import { MenuData, TreeNodeData, BusEvent } from "@/type/ComponentType";
import ContextMenu from "@/components/ContextMenu.vue";
import { isBlank } from "@/util/Util";
import ScrollBar from "@/components/ScrollBar.vue";

@Component({
  components: {
    ContextMenu,
    ScrollBar
  }
})
export default class Api extends Vue {
  private apiDoc!: any;

  private apiThree: Array<TreeNodeData> = [];

  private sourceApiTree: Array<TreeNodeData> = [];

  private reqData!: RequestData;

  private menuData: MenuData = {
    items: [
      { command: "openInCurrentTab", text: "当前标签打开" },
      { command: "openInBackgroundTab", text: "后台打开" }
    ],
    position: { top: "0px", left: "0px" }
  };

  private menuShow = false;

  private expandedKeys: string[] = [];

  created() {
    this.initApiDoc();
  }

  mounted() {
    Bus.$on(BusEvent.SEARCH_API, this.search);
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
      .catch(e => {
        this.$message.error("无法获取swagger数据");
        console.error(e);
      });
  }

  /**
   * 处理一级（controller）节点
   *
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
   */
  private apiDoc2Three() {
    const three: TreeNodeData[] = [];
    const tags = this.apiDoc.tags;
    if (!tags) {
      this.$message.error("v2/api-docs无数据, 请检查swagger配置");
      return;
    }

    for (const tag of tags) {
      const children = this.getChildrenThree(tag.name);
      three.push({ label: tag.name, children: children });
    }
    this.sourceApiTree = this.apiThree = three;
  }

  /**
   * 处理二级（方法）节点
   *
   * @param tagName controller名称
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
   */
  private getChildrenThree(tagName: string) {
    const children: TreeNodeData[] = [];
    const paths = this.apiDoc.paths;
    for (const path in paths) {
      for (const reqType in paths[path]) {
        const reqInfo = paths[path][reqType];
        if (reqInfo.tags.includes(tagName)) {
          const url = (this.apiDoc.basePath === "/" ? "" : this.apiDoc.basePath) + path;
          children.push({
            label: reqType + url,
            reqData: new RequestData(reqType, url, reqInfo.parameters, this.apiDoc.definitions, this.apiDoc.host)
          });
        }
      }
    }
    return children;
  }

  private openInNewTab(data: any, node: any) {
    if (node.level === 2) {
      Bus.$emit(BusEvent.OPEN_TAB, data.reqData, { type: BusEvent.OPEN_IN_NEW_TAB });
    }
  }

  /**
   * 右键菜单
   *
   * @param e
   * @param data
   * @param node
   */
  private showMenu(e: MouseEvent, data: any, node: any) {
    if (node.level === 2) {
      this.menuData.position = { top: e.pageY + "px", left: e.pageX + "px" };
      this.menuShow = true;
      this.reqData = data.reqData;
    }
  }

  /**
   * 右键菜单选择
   *
   * @param command
   */
  private menuSelect(command: string) {
    switch (command) {
      case "openInCurrentTab":
        this.openInCurrentTab(this.reqData);
        break;
      case "openInBackgroundTab":
        this.openInBackgroundTab(this.reqData);
        break;
    }
  }

  private openInCurrentTab(reqData: RequestData) {
    Bus.$emit(BusEvent.OPEN_TAB, reqData, { type: BusEvent.OPEN_IN_CURRENT_TAB });
  }

  private openInBackgroundTab(reqData: RequestData) {
    Bus.$emit(BusEvent.OPEN_TAB, reqData, { type: BusEvent.OPEN_IN_BACKGROUND_TAB });
  }

  /**
   * 搜索
   *
   * @param value
   */
  private search(value: string) {
    if (isBlank(value)) {
      this.apiThree = this.sourceApiTree;
      this.expandedKeys = [];
      return;
    }

    const nodeList: TreeNodeData[] = [];
    for (const node of this.sourceApiTree) {
      if (node.label.indexOf(value) !== -1) {
        nodeList.push(node);
      } else if (node.children) {
        const childNodeList = [];
        for (const childNode of node.children) {
          if (childNode.reqData && childNode.reqData.includes(value)) {
            childNodeList.push(childNode);
          }
        }
        if (childNodeList.length > 0) {
          this.expandedKeys.push(node.label);
          nodeList.push({ label: node.label, children: childNodeList });
        }
      }
    }
    this.apiThree = nodeList;
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

  /*请求方法*/
  .method {
    border: 1px solid #409eff;
    border-radius: 2px;
    display: inline-block;
    padding: 1px;
    color: #fff;
    background-color: #409eff;
    font-size: 12px;
  }
}
</style>
