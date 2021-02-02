export function isJSON(data: string) {
  try {
    return JSON.parse(data);
  } catch (ex) {
    return false;
  }
}

export function isXML(data: string) {
  return data.startsWith('<?xml version="1.0"');
}

export function isHTML(data: string) {
  return /^<!DOCTYPE html|HTML/.test(data);
}
