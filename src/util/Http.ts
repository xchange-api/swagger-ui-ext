import axios, { AxiosRequestConfig, Method, AxiosResponse } from "axios";
import { InType, Parameter, RequestData } from "@/type/RequestData";
import r2curl from "r2curl";
import { isBlank } from "@/util/Util";

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

function buildRequestConfig(reqData: RequestData, dataType?: string): AxiosRequestConfig {
  const headers = buildHeader(reqData.header);
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
    headers: headers,
    data: data,
    responseType: "arraybuffer"
  };
}

export function buildCURL(reqData: RequestData): string {
  return r2curl({
    url: reqData.fullURL(),
    method: reqData.type as Method,
    headers: buildHeader(reqData.header),
    data: buildFormData(reqData.params(InType.FORM_DATA)) || reqData.raw
  });
}

export function request(reqData: RequestData, dataType?: string): Promise<AxiosResponse> {
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
 *
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
  return formData.values().next().value ? formData : undefined;
}

/**
 * 构建请求头
 *
 * @param value
 */
export function buildHeader(value: string): { [key: string]: string } {
  const header: { [key: string]: string } = {};
  if (isBlank(value)) {
    return header;
  }

  const lines = value.split("\r\n");
  for (const line of lines) {
    const indexOf = line.indexOf(":");
    if (indexOf < 1) {
      continue;
    }
    const key = line.substring(0, indexOf);
    header[key] = line.substring(indexOf + 1);
  }
  return header;
}
