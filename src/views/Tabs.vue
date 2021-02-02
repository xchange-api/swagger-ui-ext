<template>
  <div class="tabs">
    <my-menu :data="menuData" @select="menuSelect" ref="tabMenu" />

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
import Requester from "@/views/Requester.vue";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import { RequesterData } from "@/type/RequesterData";
import { MenuData, Tab } from "@/type/ComponentType";
import Menu from "@/components/Menu.vue";

@Component({
  components: {
    Requester,
    MyMenu: Menu
  }
})
export default class Tabs extends Vue {
  private tabList: Array<Tab> = [
    {
      title: "new tab",
      name: "default",
      content: RequesterData.DEFAULT()
    }
  ];

  private activeTabName = "default";

  private tabName!: string;

  private menuData: MenuData = {
    items: [
      { command: "closeRight", text: "关闭右侧" },
      { command: "closeLeft", text: "关闭左侧" },
      { command: "closeAll", text: "关闭全部" },
      { command: "closeOther", text: "关闭其他" }
    ],
    display: false,
    position: { top: "0px", left: "0px" }
  };

  created() {
    Bus.$on(BusEvent.OPEN_TAB, (reqData: RequesterData, option: any) => {
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

  mounted() {
    this.hideMenu();
  }

  /**
   * 在新tab打开
   * @param title
   * @param name
   * @param content
   */
  private openInNewTab(title: string, name: string, content: RequesterData) {
    // 存在同名的tab
    let tabName = name;
    if (this.tabList.find(value => value.name === name)) {
      tabName += Math.round(Math.random() * 1000);
    }
    this.tabList.push({ title: title, name: tabName, content: content });
    this.activeTabName = tabName;
  }

  /**
   * 在当前tab打开
   * @param title
   * @param name
   * @param content
   */
  private openInCurrentTab(title: string, name: string, content: RequesterData) {
    // 替换当前的tab
    const activeTab = this.tabList.find(value => value.name === this.activeTabName);
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
  private openInBackgroundTab(title: string, name: string, content: RequesterData) {
    // 存在同名的tab
    let tabName = name;
    if (this.tabList.find(value => value.name === name)) {
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
      this.openInNewTab("addTab", "addTab", RequesterData.DEFAULT());
    }
  }

  private showMenu(e: any) {
    if (!e.target?.id) {
      return;
    }
    const tabName = e.target.id;
    this.tabName = tabName.replace("tab-", "");
    this.menuData.position = { top: e.pageY + "px", left: e.pageX + "px" };
    this.menuData.display = true;
  }

  private hideMenu() {
    document.onclick = event => {
      if (this.menuData.display && event.target !== this.$refs.tabMenu) {
        this.menuData.display = false;
      }
    };
  }

  private menuSelect(command: string) {
    switch (command) {
      case "closeRight":
        this.closeRight();
        break;
    }
  }

  private closeRight() {
    debugger;
    const tabName = this.tabName;
    const tabs = this.tabList;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].name === tabName) {
        this.tabList = tabs.slice(0, i + 1);
        this.activeTabName = tabName;
        break;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  width: 100%;
  height: 100%;
}
</style>
