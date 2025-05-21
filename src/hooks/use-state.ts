import { CurrentRenderingComponent, GlobalApp } from "../app";

const states: Array<[any, (state: any) => void]> = [];
let GlobalId = -1;

export function resetUseStateIds() {
  GlobalId = -1;
}

export function useState<S>(state: S) {
  type Return = [S, typeof setState];

  const id = GlobalId++;

  if (states[id]) return states[id] as Return;

  function setState(state: S) {
    states[id][0] = state;
    GlobalApp?.render();
  }

  states[id] = [state, setState];

  return states[id] as Return;
}
