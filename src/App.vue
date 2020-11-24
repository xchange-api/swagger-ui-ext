<template>
  <div>
    <el-container>
      <el-header><div></div></el-header>
      <el-container>
        <el-aside width="200px"><api-collection /></el-aside>
        <el-main><tabs /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApiCollection from "@/components/ApiCollection.vue";
import Tabs from "@/components/Tabs.vue";

@Component({
  components: {
    ApiCollection,
    Tabs
  }
})
export default class App extends Vue {}
</script>

<style></style>
