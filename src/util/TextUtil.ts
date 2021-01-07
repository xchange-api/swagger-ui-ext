export function isJson(data: string) {
  try {
    return JSON.parse(data);
  } catch (ex) {
    return false;
  }
}

export function isXml(data: string) {
  return data.startsWith('<?xml version="1.0"');
}

export function isHtml(data: string) {
  return /^<!DOCTYPE html|HTML/.test(data);
}

export function formatJson(data: object) {
  return JSON.stringify(data, null, "\t");
}
