<template>
  <div>
    <div style="display: flex;">
      <el-input placeholder="enter request url" v-model="reqData.formatUrl">
        <template slot="prepend">{{ reqData.type }}</template>
      </el-input>
      <el-button @click="clickSend">send</el-button>
    </div>
    <div>
      <el-tabs>
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
        <el-tab-pane label="Body" name="body"></el-tab-pane>
      </el-tabs>
    </div>
    <response :response="response"></response>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { RequesterData } from "@/type/RequesterData";
import Response from "@/components/Response.vue";
import { get } from "@/util/Http";

@Component({
  components: { Response }
})
export default class Requester extends Vue {
  @Prop()
  private reqData!: RequesterData;

  private response: any = "";

  private clickSend() {
    // 组装请求数据
    const params: any = {};
    this.reqData.params.forEach(param => (params[param.name] = param.value));

    // 发送请求 TODO 判断请求类型
    get(this.reqData.url, { params: params }).then(
      data => (this.response = data)
    );
  }
}
</script>

<style></style>
