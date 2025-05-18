class App {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }
}

class AppBuilder {
  id: string;
  root: HTMLElement | null;

  constructor(id: string) {
    this.id = id;
    this.root = document.getElementById(id);
  }

  build() {
    if (!this.root) {
      throw new Error(`Root element with ${this.id} not found`);
    }

    return new App(this.root);
  }
}

const app = new AppBuilder("app").build();
