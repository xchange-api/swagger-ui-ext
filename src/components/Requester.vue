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
        <el-tab-pane label="Authorization" name="auth"></el-tab-pane>
        <el-tab-pane label="Header" name="header"></el-tab-pane>
        <el-tab-pane label="Body" name="body">
          <editor :model="model"></editor>
        </el-tab-pane>
      </el-tabs>
    </div>
    <response :response="response"></response>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { RequesterData } from "@/type/RequesterData";
import Response from "@/components/Response.vue";
import Editor from "@/components/Editor.vue";
import { get } from "@/util/Http";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import * as monaco from "monaco-editor";

@Component({
  components: { Response, Editor }
})
export default class Requester extends Vue {
  @Prop()
  private reqData!: RequesterData;

  private response: any = "";

  private activeTabName = "params";

  private model = monaco.editor.createModel("", "json");

  created() {
    if (this.reqData.supportBody) {
      this.model.setValue(JSON.stringify(this.reqData.body()));
    }
  }

  private clickSend() {
    // 组装请求数据
    const params: any = {};
    if (this.reqData.params) {
      this.reqData.params.forEach(param => {
        params[param.name] = param.value;
      });
    }

    // 发送请求 TODO 判断请求类型
    get(this.reqData.url, { params: params }).then(data => {
      this.response = data;
      this.addHistory();
    });
  }

  private addHistory() {
    // 修改再请求会产生新的历史 无修改请求不产生历史 TODO 重复发送判断
    delete this.reqData.id;
    Bus.$emit(BusEvent.ADD_HISTORY, this.reqData);
  }
}
</script>

<style></style>
