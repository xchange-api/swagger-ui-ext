import * as monaco from "monaco-editor";
import { IRange } from "monaco-editor";

const header = [
  "Authorization",
  "Proxy-Authorization",
  "Cache-Control",
  "Pragma",
  "Warning",
  "If-Match",
  "If-None-Match",
  "If-Modified-Since",
  "If-Unmodified-Since",
  "Accept",
  "Accept-Language",
  "Content-Disposition",
  "Content-Type",
  "Content-Encoding",
  "Content-Language",
  "Content-Location",
  "Forwarded",
  "From",
  "Referrer-Policy",
  "User-Agent",
  "Range",
  "If-Range"
];

/**
 * 为header编辑器创建提示
 *
 * @param range
 */
export function createSuggestions(range: IRange): monaco.languages.CompletionItem[] {
  return header.map(value => createItem(value, range, value + ":"));
}

function createItem(label: string, range: IRange, insertText?: string): monaco.languages.CompletionItem {
  return {
    label: label,
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: insertText || label,
    range: range
  };
}
