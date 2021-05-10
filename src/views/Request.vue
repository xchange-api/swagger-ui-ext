<template>
  <!--阻止oncontextmenu事件冒泡到tabs组件-->
  <div @contextmenu.stop>
    <div style="display: flex;">
      <!--请求方法 start-->
      <el-select v-model="reqData.type" :disabled="!reqData.editable" class="request-method">
        <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <!--请求方法 end-->

      <!--请求url start-->
      <el-input
        placeholder="enter request url"
        v-model="reqData.query"
        :disabled="loading"
        @keyup.enter.native="clickSend"
      />
      <!--请求url end-->

      <el-button @click="clickSend" type="primary" :disabled="loading">send</el-button>
    </div>
    <div>
      <el-tabs v-model="activeTabName" v-loading="loading">
        <!--请求头 start-->
        <el-tab-pane label="Header" name="header">
          <div slot="label">
            Header
            <span class="tips">{{ this.headerLength() }}</span>
          </div>
          <request-header v-model="reqData.header" class="header-editor">
            <template v-slot:placeholder>
              <span>
                // Example<br />
                Accept: application/json, text/plain, */*<br />
                Accept-Language: zh-CN,zh;q=0.9
              </span>
            </template>
          </request-header>
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
        <el-tab-pane label="Response" name="response" :disabled="!respData.data">
          <response :resp-data="respData"></response>
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
import { buildHeader, request } from "@/util/Http";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import RequestHeader from "@/views/RequestHeader.vue";
import { isBlank } from "@/util/TextUtil";
import { ResponseData } from "@/type/ResponseData";

@Component({
  components: { RequestHeader, Response, Editor }
})
export default class Request extends Vue {
  @Prop()
  private reqData!: RequestData;

  private activeTabName = "header";

  private reqBodyActiveTabName = "form";

  private language = "json";

  private respData = ResponseData.DEFAULT();

  private urlencoded = false;

  private contentType = "application/json";

  private contentTypes: OptionData[] = [
    { value: "json", label: "application/json" },
    { value: "xml", label: "application/xml" },
    { value: "xml", label: "text/xml" },
    { value: "plaintext", label: "text/plain" }
  ];

  private loading = false;

  private methodOptions: OptionData[] = [
    { value: "get", label: "GET" },
    { value: "post", label: "POST" },
    { value: "put", label: "PUT" },
    { value: "delete", label: "DELETE" },
    { value: "patch", label: "PATCH" },
    { value: "head", label: "HEAD" },
    { value: "options", label: "OPTIONS" }
  ];

  private clickSend() {
    const checkParam = this.reqData.checkParam();
    if (!isBlank(checkParam)) {
      this.$message.warning(checkParam);
      return;
    }

    if (isBlank(this.reqData.url)) {
      this.$message.warning("url不能为空");
      return;
    }

    this.loading = true;

    request(this.reqData, this.reqBodyActiveTabName)
      .then(res => {
        this.loading = false;
        this.respData = res;
        this.activeTabName = "response";
        this.reqData.hashId();
        this.addHistory();
      })
      .catch(err => {
        this.loading = false;
        if (err.response) {
          this.$message.error("http status: " + err.response.status);
          this.respData = err.response;
          this.activeTabName = "response";
          this.reqData.hashId();
          this.addHistory();
        } else if (err.request) {
          // The request was made but no response was received
          this.$message.error(err.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          this.$message.error(err.message);
        }
      });
  }

  private addHistory() {
    Bus.$emit(BusEvent.ADD_HISTORY, this.reqData);
  }

  /**
   * 表单文件 multipart/form-data
   */
  private selectFile(param: Parameter, event: any) {
    param.value = event.target.files;
    this.setRequestHeader("Content-Type", "multipart/form-data");
  }

  /**
   * 请求体使用application/octet-stream
   */
  private selectBinaryFile(event: any) {
    this.reqData.binary = event.target.files[0];
    this.setRequestHeader("Content-Type", "application/octet-stream");
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

  /**
   * 修改请求内容类型
   */
  private changeContentType(type: OptionData) {
    this.contentType = type.label;
    this.language = type.value;
    this.setRequestHeader("Content-Type", type.label);
  }

  /**
   * 设置http请求头
   *
   * @param name
   * @param value
   */
  private setRequestHeader(name: string, value: string) {
    this.reqData.header = this.reqData.header || "";
    const headerMap = new Map<string, string>(Object.entries(buildHeader(this.reqData.header)));
    headerMap.set(name, value);
    this.reqData.header = Array.from(headerMap.entries(), ([k, v]) => `${k}:${v}`).join("\r\n");
  }

  private headerLength(): string {
    if (!this.reqData.header) {
      return "";
    }
    const header = buildHeader(this.reqData.header);
    if (!header) {
      return "";
    }
    const length = Object.keys(header).length;
    return length > 0 ? `(${length})` : "";
  }
}
</script>

<style lang="scss" scoped>
.header-editor {
  height: calc(100vh - 246px);
}
.request-body {
  height: calc(100vh - 317px);
}
.request-method {
  width: 125px;
}
.tips {
  font-size: 10px;
}
</style>
