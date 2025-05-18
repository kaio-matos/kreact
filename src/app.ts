import type { Component } from "./component.interface";

export class App {
  private root: HTMLElement;
  private rootComponent: Component;

  constructor(root: HTMLElement, rootComponent: Component) {
    this.root = root;
    this.rootComponent = rootComponent;
  }
}
