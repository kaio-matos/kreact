import { App } from "./app";
import type { KComponent } from "./component.interface";

export class AppBuilder {
  id: string;
  root: HTMLElement | null;
  rootComponent?: KComponent;

  constructor(id: string) {
    this.id = id;
    this.root = document.getElementById(id);
  }

  setRootComponent(rootComponent: KComponent) {
    this.rootComponent = rootComponent;
    return this;
  }

  build() {
    if (!this.root) {
      throw new Error(`Root element with ${this.id} not found`);
    }
    if (!this.rootComponent) {
      throw new Error(`Missing root component`);
    }

    return new App(this.root, this.rootComponent);
  }
}
