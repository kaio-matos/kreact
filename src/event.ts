export class EventSystem {
  appendedEvents: Map<string, boolean> = new Map();

  constructor(onEventDispatch: (type: string, event: Event) => void) {
    let TYPE: keyof DocumentEventMap = "click";

    document.addEventListener(TYPE, (event) => onEventDispatch(TYPE, event));

    // Why these ones doesn't work properly with the click
    // TYPE = "focus";
    // document.addEventListener(TYPE, (event) => onEventDispatch(TYPE, event));
    //
    // TYPE = "blur";
    // document.addEventListener(TYPE, (event) => onEventDispatch(TYPE, event));
  }
}

export class EventsHandler<
  K extends keyof DocumentEventMap,
  Callback extends Function,
> {
  listeners: Map<
    K,
    {
      element: Element;
      callback: Callback;
    }[]
  >;

  constructor() {
    this.listeners = new Map();
  }

  addEventListener(element: Element, type: K, callback: Callback) {
    const listeners = this.listeners.get(type);

    if (listeners) {
      listeners.push({ element, callback });
    } else {
      this.listeners.set(type, [{ element, callback }]);
    }
  }

  removeEventListener(type: K, callback: Callback) {
    const listeners = this.listeners.get(type);

    if (listeners) {
      const foundIndex = listeners.findIndex(
        (listener) => listener.callback === callback,
      );
      const found = listeners[foundIndex];
      listeners.splice(foundIndex);

      this.listeners.set(type, listeners);
    }
  }

  fireEvent(element: Element, type: K, event: Event) {
    const listeners = this.listeners.get(type);
    const listener = listeners?.find(
      (listener) => listener.element === element,
    );
    if (listener) {
      listener.callback(event);
    }
  }

  destroy() {
    this.listeners.clear();
  }
}
