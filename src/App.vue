<template>
  <div>
    <el-container>
      <el-header><div></div></el-header>
      <el-container>
        <!--left side api collection and history-->
        <el-aside class="aside-box">
          <el-input placeholder="请输入内容" size="small" class="search" v-model="searchText">
            {{ searchText }}
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
          <el-tabs v-model="activeTabName" class="tabs-list">
            <el-tab-pane label="Api" name="api">
              <api />
            </el-tab-pane>
            <el-tab-pane label="History" name="history">
              <history />
            </el-tab-pane>
            <el-tab-pane label="Collection" name="collection"></el-tab-pane>
          </el-tabs>
        </el-aside>
        <div class="slider"></div>
        <!--main page-->
        <el-main class="main-box"><tabs /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Api from "@/views/Api.vue";
import Tabs from "@/views/Tabs.vue";
import History from "@/views/History.vue";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";

@Component({
  components: {
    History,
    Api,
    Tabs
  }
})
export default class App extends Vue {
  private activeTabName = "api";

  private searchText = "";

  mounted() {
    this.resize();
  }

  /**侧边栏宽度调整*/
  private resize() {
    const aside = document.querySelector(".aside-box") as HTMLElement;
    const slider = document.querySelector(".slider") as HTMLElement;
    slider.onmousedown = function mouseDown(e: MouseEvent) {
      let start = e.clientX;
      document.onmousemove = function mouseMove(e) {
        aside.style.width = aside.offsetWidth + e.clientX - start + "px";
        start = e.clientX;
      };
      document.onmouseup = () => (document.onmousemove = document.onmouseup = null);
    };
  }

  @Watch("searchText", { immediate: false, deep: true })
  private searchTextChange(newText: string) {
    if (this.activeTabName === "api") {
      Bus.$emit(BusEvent.SEARCH_API, newText);
    } else if (this.activeTabName === "history") {
      Bus.$emit(BusEvent.SEARCH_HISTORY, newText);
    } else if (this.activeTabName === "collection") {
      // Bus.$emit(BusEvent.API_FILTER, newText);
    }
  }
}
</script>

<style lang="scss" scoped>
/**主页固定宽高*/
$height: calc(100vh - 76px);
.aside-box {
  width: 320px;
  height: $height;
  min-width: 260px;
  max-width: 500px;

  .search {
    width: 98%;
  }
}
.main-box {
  height: $height;
}

/**侧边栏宽度调整*/
.slider {
  background: #dcdfe6;
  width: 3px;
  cursor: col-resize;
  margin: 0 2px;
}
</style>
