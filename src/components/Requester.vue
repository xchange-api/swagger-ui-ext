<template>
  <div>
    <div style="display: flex;">
      <!--请求url start-->
      <el-input placeholder="enter request url" v-model="reqData.query">
        <template slot="prepend">{{ reqData.type }}</template>
      </el-input>
      <!--请求url end-->
      <el-button @click="clickSend">send</el-button>
    </div>
    <div>
      <el-tabs v-model="activeTabName">
        <!--表单 start-->
        <el-tab-pane label="Params" name="params">
          <el-table :data="reqData.params('query', 'formData')" style="width: 100%">
            <el-table-column prop="name" label="name" width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="value" width="180">
              <template slot-scope="scope">
                <!--文件选择或文本 start-->
                <input
                  v-if="scope.row.fileType === 'file' || scope.row.fileType === 'files'"
                  type="file"
                  :multiple="scope.row.fileType === 'files'"
                  @change="selectFile(scope.row, $event)"
                />
                <el-input v-else v-model="scope.row.value"></el-input>
                <!--文件选择或文本 end-->
              </template>
            </el-table-column>
            <el-table-column prop="type" label="description"></el-table-column>
          </el-table>
        </el-tab-pane>
        <!--表单 end-->
        <el-tab-pane label="Authorization" name="auth">
          <authorization />
        </el-tab-pane>
        <el-tab-pane label="Header" name="header"></el-tab-pane>
        <el-tab-pane label="Body" name="body">
          <editor :value.sync="reqData.bodyStr" :language="language"></editor>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!--http response-->
    <response :response="response" :headers="headers"></response>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Parameter, RequesterData } from "@/type/RequesterData";
import Response from "@/components/Response.vue";
import Editor from "@/components/Editor.vue";
import Authorization from "@/components/Authorization.vue";
import { request } from "@/util/Http";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";

@Component({
  components: { Response, Editor, Authorization }
})
export default class Requester extends Vue {
  @Prop()
  private reqData!: RequesterData;

  private response: any = "";

  private activeTabName = "params";

  private language = "json";

  private headers: any = "";

  private clickSend() {
    request(this.reqData).then(res => {
      this.headers = res.headers;
      this.response = res.data;
      this.addHistory();
    });
  }

  private addHistory() {
    Bus.$emit(BusEvent.ADD_HISTORY, this.reqData);
  }

  private selectFile(param: Parameter, event: any) {
    param.value = event.target.files;
  }
}
</script>

<style></style>
