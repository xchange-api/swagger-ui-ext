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
    parameters: Array<any>;

    definitions!: any;

    constructor(
        type: string,
        url: string,
        parameters: Array<any>,
        definitions: any
    ) {
        this.type = type;
        this.url = url;
        this.parameters = parameters;
        this.definitions = definitions;
    }
    get query(): string {
        const params = this.params;
        if (!params || params.length < 1) {
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

    get supportBody() {
        return !["get", "head"].includes(this.type);
    }

    get params() {
        return this.parameters.filter(param => param.in === "query");
    }

    public body() {
        let bodyExample;
        for (const parameter of this.parameters) {
            if (parameter.in !== "body") {
                continue;
            }
            bodyExample = this.bodyExample(parameter.schema);
        }
        return bodyExample;
    }

    private bodyExample(schema: any) {
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
                str = this.bodyExample(schema.items);
            }
        } else if (type === "object") {
            str = {};
            if (properties) {
                for (const property in properties) {
                    str[property] = this.bodyExample(properties[property]);
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
        return this.bodyExample(this.definitions[refName]);
    }
}
