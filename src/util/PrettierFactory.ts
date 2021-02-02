import { json, xml } from "vkbeautify";
import { isHTML, isJSON, isXML } from "@/util/TextUtil";

export interface Prettier {
  type: string;
  value: string;
  pretty(): string;
}

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

export class HTMLPrettier implements Prettier {
  type = "html";

  value!: string;

  constructor(value: string) {
    this.value = value;
  }

  pretty(): string {
    return xml(this.value, 4);
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
