<template>
  <div>
    <el-container>
      <el-header><div></div></el-header>
      <el-container>
        <!--left side api collection and history-->
        <el-aside width="320px" class="aside-box">
          <el-tabs v-model="activeTabName" class="tabs-list">
            <el-tab-pane label="api collection" name="apiCollection">
              <api-collection />
            </el-tab-pane>
            <el-tab-pane label="history" name="history">
              <history />
            </el-tab-pane>
          </el-tabs>
        </el-aside>
        <!--main page-->
        <el-main class="main-box"><tabs /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApiCollection from "@/components/ApiCollection.vue";
import Tabs from "@/components/Tabs.vue";
import History from "@/components/History.vue";

@Component({
  components: {
    History,
    ApiCollection,
    Tabs
  }
})
export default class App extends Vue {
  private activeTabName = "apiCollection";
}
</script>

<style lang="scss" scoped>
$height: calc(100vh - 76px);
.aside-box {
  width: 320px;
  height: $height;
  .tabs-list {
    .el-tabs__content {
      height: calc(100vh - 130px);
      overflow: auto;
    }
  }
}
.main-box {
  height: $height;
}</style
>>
