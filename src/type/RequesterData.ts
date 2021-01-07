export class RequesterData {
  id!: number;

  type: string;

  url: string;

  /**
     * [{
                      "name": "userId",
                      "in": "query",
                      "required": false,
                      "type": "integer",
                      "format": "int64"
                  }, {
                      "name": "username",
                      "in": "query",
                      "required": false,
                      "type": "string"
                  }]
     */
  parameters: Array<Parameter>;

  definitions!: any;

  consumes!: Array<string>;

  produces!: Array<string>;

  body!: any;

  constructor(
    type: string,
    url: string,
    parameters: Array<Parameter>,
    definitions: any
  ) {
    this.type = type;
    this.url = url;
    this.parameters = parameters;
    this.definitions = definitions;
    this.init();
  }

  private init() {
    this.parameters = this.parameters || [];
    for (const parameter of this.parameters) {
      parameter.value = parameter.value || undefined;
    }
  }

  get query(): string {
    const params = this.params;
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
    for (const param of this.params) {
      param.value = query[param.name];
    }
  }

  get supportBody() {
    return !["get", "head"].includes(this.type);
  }

  get params(): Array<Parameter> {
    return this.parameters?.filter(param => param.in === "query") || [];
  }

  /**
   * 生产requestBody样例
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

interface Parameter {
  name: string;
  value: any;
  in: "body" | "query" | "formData" | "path";
  description: string;
  required: boolean;
  schema: Schema;
  type: string;
}
