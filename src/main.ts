import { AppBuilder } from "./app-builder";
import type { Component } from "./component.interface";

const Root: Component = () => {};

const app = new AppBuilder("app").setRootComponent(Root).build();
