export class ResponseData {
  data: any;
  status: number;
  statusText: string;
  headers: any;

  static DEFAULT() {
    return new ResponseData("", 200, "ok", "");
  }

  constructor(data: any, status: number, statusText: string, headers: any) {
    this.data = data;
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
  }
}
