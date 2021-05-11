<template>
  <div class="tabs">
    <context-menu :data="menuData" :show.sync="menuShow" @select="menuSelect">
      <button @click="copyURL"></button>
    </context-menu>

    <el-tabs
      v-model="activeTabName"
      type="card"
      @tab-click="handleClick"
      @tab-remove="removeTab"
      @contextmenu.prevent.native="showMenu($event)"
    >
      <el-tab-pane v-for="item in tabList" :key="item.name" :label="item.title" :name="item.name" :closable="true">
        <requester :req-data="item.content"></requester>
      </el-tab-pane>
      <el-tab-pane key="add" name="add" :closable="false" label="+"></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Request from "@/views/Request.vue";
import Bus from "@/util/Bus";
import { RequestData } from "@/type/RequestData";
import { MenuData, Tab, BusEvent } from "@/type/ComponentType";
import ContextMenu from "@/components/ContextMenu.vue";
import { buildCURL } from "@/util/Http";

@Component({
  components: {
    Requester: Request,
    ContextMenu
  }
})
export default class Tabs extends Vue {
  private tabList: Array<Tab> = [
    {
      title: "new tab",
      name: "default",
      content: RequestData.DEFAULT()
    }
  ];

  private activeTabName = "default";

  private tabName!: string; // 右键选中的tab

  private menuData: MenuData = {
    items: [
      { command: "closeRight", text: "关闭右侧" },
      { command: "closeLeft", text: "关闭左侧" },
      { command: "closeAll", text: "关闭全部" },
      { command: "closeOther", text: "关闭其他" },
      { command: "copyURL", text: "复制URL" },
      { command: "copyCURL", text: "复制CURL" }
    ],
    position: { top: "0px", left: "0px" }
  };

  private menuShow = false;

  created() {
    this.openTab();
  }

  private openTab() {
    Bus.$on(BusEvent.OPEN_TAB, (reqData: RequestData, option: any) => {
      if (!option || !option.type) {
        return;
      }

      switch (option.type) {
        case BusEvent.OPEN_IN_NEW_TAB:
          this.openInNewTab(reqData.url, reqData.url, reqData);
          break;
        case BusEvent.OPEN_IN_CURRENT_TAB:
          this.openInCurrentTab(reqData.url, reqData.url, reqData);
          break;
        case BusEvent.OPEN_IN_BACKGROUND_TAB:
          this.openInBackgroundTab(reqData.url, reqData.url, reqData);
          break;
      }
    });
  }

  /**
   * 在新tab打开
   *
   * @param title
   * @param name
   * @param content
   */
  private openInNewTab(title: string, name: string, content: RequestData) {
    // 存在同名的tab
    let tabName = name;
    if (this.findTab(name)) {
      tabName += Math.round(Math.random() * 1000);
    }
    this.tabList.push({ title: title, name: tabName, content: content });
    this.activeTabName = tabName;
  }

  /**
   * 在当前tab打开
   *
   * @param title
   * @param name
   * @param content
   */
  private openInCurrentTab(title: string, name: string, content: RequestData) {
    // 替换当前的tab
    const activeTab = this.findTab(this.activeTabName);
    if (activeTab) {
      activeTab.title = title;
      activeTab.name = name;
      activeTab.content = content;
    }
    this.activeTabName = name;
  }

  /**
   * 在后台打开
   * @param title
   * @param name
   * @param content
   */
  private openInBackgroundTab(title: string, name: string, content: RequestData) {
    // 存在同名的tab
    let tabName = name;
    if (this.findTab(name)) {
      tabName += Math.round(Math.random() * 1000);
    }
    this.tabList.push({ title: title, name: tabName, content: content });
  }

  /**
   * 删除tab
   * @param targetName
   */
  private removeTab(targetName: string) {
    const tabs = this.tabList;
    let activeName = this.activeTabName;
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1];
          if (nextTab) {
            activeName = nextTab.name;
          }
        }
      });
    }

    this.activeTabName = activeName;
    this.tabList = tabs.filter(tab => tab.name !== targetName);
  }

  /**
   * 点击添加
   * @param tab
   * @param event
   */
  private handleClick(tab: any, event: MouseEvent) {
    if (tab.name === "add") {
      event.preventDefault();
      this.openInNewTab("addTab", "addTab", RequestData.DEFAULT());
    }
  }

  private showMenu(e: any) {
    if (!e.target?.id || !this.findTab(e.target.id.replace("tab-", ""))) {
      return;
    }
    this.tabName = e.target.id.replace("tab-", "");
    this.menuData.position = { top: e.pageY + "px", left: e.pageX + "px" };
    this.menuShow = true;
  }

  private menuSelect(command: string) {
    switch (command) {
      case "closeRight":
        this.closeRight();
        break;
      case "closeLeft":
        this.closeLeft();
        break;
      case "closeAll":
        this.closeAll();
        break;
      case "closeOther":
        this.closeOther();
        break;
      case "copyURL":
        this.copyURL();
        break;
      case "copyCURL":
        this.copyCURL();
        break;
    }
  }

  /**
   * 关闭右侧标签页
   * 当前激活窗口在右侧要关闭的标签页中, 则关闭后激活点击右键的标签页
   */
  private closeRight() {
    const tabName = this.tabName;
    const tabs = this.tabList;
    let activateTabNeedClose = true; // 当前激活窗口在右侧要关闭的标签页中
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].name === this.activeTabName) {
        activateTabNeedClose = false;
      }

      if (tabs[i].name === tabName) {
        this.tabList = tabs.slice(0, i + 1);
        if (activateTabNeedClose) {
          this.activeTabName = tabName;
        }
        break;
      }
    }
  }

  /**
   * 关闭左侧标签页
   * 当前激活窗口在左侧要关闭的标签页中, 则关闭后激活点击右键的标签页
   */
  private closeLeft() {
    const tabName = this.tabName;
    const tabs = this.tabList;
    let activateTabNeedClose = false; // 当前激活窗口在左侧要关闭的标签页中
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].name === this.activeTabName) {
        activateTabNeedClose = true;
      }

      if (tabs[i].name === tabName) {
        this.tabList = tabs.slice(i, tabs.length);
        if (activateTabNeedClose) {
          this.activeTabName = tabName;
        }
        break;
      }
    }
  }

  private closeAll() {
    this.tabList = [];
    this.activeTabName = "";
  }

  private closeOther() {
    const tabs = this.tabList;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].name === this.tabName) {
        this.tabList = [tabs[i]];
        this.activeTabName = this.tabName;
        break;
      }
    }
  }

  private copyURL() {
    const tab = this.findTab(this.tabName);
    if (!tab) {
      return;
    }
    this.copyToClipboard(tab.content.fullURL());
  }

  private copyCURL() {
    const tab = this.findTab(this.tabName);
    if (!tab) {
      return;
    }
    this.copyToClipboard(buildCURL(tab.content));
  }

  private findTab(tabName: string) {
    return this.tabList.find(value => value.name === tabName);
  }

  private copyToClipboard(value: string) {
    const element = document.createElement("input");
    element.setAttribute("value", value);
    element.setAttribute("style", "position: absolute; left: -999px;");
    document.body.appendChild(element);
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  width: 100%;
  height: 100%;
}
</style>
