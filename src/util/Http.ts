import axios, { AxiosRequestConfig, Method, AxiosResponse } from "axios";
import { InType, RequesterData } from "@/type/RequesterData";

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

function toRequestConfig(reqData: RequesterData): AxiosRequestConfig {
  return {
    url: reqData.url,
    method: reqData.type as Method,
    params: reqData.params(InType.QUERY).reduce((pre: any, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {}),
    data: buildFormData(reqData) || reqData.body,
    responseType: "arraybuffer"
  };
}

export function request(reqData: RequesterData): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    axios
      .request(toRequestConfig(reqData))
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 生产formData, 上传文件
 * @param reqData
 */
function buildFormData(reqData: RequesterData): FormData | undefined {
  const formData = new FormData();
  const parameters = reqData.params(InType.FORM_DATA);
  for (const parameter of parameters) {
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
