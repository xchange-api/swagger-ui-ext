<template>
  <div class="tabs">
    <el-tabs v-model="activeTabName" type="card" @tab-click="handleClick" @tab-remove="removeTab">
      <el-tab-pane v-for="item in tabList" :key="item.name" :label="item.title" :name="item.name" :closable="true">
        <requester :req-data="item.content"></requester>
      </el-tab-pane>
      <el-tab-pane key="add" name="add" :closable="false" label="+"></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Requester from "@/components/Requester.vue";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import { RequesterData } from "@/type/RequesterData";
import { Tab } from "@/type/Tab";

@Component({
  components: {
    Requester
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
}
</script>

<style lang="scss" scoped>
.tabs {
  width: 100%;
  height: 100%;
}
</style>
