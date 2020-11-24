<template>
  <div>
    <div style="display: flex;">
      <el-input placeholder="enter request url" v-model="reqData.url">
        <template slot="prepend">{{ reqData.type }}</template>
      </el-input>
      <el-button>send</el-button>
    </div>
    <div>
      <el-tabs>
        <el-tab-pane label="Params" name="params"></el-tab-pane>
        <el-tab-pane label="Authorization" name="auth"></el-tab-pane>
        <el-tab-pane label="Header" name="header"></el-tab-pane>
        <el-tab-pane label="Body" name="body"></el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { RequesterData } from "@/type/RequesterData";

@Component({
  components: {}
})
export default class Requester extends Vue {
  @Prop()
  private reqData!: RequesterData;
}
</script>

<style></style>
