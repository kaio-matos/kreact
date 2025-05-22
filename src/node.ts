import { GlobalApp } from "./app";
import type { KComponent } from "./component.interface";

export let CurrentResolvingComponent: KVirtualNodeComponent | null = null;

export type KNode = HTMLElement;

type KeyOfTagNamesMap = keyof HTMLElementTagNameMap;

export class KVirtualNode {
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

  resolve(force = false): KVirtualNodeTagged<any> {
    if (this.isTagged()) {
      return this;
    }

    if (this.isComponent()) {
      const resolved = this.resolver(force);
      return resolved.resolve(force);
    }

    throw new Error("Unhandled instance of KVirtualNode");
  }
}

export class KVirtualNodeComponent extends KVirtualNode {
  // debugging reasons
  readonly name: string;
  readonly component: KComponent;
  // ---
  private result: KVirtualNode | undefined;
  private _resolver: () => KVirtualNode;
  states: Array<[any, (state: any) => void]> = [];
  stateId = -1;
  isDirty = true;

  private constructor(resolver: () => KVirtualNode, component: KComponent) {
    super();
    this.name = component.name;
    this.component = component;
    this._resolver = resolver;
  }

  static create<P, C extends KComponent<P>>(component: C, props: P) {
    return new KVirtualNodeComponent(
      () => component(props),
      component as unknown as KComponent,
    );
  }

  resolver(force = false) {
    if (force) {
      CurrentResolvingComponent = this;
      this.result = this._resolver();
    } else if (!this.result) {
      CurrentResolvingComponent = this;
      this.result = this._resolver();
    } else if (this.isDirty) {
      CurrentResolvingComponent = this;
      this.result = this._resolver();
    }
    return this.result;
  }

  useState<S>(initial: S) {
    type Return = [S, typeof setState];

    if (this.states[this.stateId]) return this.states[this.stateId] as Return;

    this.stateId++;

    const setState = (state: S) => {
      this.isDirty = true;
      this.states[this.stateId][0] = state;
      GlobalApp?.render();
    };

    this.states[this.stateId] = [initial, setState];

    return this.states[this.stateId] as Return;
  }
}

export class KVirtualNodeTagged<
  K extends KeyOfTagNamesMap,
> extends KVirtualNode {
  children: KVirtualNode[] = [];
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

  appendChild(node: KVirtualNode) {
    this.children.push(node);
    return this;
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
}
