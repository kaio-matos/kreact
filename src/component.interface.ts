import type { IKVirtualNode } from "./node";

export type KComponent<P = undefined> = (props: P) => IKVirtualNode;
