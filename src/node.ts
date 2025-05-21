import type { KComponent } from "./component.interface";

export type KNode = HTMLElement;

type KeyOfTagNamesMap = keyof HTMLElementTagNameMap;

export class KVirtualNode {
  children: KVirtualNode[] = [];

  appendChild(node: KVirtualNode) {
    this.children.push(node);
    return this;
  }

  isTagged(): this is KVirtualNodeTagged<any> {
    if (this instanceof KVirtualNodeTagged) {
      return true;
    }
    return false;
  }

  isComponent(): this is KVirtualNodeComponent {
    if (this instanceof KVirtualNodeComponent) {
      return true;
    }
    return false;
  }

  traverse(): KVirtualNodeTagged<any> {
    if (this.isTagged()) {
      return this;
    }

    if (this.isComponent()) {
      const resolved = this.resolver();
      return resolved.traverse();
    }

    throw new Error("Unhandled instance of KVirtualNode");
  }
}

export class KVirtualNodeComponent extends KVirtualNode {
  children: KVirtualNode[];
  resolver: () => KVirtualNode;

  private constructor(resolver: () => KVirtualNode) {
    super();
    this.children = [];
    this.resolver = resolver;
  }

  static create<P, C extends KComponent<P>>(component: C, props: P) {
    return new KVirtualNodeComponent(() => component(props));
  }

  appendChild(node: KVirtualNode) {
    this.children.push(node);
    return this;
  }
}

export class KVirtualNodeTagged<
  K extends KeyOfTagNamesMap,
> extends KVirtualNode {
  tag: K;
  element: HTMLElement;

  private constructor(tag: K) {
    super();
    this.tag = tag;
    this.element = document.createElement(tag);
    this.children = [];
  }

  static create<K extends KeyOfTagNamesMap>(tag: K) {
    return new KVirtualNodeTagged(tag);
  }

  innerHTML(html: string) {
    this.element.innerHTML = html;
    return this;
  }

  addEventListener(
    ...args: Parameters<HTMLElementTagNameMap[K]["addEventListener"]>
  ) {
    this.element.addEventListener(args[0], args[1], args[2]);
    return this;
  }

  attributes(attributes: Record<string, any>) {
    for (const key in attributes) {
      this.element.setAttribute(key, attributes[key]);
    }
    return this;
  }

  appendChild(node: KVirtualNode) {
    this.children.push(node);
    return this;
  }
}
