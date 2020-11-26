<template>
  <div>
    <el-container>
      <el-header><div></div></el-header>
      <el-container>
        <!--left side api collection and history-->
        <el-aside width="320px">
          <el-tabs v-model="activeTabName">
            <el-tab-pane label="api collection" name="apiCollection">
              <api-collection />
            </el-tab-pane>
            <el-tab-pane label="history" name="history">
              <history />
            </el-tab-pane>
          </el-tabs>
        </el-aside>
        <!--main page-->
        <el-main><tabs /></el-main>
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

<style></style>
