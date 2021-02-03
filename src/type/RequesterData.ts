import { isJSON } from "@/util/TextUtil";
import { JSONPrettier } from "@/util/PrettierFactory";

export class RequesterData {
  id!: number;

  type: string;

  host: string | undefined;

  url: string;

  parameters: Array<Parameter>;

  definitions!: any;

  consumes!: Array<string>;

  produces!: Array<string>;

  header!: string;

  body!: any;

  timestamp!: number;

  static DEFAULT() {
    return new RequesterData("get", "", [], {});
  }

  constructor(type: string, url: string, parameters: Array<Parameter>, definitions: any, host?: string) {
    this.type = type;
    this.url = url;
    this.parameters = parameters;
    this.definitions = definitions;
    this.host = host;
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
    const params = this.params(InType.QUERY);
    if (params.length < 1) {
      return this.url;
    }
    let query = "?";
    params.forEach((param, index) => {
      query += param.name + "=";
      if (param.value) {
        query += param.value;
      }
      if (index < params.length - 1) {
        query += "&";
      }
    });

    return this.url + query;
  }

  set query(val: string) {
    const indexOf = val.indexOf("?");
    if (indexOf < 0) {
      return;
    }
    const query: any = {};
    val
      .substring(indexOf + 1)
      .split("&")
      .forEach(value => {
        const kv = value.split("=");
        query[kv[0]] = kv[1];
      });
    for (const param of this.params(InType.QUERY)) {
      param.value = query[param.name];
    }
  }

  get bodyStr() {
    if (!this.containBody()) {
      return "";
    }
    this.body = this.bodyExample();
    return new JSONPrettier(JSON.stringify(this.bodyExample())).pretty();
  }

  set bodyStr(value: string) {
    const json = isJSON(value);
    if (json) {
      this.body = json;
    }
  }

  public supportBody(): boolean {
    return !["get", "head"].includes(this.type);
  }

  public containBody(): boolean {
    return this.params(InType.BODY).length > 0;
  }

  public params(...inTypes: InType[]): Array<Parameter> {
    return this.parameters?.filter(param => (inTypes || []).includes(param.in)) || [];
  }

  /**
   * hashId避免添加相同的历史记录
   */
  public hashId() {
    this.timestamp = new Date().getTime();
    const str = this.url + this.type + JSON.stringify(this.parameters) + JSON.stringify(this.body) + this.header;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    this.id = hash;
    return this.id;
  }

  public fullURL(): string {
    return (this.host || "") + this.query;
  }

  /**
   * 生成requestBody样例
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

  /**
   * 生成schema样例
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
