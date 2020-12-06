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
  params: Array<any>;

  definitions!: any;

  constructor(type: string, url: string, params: Array<any>, definitions: any) {
    this.type = type;
    this.url = url;
    this.params = params;
    this.definitions = definitions;
  }

  get formatUrl(): string {
    if (this.params) {
      let params = "?";
      this.params.forEach((param, index) => {
        params += param.name + "=";
        if (param.value) {
          params += param.value;
        }
        if (index < this.params.length - 1) {
          params += "&";
        }
      });

      return this.url + params;
    }

    return this.url;
  }
}
