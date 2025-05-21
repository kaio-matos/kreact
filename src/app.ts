import type { KComponent } from "./component.interface";
import { KVirtualNode } from "./node";
import { resetUseStateIds } from "./hooks/use-state";

export let GlobalApp: App | null = null;
export let CurrentRenderingComponent: KVirtualNode | null = null;

export class App {
  private root: HTMLElement;
  private rootComponent: KComponent;

  private AppRoot?: HTMLElement;

  constructor(root: HTMLElement, rootComponent: KComponent) {
    this.root = root;
    this.rootComponent = rootComponent;
    this.render();
    GlobalApp = this;
  }

  render() {
    resetUseStateIds();

    const newVirtualRoot = this.rootComponent(undefined);

    this.AppRoot = this.updateDOM(this.AppRoot, newVirtualRoot) as HTMLElement;
    if (!this.root.children.length && this.AppRoot) {
      this.root.appendChild(this.AppRoot);
    }
  }

  private updateDOM(
    CurrentRoot: Element | undefined | null,
    NewVirtualRoot: KVirtualNode,
  ) {
    const NewRoot = NewVirtualRoot.traverse();

    // if we are rendering for the first time that node
    if (!CurrentRoot) {
      CurrentRoot = NewRoot.element;
    }

    if (NewRoot.children.length) {
      CurrentRoot.replaceWith(NewRoot.element);
      // the replaceWith method don't mutate the CurrentRoot variable
      // so we need to manually update it to the new element
      CurrentRoot = NewRoot.element;

      for (let i = 0; i < NewRoot.children.length; i++) {
        const NewChild = NewRoot.children[i];
        const CurrentChild = CurrentRoot.children.item(i);

        if (CurrentChild) {
          this.updateDOM(CurrentChild, NewChild);
        } else {
          const resolved = NewChild.traverse();

          if (resolved.children.length) {
            this.updateDOM(CurrentChild, resolved);
          }

          CurrentRoot.appendChild(resolved.element);
        }
      }
    } else {
      CurrentRoot.replaceWith(NewRoot.element);
    }

    return CurrentRoot;
  }
}
