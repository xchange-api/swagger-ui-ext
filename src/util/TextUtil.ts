/**
 * 判断文本是否为json
 * @param data
 */
export function isJSON(data: string) {
  try {
    return JSON.parse(data);
  } catch (ex) {
    return false;
  }
}

/**
 * 判断文本是否为xml
 * @param data
 */
export function isXML(data: string) {
  return data.startsWith('<?xml version="1.0"');
}

/**
 * 判断文本是否为html
 * @param data
 */
export function isHTML(data: string) {
  return /^<!DOCTYPE html|HTML/.test(data);
}

export function isBlank(data: string | undefined) {
  return !data || data === "" || data.trim() === "";
}
