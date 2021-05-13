import { json, xml } from "vkbeautify";
import { html } from "js-beautify";
import { isHTML, isJSON, isXML } from "@/util/Util";

/**
 * 格式化接口
 */
export interface Prettier {
  type: string;
  value: string;
  pretty(): string;
}

/**
 * json格式化
 */
export class JSONPrettier implements Prettier {
  type = "json";

  value!: string;

  constructor(value: string) {
    this.value = value;
  }

  pretty(): string {
    return json(this.value, 4);
  }
}

/**
 * xml格式化
 */
export class XMLPrettier implements Prettier {
  type = "xml";

  value!: string;

  constructor(value: string) {
    this.value = value;
  }

  pretty(): string {
    return xml(this.value);
  }
}

/**
 * html格式化
 */
export class HTMLPrettier implements Prettier {
  type = "html";

  value!: string;

  constructor(value: string) {
    this.value = value;
  }

  pretty(): string {
    return html(this.value);
  }
}

class DefaultPrettier implements Prettier {
  type = "plaintext";

  value!: string;

  constructor(value: string) {
    this.value = value;
  }

  pretty(): string {
    return this.value;
  }
}

/**
 * 格式化工厂类
 */
export class PrettierFactory {
  public static getPrettier(value: string, contentType?: string): Prettier {
    if (contentType?.includes("application/json") || isJSON(value)) {
      return new JSONPrettier(value);
    } else if (contentType?.includes("application/xml") || contentType?.includes("text/xml") || isXML(value)) {
      return new XMLPrettier(value);
    } else if (contentType?.includes("text/html") || isHTML(value)) {
      return new HTMLPrettier(value);
    } else {
      return new DefaultPrettier(value);
    }
  }
}
