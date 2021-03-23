<template>
  <!--阻止oncontextmenu事件冒泡到tabs组件-->
  <div @contextmenu.stop>
    <div style="display: flex;">
      <!--请求url start-->
      <el-input placeholder="enter request url" v-model="reqData.query">
        <template slot="prepend">{{ reqData.type }}</template>
      </el-input>
      <!--请求url end-->
      <el-button @click="clickSend" type="primary">send</el-button>
    </div>
    <div>
      <el-tabs v-model="activeTabName">
        <!--授权 start-->
        <el-tab-pane label="Authorization" name="auth">
          <authorization />
        </el-tab-pane>
        <!--授权 end-->

        <!--请求头 start-->
        <el-tab-pane label="Header" name="header">
          <request-header :value.sync="reqData.header" class="header-editor" />
        </el-tab-pane>
        <!--请求头 start-->

        <!--请求体 end-->
        <el-tab-pane label="Body" name="body" :disabled="!reqData.supportBody()">
          <el-tabs v-model="reqBodyActiveTabName" type="border-card">
            <!--表单 start-->
            <el-tab-pane label="Form" name="form">
              <div class="request-body">
                <el-checkbox v-model="urlencoded" @change="urlencodedChange()">x-www-form-urlencoded</el-checkbox>
                <el-table :data="reqData.params('formData')" style="width: 100%">
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
              </div>
            </el-tab-pane>
            <!--表单 end-->

            <!--raw start-->
            <el-tab-pane label="Raw" name="raw">
              <editor :value.sync="reqData.bodyStr" :language="language" class="request-body"></editor>
            </el-tab-pane>
            <!--raw end-->

            <!--二进制 start-->
            <el-tab-pane label="Binary" name="binary">
              <div class="request-body">
                <input type="file" @change="selectBinaryFile($event)" />
              </div>
            </el-tab-pane>
            <!--二进制 end-->

            <!--content-type start-->
            <el-tab-pane :disabled="true" v-if="reqBodyActiveTabName === 'raw'">
              <el-dropdown slot="label">
                <span class="el-dropdown-link">{{ contentType }}<i class="el-icon-arrow-down"/></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in contentTypes"
                    :key="item.label"
                    @click.prevent.native="changeContentType(item)"
                  >
                    {{ item.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-tab-pane>
            <!--content-type end-->
          </el-tabs>
        </el-tab-pane>
        <!--请求体 end-->

        <!--响应 start-->
        <el-tab-pane label="Response" name="response" :disabled="!response">
          <response :response="response" :headers="respHeaders"></response>
        </el-tab-pane>
        <!--响应 end-->
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Parameter, RequestData } from "@/type/RequestData";
import Response from "@/views/Response.vue";
import Editor from "@/components/Editor.vue";
import Authorization from "@/views/Authorization.vue";
import { buildHeader, request } from "@/util/Http";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import RequestHeader from "@/views/RequestHeader.vue";

@Component({
  components: { RequestHeader, Response, Editor, Authorization }
})
export default class Request extends Vue {
  @Prop()
  private reqData!: RequestData;

  private activeTabName = "header";

  private reqBodyActiveTabName = "form";

  private language = "json";

  private response: any = "";

  private respHeaders: any = "";

  private urlencoded = false;

  private contentType = "application/json";

  private contentTypes = [
    { value: "json", label: "application/json" },
    { value: "xml", label: "application/xml" },
    { value: "xml", label: "text/xml" },
    { value: "plaintext", label: "text/plain" }
  ];

  private clickSend() {
    request(this.reqData, this.reqBodyActiveTabName)
      .then(res => {
        this.respHeaders = res.headers;
        this.response = res.data;
        this.activeTabName = "response";
        this.reqData.hashId();
        this.addHistory();
      })
      .catch(err => {
        this.response = err.response.data;
        this.respHeaders = err.response.headers;
        this.activeTabName = "response";
      });
  }

  private addHistory() {
    Bus.$emit(BusEvent.ADD_HISTORY, this.reqData);
  }

  private selectFile(param: Parameter, event: any) {
    param.value = event.target.files;
  }

  private selectBinaryFile(event: any) {
    this.reqData.binary = event.target.files[0];
  }

  /**
   * 表单使用x-www-form-urlencoded, 设置请求头
   */
  private urlencodedChange() {
    this.reqData.header = this.reqData.header || "";
    const headerMap = new Map<string, string>(Object.entries(buildHeader(this.reqData.header)));
    if (this.urlencoded) {
      headerMap.set("Content-Type", "application/x-www-form-urlencoded");
    } else {
      headerMap.delete("Content-Type");
    }
    this.reqData.header = Array.from(headerMap.entries(), ([k, v]) => `${k}:${v}`).join("\r\n");
  }

  private changeContentType(type: any) {
    this.contentType = type.label;
    this.language = type.value;
  }
}
</script>

<style lang="scss" scoped>
/**请求头编辑器placeholder*/
.placeholder {
  position: absolute;
  left: 64px;
  top: 0;
  z-index: 1;
  font-size: 14px;
  color: #b7b7b7;
}

.header-editor {
  height: calc(100vh - 246px);
}
.request-body {
  height: calc(100vh - 317px);
}
</style>
