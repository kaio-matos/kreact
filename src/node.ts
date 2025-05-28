import { GlobalApp } from "./app";
import type { KComponent } from "./component.interface";
import { EventsHandler } from "./event";

export let CurrentResolvingComponent: KVirtualNodeComponent | null = null;
export function clearCurrentResolvingComponent() {
  CurrentResolvingComponent = null;
}

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

  eventsHandler: EventsHandler<any, any>;
  states: Array<[any, (state: any) => void]> = [];
  stateId = -1;
  isDirty = true;
  isRendering = false;

  private constructor(resolver: () => KVirtualNode, component: KComponent) {
    super();
    this.name = component.name;
    this.component = component;
    this._resolver = resolver;
    this.eventsHandler = new EventsHandler();
  }

  static create<P, C extends KComponent<P>>(component: C, props: P) {
    return new KVirtualNodeComponent(
      () => component(props),
      component as unknown as KComponent,
    );
  }

  getCurrentNode() {
    return this.result;
  }

  resolver(force = false) {
    if (force || !this.result || this.isDirty) {
      CurrentResolvingComponent = this;
      this.eventsHandler.destroy();
      this.result = this._resolver();
      if (this.result.isTagged()) {
        this.assignFatherhood([this.result]);
      }
    }
    return this.result;
  }

  useState<S>(initial: S) {
    type Return = [S, typeof setState];

    if (this.states[this.stateId]) return this.states[this.stateId] as Return;

    this.stateId++;

    const setState = (state: S | ((current: S) => S)) => {
      if (this.states[this.stateId][0] === state) {
        return;
      }
      console.log(`${this.name}.setState(${state})`);
      const self = this;

      GlobalApp?.scheduleUpdate(() => {
        self.isDirty = true;
        self.states[self.stateId][0] =
          typeof state === "function"
            ? (state as any)(self.states[self.stateId][0])
            : state;
      });
    };

    this.states[this.stateId] = [initial, setState];

    return this.states[this.stateId] as Return;
  }

  assignFatherhood(children: KVirtualNode[]) {
    children.forEach((child) => {
      if (child.isTagged()) {
        child.parent = this;

        this.assignFatherhood(child.children);
      }
    });
  }
}

export class KVirtualNodeTagged<
  K extends KeyOfTagNamesMap,
> extends KVirtualNode {
  children: KVirtualNode[] = [];
  tag: K;
  element: HTMLElement;
  parent?: KVirtualNodeComponent;

  private constructor(tag: K) {
    super();
    this.tag = tag;
    this.element = document.createElement(tag);
    this.children = [];
  }

  static create<K extends KeyOfTagNamesMap>(tag: K) {
    return new KVirtualNodeTagged(tag);
  }

  addEventListener(
    type: Parameters<HTMLElementTagNameMap[K]["addEventListener"]>[0],
    listener: Parameters<HTMLElementTagNameMap[K]["addEventListener"]>[1],
  ) {
    CurrentResolvingComponent!.eventsHandler.addEventListener(
      this.element,
      type,
      listener,
    );
    return this;
  }

  fireEvent(type: string, event: Event) {
    // at this time CurrentResolvingComponent is null
    this.parent!.eventsHandler.fireEvent(this.element, type, event);
  }

  appendChild(node: KVirtualNode) {
    this.children.push(node);
    return this;
  }

  innerHTML(html: string) {
    this.element.innerHTML = html;
    return this;
  }

  attributes(attributes: Record<string, any>) {
    for (const key in attributes) {
      this.element.setAttribute(key, attributes[key]);
    }
    return this;
  }
}
