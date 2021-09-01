import axios, { AxiosRequestConfig, Method, AxiosResponse } from "axios";
import { InType, Parameter, RequestData } from "@/type/RequestData";
import r2curl from "r2curl";
import { isBlank } from "@/util/Util";
import URI from "urijs";

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

function disableCache(headers: { [key: string]: string }) {
  const headerKeys = Object.keys(headers);
  let containCacheControl = false;
  for (const headerKey of headerKeys) {
    if ("cache-control" === headerKey.toLowerCase()) {
      containCacheControl = true;
      break;
    }
  }

  if (!containCacheControl) {
    headers["Cache-Control"] = "no-cache";
  }
}

function buildRequestConfig(reqData: RequestData, dataType?: string): AxiosRequestConfig {
  // 构建请求头
  const headers = buildHeader(reqData.header);

  // 默认禁用缓存
  disableCache(headers);

  // 请求地址处理
  let reqUrl;
  const host = window.location.host;
  const parts = URI.parse(reqData.url);
  const reqHost = parts.hostname + (parts.port ? `:${parts.port}` : "");
  if (!parts.hostname) {
    reqUrl = reqData.url;
  } else if (host !== reqHost) {
    headers["api-target"] = reqData.url;
    if (!parts.path) {
      console.error(`error url: ${reqData.url}`);
      return {};
    }
    reqUrl = "/proxy";
  }

  // 请求体
  let data = undefined;
  if (dataType === "form") {
    data = buildFormData(reqData.params(InType.FORM_DATA));
  } else if (dataType === "raw") {
    data = reqData.raw;
  } else if (dataType === "binary") {
    data = reqData.binary;
  }

  return {
    url: reqUrl,
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
