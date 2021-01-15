<template>
  <div>
    <div style="display: flex;">
      <el-input placeholder="enter request url" v-model="reqData.query">
        <template slot="prepend">{{ reqData.type }}</template>
      </el-input>
      <el-button @click="clickSend">send</el-button>
    </div>
    <div>
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="Params" name="params">
          <el-table :data="reqData.params" style="width: 100%">
            <el-table-column prop="name" label="name" width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="value" width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="description"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="Authorization" name="auth">
          <authorization />
        </el-tab-pane>
        <el-tab-pane label="Header" name="header"></el-tab-pane>
        <el-tab-pane label="Body" name="body">
          <editor :model="model"></editor>
        </el-tab-pane>
      </el-tabs>
    </div>
    <response :response="response" :headers="headers"></response>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { RequesterData } from "@/type/RequesterData";
import Response from "@/components/Response.vue";
import Editor from "@/components/Editor.vue";
import Authorization from "@/components/Authorization.vue";
import { request } from "@/util/Http";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import * as monaco from "monaco-editor";
import { formatJson, isJson } from "@/util/TextUtil";

@Component({
  components: { Response, Editor, Authorization }
})
export default class Requester extends Vue {
  @Prop()
  private reqData!: RequesterData;

  private response: any = "";

  private activeTabName = "params";

  private model = monaco.editor.createModel("", "json");

  private headers: any = "";

  created() {
    if (this.reqData.supportBody) {
      this.model.setValue(formatJson(this.reqData.bodyExample()) || "");
    }
  }

  private clickSend() {
    const bodyJson = isJson(this.model.getValue());
    if (bodyJson) {
      this.reqData.body = bodyJson;
    }
    debugger;
    request(this.reqData).then(res => {
      this.headers = res.headers;
      this.response = res.data;
      this.addHistory();
    });
  }

  private addHistory() {
    Bus.$emit(BusEvent.ADD_HISTORY, this.reqData);
  }
}
</script>

<style></style>
