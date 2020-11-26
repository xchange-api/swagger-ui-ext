<template>
  <div>
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

@Component({
  components: {
    Requester
  }
})
export default class Tabs extends Vue {
  private tabList = [
    {
      title: "new tab",
      name: "new tab",
      content: { type: "get", url: "" }
    }
  ];
  private activeTabName = this.tabList[0].name;

  created() {
    Bus.$on(BusEvent.SELECT_API, (reqData: RequesterData) => {
      this.addTab(reqData.url, reqData.url, reqData);
    });
  }

  private addTab(title: string, name: string, content: any) {
    // TODO 判断是否已经存在

    this.tabList.push({
      title: title,
      name: name,
      content: content
    });

    this.activeTabName = name;
  }

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
   * 切换或添加页签
   * @param tab 页签
   * @param event
   */
  private handleClick(tab: any, event: any) {
    if (tab.name === "add") {
      event.preventDefault();
      this.addTab("addTab", "addTab", { type: "get", url: "addTab" });
    }
  }
}
</script>

<style></style>
