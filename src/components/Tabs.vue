<template>
  <div class="tabs">
    <el-tabs
      v-model="activeTabName"
      type="card"
      @tab-click="handleClick"
      @tab-remove="removeTab"
    >
      <el-tab-pane
        v-for="item in tabList"
        :key="item.name"
        :label="item.title"
        :name="item.name"
        :closable="true"
      >
        <requester :req-data="item.content"></requester>
      </el-tab-pane>
      <el-tab-pane
        key="add"
        name="add"
        :closable="false"
        label="+"
      ></el-tab-pane>
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
      content: new RequesterData("get", "", [], {})
    }
  ];
  private activeTabName = "default";

  created() {
    Bus.$on(BusEvent.SELECT_API, (reqData: RequesterData) => {
      this.addTab(reqData.url, reqData.url, reqData);
    });
  }

  /**
   * 添加tab
   * @param title
   * @param name
   * @param content
   * @param newTab
   */
  private addTab(
    title: string,
    name: string,
    content: RequesterData,
    newTab = false
  ) {
    // 存在同名的tab
    let tabName = name;
    if (this.tabList.find(value => value.name === name)) {
      tabName += Math.round(Math.random() * 1000);
    }

    if (newTab || this.tabList.length === 0) {
      // 如果
      this.tabList.push({
        title: title,
        name: tabName,
        content: content
      });
    } else {
      // 替换当前的tab
      const activeTab = this.tabList.find(
        value => value.name === this.activeTabName
      );
      if (activeTab) {
        activeTab.title = title;
        activeTab.name = tabName;
        activeTab.content = content;
      }
    }
    this.activeTabName = tabName;
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
      this.addTab(
        "addTab",
        "addTab",
        new RequesterData("get", "", [], {}),
        true
      );
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
