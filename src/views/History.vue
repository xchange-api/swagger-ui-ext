<template>
  <div class="history">
    <ul>
      <li v-for="item in history" :key="item.url + item.id" @click="openInNewTab(item)">{{ item.url }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { RequesterData } from "@/type/RequesterData";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import historyDB from "@/api/HistoryDB";

@Component({
  components: {}
})
export default class History extends Vue {
  private history: Array<RequesterData> = [];

  created() {
    this.initHistory();
    Bus.$on(BusEvent.ADD_HISTORY, this.addHistory);
  }

  private initHistory() {
    historyDB.all().then((history: Array<RequesterData>) => {
      this.history = history;
    });
  }

  private addHistory(reqData: RequesterData) {
    const history = this.history.find(h => h.id === reqData.hashId());
    if (!history) {
      this.history.push(reqData);
      historyDB.add(reqData);
    }
  }

  /**
   * 新窗口打开
   * @param reqData
   */
  private openInNewTab(reqData: RequesterData) {
    //
  }

  private deleteHistory(reqData: RequesterData) {
    //
  }

  private operateHistory(reqData: RequesterData, operate: string) {
    switch (operate) {
      case "open":
        this.openInNewTab(reqData);
        break;
      case "delete":
        this.deleteHistory(reqData);
        break;
    }
  }
}
</script>

<style lang="scss" scoped>
.history {
  ul {
    padding-left: 10px;
    margin: 0;
  }
  ul li {
    list-style: none;
    color: #606266;
    font-size: 14px;
  }
  ul li:hover {
    background-color: #f5f7fa;
  }
}
</style>
