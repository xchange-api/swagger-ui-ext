<template>
  <div>
    <el-tree :data="apiThree" @node-click="clickNode" @node-contextmenu="menu"></el-tree>
    <div id="perTreeMenu" v-if="menuDisplay" class="tree_menu" :style="{ ...rightMenu }">
      <ul>
        <li @click="openInCurrentTab">当前标签打开</li>
        <li @click="openInBackgroundTab">后台打开</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { get } from "@/util/Http";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import { RequesterData } from "@/type/RequesterData";

@Component({
  components: {}
})
export default class Api extends Vue {
  private apiDoc!: any;
  private apiThree: Array<any> = [];
  private rightMenu = { top: "0px", left: "0px" };
  private menuDisplay = false;
  private reqData!: RequesterData;

  created() {
    this.initApiDoc();
  }

  mounted() {
    // 点击空白处关闭菜单
    const that = this;
    document.onclick = function(event) {
      if (event.target !== document.getElementById("perTreeMenu")) {
        that.menuDisplay = false;
      }
    };
  }

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

  private apiDoc2Three() {
    const three = [];
    const tags = this.apiDoc.tags;
    for (const tag of tags) {
      const children = this.getChildrenThree(tag.name);
      three.push({ label: tag.name, children: children });
    }
    this.apiThree = three;
  }

  private getChildrenThree(tagName: string) {
    const children = [];
    const paths = this.apiDoc.paths;
    for (const reqUrl in paths) {
      for (const reqType in paths[reqUrl]) {
        const reqInfo = paths[reqUrl][reqType];
        if (reqInfo.tags.includes(tagName)) {
          children.push({
            label: reqUrl,
            reqData: new RequesterData(reqType, reqUrl, reqInfo.parameters, this.apiDoc.definitions)
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

  private menu(e: MouseEvent, data: any, node: any) {
    if (node.level === 2) {
      this.rightMenu = { top: e.pageY + "px", left: e.pageX + "px" };
      this.menuDisplay = true;
      this.reqData = data.reqData;
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
.tree_menu {
  position: fixed;
  display: block;
  z-index: 20000;
  background-color: #fff;
  padding: 5px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  ul {
    margin: 0;
    padding: 0;
  }
  ul li {
    list-style: none;
    margin: 0;
    padding: 0 10px;
    font-size: 14px;
    line-height: 30px;
    cursor: pointer;
  }
  ul li:hover {
    background-color: #f5f7fa;
  }
}
</style>
