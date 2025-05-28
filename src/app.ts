import type { KComponent } from "./component.interface";
import { debounce } from "./debounce";
import { EventSystem } from "./event";
import {
  clearCurrentResolvingComponent,
  KVirtualNode,
  KVirtualNodeComponent,
} from "./node";

export let GlobalApp: App | null = null;

const BATCH_TIMEOUT = 0;

export class App {
  private root: HTMLElement;
  private VirtualRoot: KVirtualNodeComponent;
  render: () => void;
  queue: Function[];
  isRendering: boolean;
  hasScheduledUpdate: boolean;
  EventSystem: EventSystem;

  private AppRoot?: HTMLElement;

  constructor(root: HTMLElement, rootComponent: KComponent) {
    this.root = root;
    this.VirtualRoot = KVirtualNodeComponent.create(rootComponent, undefined);
    this.queue = [];
    this.isRendering = false;
    this.hasScheduledUpdate = false;
    this.EventSystem = new EventSystem(this.onEventDispatch.bind(this));

    this.render = debounce(
      function (this: App) {
        console.log("------------ Running updates");
        for (const update of this.queue) {
          update();
        }
        console.log("------------ Finishing updates");
        console.log("------------ Starting Rendering");
        this.isRendering = true;

        this.AppRoot = this.updateDOM(
          this.AppRoot,
          this.VirtualRoot,
        ) as HTMLElement;
        clearCurrentResolvingComponent();

        if (!this.root.children.length && this.AppRoot) {
          this.root.appendChild(this.AppRoot);
        }

        this.queue = [];
        this.isRendering = false;
        console.log("------------ Finishing render");
      }.bind(this),
      BATCH_TIMEOUT,
    );

    this.render();

    GlobalApp = this;
  }

  private updateDOM(
    CurrentRoot: Element | undefined | null,
    VirtualRoot: KVirtualNode,
    force = false,
  ) {
    const ResolvedVirtualRoot = VirtualRoot.resolve(force);
    let wasDirty = false;

    // if we are rendering for the first time that node
    if (!CurrentRoot) {
      CurrentRoot = ResolvedVirtualRoot.element;
    }

    if (VirtualRoot.isComponent()) {
      VirtualRoot.isRendering = true;
      if (VirtualRoot.isDirty) {
        wasDirty = true;
        CurrentRoot.replaceWith(ResolvedVirtualRoot.element);
        // the replaceWith method doesn't mutate the CurrentRoot variable
        // so we need to manually update it to the new element
        CurrentRoot = ResolvedVirtualRoot.element;
        VirtualRoot.isDirty = false;
      }
    } else if (force) {
      CurrentRoot.replaceWith(ResolvedVirtualRoot.element);
      // the replaceWith method doesn't mutate the CurrentRoot variable
      // so we need to manually update it to the new element
      CurrentRoot = ResolvedVirtualRoot.element;
    }

    for (let i = 0; i < ResolvedVirtualRoot.children.length; i++) {
      const VirtualChild = ResolvedVirtualRoot.children[i];
      const CurrentChild = CurrentRoot.children.item(i);

      const result = this.updateDOM(CurrentChild, VirtualChild, wasDirty); // if the parent was dirty we want to rerender everyone
      if (!CurrentChild) {
        CurrentRoot.appendChild(result);
      }
    }

    if (VirtualRoot.isComponent()) {
      VirtualRoot.isRendering = false;
    }
    return CurrentRoot;
  }

  scheduleUpdate(update: () => void) {
    this.queue.push(update);

    if (this.hasScheduledUpdate) return;

    if (this.isRendering) {
      if (!this.hasScheduledUpdate) {
        setTimeout(() => {
          this.render();
          this.hasScheduledUpdate = false;
        }, BATCH_TIMEOUT);
        this.hasScheduledUpdate = true;
      }
      return;
    }

    this.render();
  }

  onEventDispatch(type: string, event: Event) {
    const foundNode = this.findNodeWithElement(event.target as Element);
    foundNode?.fireEvent(type, event);
  }

  findNodeWithElement(element: Element) {
    function findVirtualNode(root: KVirtualNodeComponent) {
      let node = root.getCurrentNode();

      if (node?.isTagged()) {
        if (node.element === element) {
          return node;
        }

        for (const child of node.children) {
          if (child.isComponent()) {
            return findVirtualNode(child);
          } else if (child.isTagged() && child.element === element) {
            return child;
          }
        }
      }
    }

    return findVirtualNode(this.VirtualRoot);
  }
}
