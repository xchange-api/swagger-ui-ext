<template>
  <div>
    <li v-for="item in history" :key="item.url + item.id">{{ item.url }}</li>
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
    this.history.push(reqData);
    historyDB.add(reqData);
  }
}
</script>

<style></style>
