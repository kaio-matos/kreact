import type { KVirtualNode } from "./node";

export type KComponent<P = undefined> = (props: P) => KVirtualNode;
