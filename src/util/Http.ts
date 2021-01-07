import axios, { AxiosRequestConfig, Method, AxiosResponse } from "axios";
import { RequesterData } from "@/type/RequesterData";

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
    params: reqData.params.reduce((pre: any, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {}),
    data: reqData.body,
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
