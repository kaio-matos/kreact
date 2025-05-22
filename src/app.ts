import type { KComponent } from "./component.interface";
import { KVirtualNode, KVirtualNodeComponent } from "./node";

export let GlobalApp: App | null = null;

export class App {
  private root: HTMLElement;
  private VirtualRoot: KVirtualNodeComponent;

  private AppRoot?: HTMLElement;

  constructor(root: HTMLElement, rootComponent: KComponent) {
    this.root = root;
    this.VirtualRoot = KVirtualNodeComponent.create(rootComponent, undefined);
    this.render();
    GlobalApp = this;
  }

  render() {
    this.AppRoot = this.updateDOM(
      this.AppRoot,
      this.VirtualRoot,
    ) as HTMLElement;

    if (!this.root.children.length && this.AppRoot) {
      this.root.appendChild(this.AppRoot);
    }
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
      if (VirtualRoot.isDirty) {
        wasDirty = true;
        console.log(CurrentRoot, VirtualRoot);
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

    return CurrentRoot;
  }
}
