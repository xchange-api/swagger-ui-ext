import { isBlank, isJSON } from "@/util/Util";
import { JSONPrettier } from "@/util/PrettierFactory";
import URI from "urijs";

/**
 * api文档解析的信息, 请求的信息
 */
export class RequestData {
  id!: number;

  /**
   * 请求类型GET POST...
   */
  type: string;

  /**
   * 协议+主机地址+端口
   */
  host?: string;

  /**
   * 路径/后的内容
   */
  url: string;

  /**
   * 解析swagger的api-doc后的信息
   *
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
   */
  parameters: Array<Parameter>;

  /**
   * 解析swagger的api-doc后的信息
   *
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
   */
  definitions!: any;

  consumes!: Array<string>;

  produces!: Array<string>;

  header!: string;

  raw!: any;

  binary!: File;

  timestamp!: number;

  /**
   * 新建的窗口可以任意编辑
   * 从api列表打开的则不能任意编辑，例如url和请求方法
   */
  editable?: boolean;

  first = true;

  static DEFAULT() {
    return new RequestData("get", "", [], {});
  }

  constructor(type: string, url: string, parameters: Array<Parameter>, definitions: any, host?: string) {
    this.type = type;
    this.url = url;
    this.parameters = parameters;
    this.definitions = definitions;
    this.host = host;
    this.editable = isBlank(url);
    this.init();
  }

  private init() {
    this.parameters = this.parameters || [];
    for (const parameter of this.parameters) {
      parameter.value = parameter.value || undefined;
      if (parameter.in !== InType.FORM_DATA) {
        continue;
      }
      Object.defineProperties(parameter, {
        fileType: {
          get(): string {
            // 文件上传类型
            return this.items?.type === "file" ? FileType.FILES : this.type === "file" ? FileType.FILE : FileType.NONE;
          }
        }
      });
    }
  }

  get query(): string {
    if (this.first && this.url) {
      // 第一次则拼接params
      this.first = false;
      const params = this.params(InType.QUERY);
      this.url += buildQuery(params);
    }

    return this.url;
  }

  /**
   * 如果是api列表打开只允许编辑参数
   *
   * @param val
   */
  set query(val: string) {
    const newUrlParts = URI.parse(val);
    const oldUrlParts = URI.parse(this.url);

    if (this.editable) {
      if (newUrlParts.protocol) {
        this.host = newUrlParts.protocol + "://";
      }
      if (newUrlParts.hostname) {
        this.host += newUrlParts.hostname;
      }
      if (newUrlParts.port) {
        this.host += `:${newUrlParts.port}`;
      }
    }

    if (this.editable || newUrlParts.path === oldUrlParts.path) {
      this.url = val;
    }

    const indexOf = val.indexOf("?");
    if (indexOf > 0) {
      const query = parseQuery(val.substring(indexOf));
      // 设置value
      for (const param of this.params(InType.QUERY)) {
        if (query[param.name]) {
          param.value = query[param.name];
        }
      }
    }
  }

  get bodyStr() {
    if (!this.containBody()) {
      return "";
    }
    if (!this.raw) {
      this.raw = this.bodyExample();
    }
    return new JSONPrettier(JSON.stringify(this.raw)).pretty();
  }

  set bodyStr(value: string) {
    const json = isJSON(value);
    if (json) {
      this.raw = json;
    }
  }

  public supportBody(): boolean {
    return !["get", "head"].includes(this.type);
  }

  public containBody(): boolean {
    return this.params(InType.BODY).length > 0;
  }

  public containForm(): boolean {
    return this.params(InType.FORM_DATA).length > 0;
  }

  public params(...inTypes: InType[]): Array<Parameter> {
    return this.parameters?.filter(param => (inTypes || []).includes(param.in)) || [];
  }

  /**
   * hashId避免添加相同的历史记录
   * 同一天同样的请求不做记录
   */
  public hashId() {
    const date = new Date();
    this.timestamp = date.getTime();
    const str = this.type + this.fullURL() + this.header + this.bodyStr + date.toLocaleDateString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    this.id = hash;
    return this.id;
  }

  public fullURL(): string {
    return (this.host || "") + this.url;
  }

  /**
   * 生成requestBody样例
   *
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
   */
  public bodyExample() {
    let bodyExample;
    for (const parameter of this.parameters) {
      if (parameter.in !== "body") {
        continue;
      }
      bodyExample = this.bodyJSONExample(parameter.schema);
    }
    return bodyExample;
  }

  public includes(value: string): boolean {
    return (this.url + "\n" + JSON.stringify(this.parameters) + "\n" + JSON.stringify(this.raw) + "\n" + this.header)
      .toLowerCase()
      .includes(value.toLowerCase());
  }

  /**
   * 检查参数
   */
  public checkParam(): string {
    let msg = "";
    const blankParams: string[] = [];
    for (const param of this.params(InType.QUERY)) {
      if (param.required && (!param.value || (typeof param.value === "string" && isBlank(param.value)))) {
        // msg += param.name + " is required\r\n";
        blankParams.push(param.name);
      }
    }
    if (blankParams.length > 0) {
      msg = "参数: " + blankParams.join(", ") + "不能为空";
    }
    return msg;
  }

  /**
   * path
   */
  public path(): string {
    const indexOf = this.url.indexOf("?");
    return indexOf > 0 ? this.url.substring(0, indexOf) : this.url;
  }

  /**
   * 生成schema样例
   *
   * @param schema
   */
  private bodyJSONExample(schema: Schema) {
    const type: string = schema.type;
    const format = schema.format;
    const properties = schema.properties;
    let isArray = false;
    let str: any;

    if (type === "integer") {
      str = 0;
    } else if (type === "string") {
      if (format === "date-time") {
        str = new Date().toISOString();
      } else if (format === "date") {
        str = new Date().toISOString().split("T")[0];
      } else {
        str = "";
      }
    } else if (type === "number") {
      str = 0.0;
    } else if (type === "boolean") {
      str = false;
    } else if (type === "file") {
      str = "file";
    } else if (type === "array") {
      isArray = true;
      if (schema.items) {
        str = this.bodyJSONExample(schema.items);
      }
    } else if (type === "object") {
      str = {};
      if (properties) {
        for (const property in properties) {
          str[property] = this.bodyJSONExample(properties[property]);
        }
      }
    }

    if (schema.$ref) {
      str = this.refExample(schema.$ref);
    }

    if (isArray) {
      return [str];
    } else {
      return str;
    }
  }

  private refExample(ref: string) {
    const refName = ref.replace("#/definitions/", "");
    return this.bodyJSONExample(this.definitions[refName]);
  }
}

interface Schema {
  type: string;
  format: string;
  $ref: string;
  properties: { [key: string]: Schema };
  items: Schema;
}

export interface Parameter {
  name: string;
  value: any;
  in: InType.BODY | InType.QUERY | InType.FORM_DATA | InType.PATH;
  description: string;
  required: boolean;
  schema: Schema;
  type: string;
  items: Schema;
}

export enum InType {
  BODY = "body",
  QUERY = "query",
  FORM_DATA = "formData",
  PATH = "path"
}

export enum FileType {
  NONE = "none",
  FILE = "file",
  FILES = "files"
}

/**
 * INPUT ?name1=value1&name2=value2&name2=value3&name3=&name4
 * OUTPUT { name1: "value1", name2: ["value2","value3"], name3: "", name4: null }
 *
 * @param queryString
 */
function parseQuery(queryString: string): { [key: string]: any } {
  return URI.parseQuery(queryString);
}

/**
 * INPUT [{name: "name1", value: "value1"}, {name: "name2", value: ["value2","value3"]}, {name: "name3",value:""}]
 * OUTPUT ?name1=value1&name2=value2&name2=value3&name3=
 *
 * @param params
 */
function buildQuery(params: Parameter[]): string {
  if (params.length < 1) {
    return "";
  }

  const queryObj: { [key: string]: any } = {};
  params.forEach(param => {
    queryObj[param.name] = param.value || "";
  });

  return "?" + URI.buildQuery(queryObj);
}
