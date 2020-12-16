<template>
  <div class="tabs">
    <el-tabs
        v-if="tabList.length>0"
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
      <!-- <el-tab-pane
        key="add"
        name="add"
        :closable="false"
        label="+"
      ></el-tab-pane> -->
    </el-tabs>
    <div v-else class="home-box">
        <div class="home-content"><h1>Welcome out World</h1></div>
    </div>
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
//   private tabList = [
//     {
//       title: "new tab",
//       name: "new tab",
//       content: { type: "get", url: "" }
//     }
//   ];
    private tabList : Array<any> =[];
  private activeTabName :any = "" ;

  created() {
    Bus.$on(BusEvent.SELECT_API, (reqData: RequesterData) => {
      this.addTab(reqData.url, reqData.url, reqData);
    });
  }
  private addTab(title: string, name: string, content: any) {
    // TODO 判断是否已经存在
    if(!this.tabList.some(e=>e.title === title))//去除重复
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

<style lang="scss" scoped>
.tabs{
    width: 100%;
    height: 100%;
    .home-box{
        width: 100%;
        height: 100%;
        .home-content{
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}

</style>>
