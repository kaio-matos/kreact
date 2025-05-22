import { CurrentResolvingComponent } from "../node";

export function useState<S>(state: S) {
  return CurrentResolvingComponent!.useState(state);
}
