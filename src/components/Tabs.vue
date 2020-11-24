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
      title: "xxx.com",
      name: "xxx.com",
      content: { type: "get", url: "xxx.com" }
    }
  ];
  private activeTabName = this.tabList[0].title;

  created() {
    Bus.$on(BusEvent.SELECT_API, (data: RequesterData) => {
      this.addTab(data.url, data.url, data);
    });
  }

  private addTab(title: string, name: string, content: any) {
    // 判断是否已经存在

    this.tabList.push({
      title: title,
      name: name,
      content: content
    });

    debugger;
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

  private handleClick(tab: any, event: any) {
    if (tab.name === "add") {
      event.preventDefault();
      this.addTab("addTab", "addTab", { type: "get", url: "addTab" });
    }
  }
}
</script>

<style></style>
