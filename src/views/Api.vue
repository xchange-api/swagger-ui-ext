<template>
  <div>
    <el-tree :data="apiThree" @node-click="clickNode" @node-contextmenu="showMenu"></el-tree>
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
    this.hideMenu();
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

  private showMenu(e: MouseEvent, data: any, node: any) {
    if (node.level === 2) {
      this.menuData.position = { top: e.pageY + "px", left: e.pageX + "px" };
      this.menuData.display = true;
      this.reqData = data.reqData;
    }
  }

  private hideMenu() {
    document.onclick = event => {
      if (this.menuData.display && event.target !== this.$refs.apiMenu) {
        this.menuData.display = false;
      }
    };
  }

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

<style lang="scss" scoped></style>
