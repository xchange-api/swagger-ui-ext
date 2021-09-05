<template>
  <div class="history">
    <scroll-bar>
      <el-checkbox-group v-model="checkHistoryId">
        <ul ref="ulContainer" class="aside-tab-content">
          <li v-for="item in history" :key="item.id">
            <!--时间线 start-->
            <el-divider content-position="left" v-if="showTime(item)">
              {{ new Date(item.timestamp).toLocaleDateString() }}
            </el-divider>
            <!--时间线 end-->
            <div @contextmenu.prevent="showMenu($event, item)">
              <el-checkbox :label="item.id" v-show="selectModel" class="opt-checkbox" />
              <span class="multi-line" @click="openInNewTab(item)">
                {{ item.url }}
              </span>
            </div>
          </li>
        </ul>
      </el-checkbox-group>
    </scroll-bar>

    <!--底部操作按钮 start-->
    <div class="btn-bottom">
      <el-button type="text" @click="selectAll" v-show="selectModel">全选</el-button>
      <el-button type="text" @click="bulkRemove" v-show="selectModel">删除</el-button>
      <el-button type="text" @click="quitSelectModel" v-show="selectModel">退出</el-button>
    </div>
    <!--底部操作按钮 end-->

    <context-menu :data="menuData" :show.sync="menuShow" @select="menuSelect" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { RequestData } from "@/type/RequestData";
import Bus from "@/util/Bus";
import historyDB from "@/api/HistoryDB";
import ContextMenu from "@/components/ContextMenu.vue";
import { MenuData, BusEvent } from "@/type/ComponentType";
import { isBlank } from "@/util/Util";
import ScrollBar from "@/components/ScrollBar.vue";

@Component({
  components: {
    ContextMenu,
    ScrollBar
  }
})
export default class History extends Vue {
  private history: Array<RequestData> = [];

  private sourceHistory: Array<RequestData> = [];

  private reqData!: RequestData;

  private menuData: MenuData = {
    items: [
      { command: "openInCurrentTab", text: "当前标签打开" },
      { command: "openInBackgroundTab", text: "后台打开" },
      { command: "deleteHistory", text: "删除历史" },
      { command: "gotoSelectModel", text: "选择模式" }
    ],
    position: { top: "0px", left: "0px" }
  };

  private menuShow = false;

  private selectModel = false;

  private checkHistoryId: number[] = [];

  private beforeTime!: number;

  created() {
    this.initHistory();
    Bus.$on(BusEvent.ADD_HISTORY, this.addHistory);
    Bus.$on(BusEvent.SEARCH_HISTORY, this.search);
  }

  private initHistory() {
    historyDB.all().then((history: Array<RequestData>) => {
      this.sourceHistory = this.history = history.sort((a, b) => b.timestamp - a.timestamp);
    });
  }

  private showMenu(e: MouseEvent, data: RequestData) {
    this.menuData.position = { top: e.pageY + "px", left: e.pageX + "px" };
    this.menuShow = true;
    this.reqData = data;
  }

  private addHistory(reqData: RequestData) {
    historyDB.remove(reqData);
    historyDB.add(reqData);
    this.initHistory();
  }

  /**
   * 新窗口打开
   *
   * @param reqData
   */
  private openInNewTab(reqData: RequestData) {
    Bus.$emit(BusEvent.OPEN_TAB, reqData, { type: BusEvent.OPEN_IN_NEW_TAB });
  }

  private openInCurrentTab(reqData: RequestData) {
    Bus.$emit(BusEvent.OPEN_TAB, reqData, { type: BusEvent.OPEN_IN_CURRENT_TAB });
  }

  private openInBackgroundTab(reqData: RequestData) {
    Bus.$emit(BusEvent.OPEN_TAB, reqData, { type: BusEvent.OPEN_IN_BACKGROUND_TAB });
  }

  private deleteHistory(reqData: RequestData) {
    historyDB.remove(reqData);
    this.initHistory();
  }

  private gotoSelectModel() {
    if (this.selectModel) {
      this.quitSelectModel();
    } else {
      const element = this.$refs.ulContainer as HTMLElement;
      if (element) {
        element.setAttribute("style", "height: calc(100vh - 189px);");
        this.selectModel = true;
      }
    }
  }

  private quitSelectModel() {
    const element = this.$refs.ulContainer as HTMLElement;
    if (element) {
      element.removeAttribute("style");
      this.selectModel = false;
    }
  }

  private selectAll() {
    this.checkHistoryId = this.history.map(h => h.id);
  }

  private bulkRemove() {
    if (this.checkHistoryId?.length < 1) {
      this.$message.warning("请选择要删除的历史记录");
      return;
    }
    historyDB.bulkRemove(this.checkHistoryId);
    this.initHistory();
    this.quitSelectModel();
  }

  private showTime(reqData: RequestData): boolean {
    if (!this.beforeTime) {
      this.beforeTime = reqData.timestamp;
      return true;
    } else {
      const beforeDate = new Date(this.beforeTime);
      const date = new Date(reqData.timestamp);
      if (beforeDate.getMonth() !== date.getMonth() || beforeDate.getDate() !== date.getDate()) {
        this.beforeTime = reqData.timestamp;
        return true;
      } else {
        return false;
      }
    }
  }

  private menuSelect(command: string) {
    switch (command) {
      case "openInCurrentTab":
        this.openInCurrentTab(this.reqData);
        break;
      case "openInBackgroundTab":
        this.openInBackgroundTab(this.reqData);
        break;
      case "deleteHistory":
        this.deleteHistory(this.reqData);
        break;
      case "gotoSelectModel":
        this.gotoSelectModel();
        break;
    }
  }

  /**
   * 搜索历史记录
   *
   * @param value
   */
  private search(value: string) {
    if (isBlank(value)) {
      this.history = this.sourceHistory;
      return;
    }
    this.history = this.history.filter(history => history.includes(value));
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
    font-size: 16px;
    padding: 2px 0;

    .multi-line {
      overflow-wrap: break-word;
      word-break: break-all;
      overflow: hidden;
      height: auto;
    }

    /* 勾选框 */
    .opt-checkbox {
      margin-left: 5px;
      /deep/ .el-checkbox__label {
        display: none;
      }
    }

    span:hover {
      background-color: #f5f7fa;
    }
  }

  /* 底部操作按钮 */
  .btn-bottom {
    /deep/ button {
      padding: 0;
    }
  }
}
</style>
