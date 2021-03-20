import axios, { AxiosRequestConfig, Method, AxiosResponse } from "axios";
import { InType, Parameter, RequesterData } from "@/type/RequesterData";
import r2curl from "r2curl";

export function get(url: string, params: { [key: string]: any }) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, params)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err.data);
      });
  });
}

function buildRequestConfig(reqData: RequesterData, dataType?: string): AxiosRequestConfig {
  let data = undefined;
  if (dataType === "form") {
    data = buildFormData(reqData.params(InType.FORM_DATA));
  } else if (dataType === "raw") {
    data = reqData.raw;
  } else if (dataType === "binary") {
    data = reqData.binary;
  }

  return {
    url: reqData.url,
    method: reqData.type as Method,
    params: reqData.params(InType.QUERY).reduce((pre: any, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {}),
    headers: buildHeader(reqData.header),
    data: data,
    responseType: "arraybuffer"
  };
}

export function buildCURL(reqData: RequesterData): string {
  return r2curl({
    url: reqData.fullURL(),
    method: reqData.type as Method,
    headers: buildHeader(reqData.header),
    data: buildFormData(reqData.params(InType.FORM_DATA)) || reqData.raw
  });
}

export function request(reqData: RequesterData, dataType?: string): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    axios
      .request(buildRequestConfig(reqData, dataType))
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 构建表单
 * @param parameters
 */
function buildFormData(parameters: Parameter[]): FormData | undefined {
  const formData = new FormData();
  for (const parameter of parameters) {
    if (!parameter.value) {
      continue;
    }

    if (parameter.value.length) {
      for (let i = 0; i < parameter.value.length; i++) {
        formData.append(parameter.name, parameter.value[i]);
      }
    } else {
      formData.append(parameter.name, parameter.value);
    }
  }
  return parameters.length > 0 ? formData : undefined;
}

/**
 * 构建请求头
 * @param value
 */
export function buildHeader(value: string): any {
  const header: { [key: string]: string } = {};
  if (value && value.includes(":")) {
    const lines = value.split("\r\n");
    for (const line of lines) {
      const idx = line.indexOf(":");
      header[line.substring(0, idx).toLowerCase()] = line.substring(idx + 1, line.length);
    }
  }
  return header;
}
