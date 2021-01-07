<template>
  <div>
    <el-tree
      :data="apiThree"
      @node-click="clickNode"
      @node-contextmenu="menu"
    ></el-tree>
    <div
      id="perTreeMenu"
      v-if="tmDisplay"
      class="tree_menu"
      :style="{ ...rightMenu }"
    >
      <ul>
        <li><i class="el-icon-tickets"></i> 详情</li>
        <li><i class="el-icon-edit"></i> 编辑</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { get } from "@/util/Http";
import Bus from "@/util/Bus";
import { BusEvent } from "@/type/BusEvent";
import { RequesterData } from "@/type/RequesterData";

@Component({
  components: {}
})
export default class ApiCollection extends Vue {
  private apiDoc!: any;
  private apiThree: Array<any> = [];
  private rightMenu = { top: "0px", left: "0px" };
  private tmDisplay = false;

  created() {
    this.initApiDoc();
  }

  mounted() {
    const that = this;
    document.onclick = function(event) {
      if (event.target !== document.getElementById("perTreeMenu")) {
        that.tmDisplay = false;
      }
    };
  }

  private initApiDoc() {
    get("/swagger-resources", {})
      .then((res: any) => {
        return res[0].location; // api doc url
      })
      .then((url: string) => {
        return get(url, {});
      })
      .then(res => {
        this.apiDoc = res;
        this.apiDoc2Three();
      })
      .catch(e => console.error(e));
  }

  private apiDoc2Three() {
    // const json = JSON.parse(
    //   '{"swagger":"2.0","info":{"description":"renren-fast文档","version":"3.0.0","title":"人人开源","termsOfService":"https://www.renren.io"},"host":"localhost:8080","basePath":"/renren-fast","tags":[{"name":"app-test-controller","description":"App Test Controller"},{"name":"app-login-controller","description":"App Login Controller"},{"name":"app-register-controller","description":"App Register Controller"}],"paths":{"/app/login":{"post":{"tags":["app-login-controller"],"summary":"登录","operationId":"loginUsingPOST","consumes":["application/json"],"produces":["*/*"],"parameters":[{"in":"body","name":"form","description":"form","required":true,"schema":{"$ref":"#/definitions/登录表单"}}],"responses":{"200":{"description":"OK","schema":{"type":"object","additionalProperties":{"type":"object"}}},"201":{"description":"Created"},"401":{"description":"Unauthorized"},"403":{"description":"Forbidden"},"404":{"description":"Not Found"}}}},"/app/notToken":{"get":{"tags":["app-test-controller"],"summary":"忽略Token验证测试","operationId":"notTokenUsingGET","consumes":["application/json"],"produces":["*/*"],"responses":{"200":{"description":"OK","schema":{"type":"object","additionalProperties":{"type":"object"}}},"401":{"description":"Unauthorized"},"403":{"description":"Forbidden"},"404":{"description":"Not Found"}}}},"/app/register":{"post":{"tags":["app-register-controller"],"summary":"注册","operationId":"registerUsingPOST","consumes":["application/json"],"produces":["*/*"],"parameters":[{"in":"body","name":"form","description":"form","required":true,"schema":{"$ref":"#/definitions/注册表单"}}],"responses":{"200":{"description":"OK","schema":{"type":"object","additionalProperties":{"type":"object"}}},"201":{"description":"Created"},"401":{"description":"Unauthorized"},"403":{"description":"Forbidden"},"404":{"description":"Not Found"}}}},"/app/userId":{"get":{"tags":["app-test-controller"],"summary":"获取用户ID","operationId":"userInfoUsingGET","consumes":["application/json"],"produces":["*/*"],"parameters":[{"in":"body","name":"userId","description":"userId","required":false,"schema":{"type":"integer","format":"int32"}}],"responses":{"200":{"description":"OK","schema":{"type":"object","additionalProperties":{"type":"object"}}},"401":{"description":"Unauthorized"},"403":{"description":"Forbidden"},"404":{"description":"Not Found"}}}},"/app/userInfo":{"get":{"tags":["app-test-controller"],"summary":"获取用户信息","operationId":"userInfoUsingGET_1","consumes":["application/json"],"produces":["*/*"],"parameters":[{"name":"userId","in":"query","required":false,"type":"integer","format":"int64"},{"name":"username","in":"query","required":false,"type":"string"},{"name":"mobile","in":"query","required":false,"type":"string"},{"name":"password","in":"query","required":false,"type":"string"},{"name":"createTime","in":"query","required":false,"type":"string","format":"date-time"}],"responses":{"200":{"description":"OK","schema":{"type":"object","additionalProperties":{"type":"object"}}},"401":{"description":"Unauthorized"},"403":{"description":"Forbidden"},"404":{"description":"Not Found"}}}}},"securityDefinitions":{"token":{"type":"apiKey","name":"token","in":"header"}},"definitions":{"注册表单":{"type":"object","properties":{"mobile":{"type":"string","description":"手机号"},"password":{"type":"string","description":"密码"}}},"登录表单":{"type":"object","properties":{"mobile":{"type":"string","description":"手机号"},"password":{"type":"string","description":"密码"}}}}}'
    // );
    // this.apiDoc = json;
    const three = [];
    const tags = this.apiDoc.tags;
    for (const tag of tags) {
      const children = this.getChildrenThree(tag.name);
      three.push({ label: tag.name, children: children });
    }
    this.apiThree = three;
  }

  private getChildrenThree(tagName: string) {
    const children = [];
    const paths = this.apiDoc.paths;
    for (const reqUrl in paths) {
      for (const reqType in paths[reqUrl]) {
        const reqInfo = paths[reqUrl][reqType];
        if (reqInfo.tags.includes(tagName)) {
          children.push({
            label: reqUrl,
            reqData: new RequesterData(
              reqType,
              reqUrl,
              reqInfo.parameters,
              this.apiDoc.definitions
            )
          });
        }
      }
    }
    return children;
  }

  private clickNode(data: any, node: any) {
    if (node.level === 2) {
      Bus.$emit(BusEvent.SELECT_API, data.reqData);
    }
  }

  private menu(e: MouseEvent, data: any, node: any) {
    if (node.level === 2) {
      this.rightMenu = { top: e.pageY + "px", left: e.pageX + "px" };
      this.tmDisplay = true;
    }
  }
}
</script>

<style lang="scss" scoped>
.tree_menu {
  position: fixed;
  display: block;
  z-index: 20000;
  background-color: #fff;
  padding: 5px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  ul {
    margin: 0;
    padding: 0;
  }
  ul li {
    list-style: none;
    margin: 0;
    padding: 0 15px;
    font-size: 14px;
    line-height: 30px;
    cursor: pointer;
  }
  ul li:hover {
    background-color: #ebeef5;
  }
}
</style>
