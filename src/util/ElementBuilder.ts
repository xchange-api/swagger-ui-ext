class ElementWrapper<K extends keyof HTMLElementTagNameMap> {
  element!: HTMLElementTagNameMap[K];

  type(tagName: K) {
    this.element = document.createElement(tagName);
    return this;
  }

  build(): HTMLElementTagNameMap[K] {
    return this.element;
  }

  height(height: string): ElementWrapper<K> {
    this.element.style.height = height;
    return this;
  }

  width(width: string): ElementWrapper<K> {
    this.element.style.width = width;
    return this;
  }

  src(src: string): ElementWrapper<K> {
    this.element.setAttribute("src", src);
    return this;
  }

  controls(controls: string): ElementWrapper<K> {
    this.element.setAttribute("controls", controls);
    return this;
  }
}

export class ElementBuilder<K extends keyof HTMLElementTagNameMap> {
  static builder() {
    return new ElementWrapper();
  }
}
