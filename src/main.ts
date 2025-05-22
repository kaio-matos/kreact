import { AppBuilder } from "./app-builder";
import type { KComponent } from "./component.interface";
import { KVirtualNodeComponent, KVirtualNodeTagged } from "./node";
import { useState } from "./hooks/use-state";

const Deep3: KComponent = () =>
  KVirtualNodeTagged.create("p").innerHTML("Deepness level 3");
const Deep2: KComponent = () => KVirtualNodeComponent.create(Deep3, undefined);
const Deep1: KComponent = () => KVirtualNodeComponent.create(Deep2, undefined);

const Button: KComponent<{ text: string; onClick: () => void }> = (props) => {
  // const [isFocused, setIsFocused] = useState(false);
  // const attributes = {
  //   style: `background-color: ${isFocused ? "#B2CD9C" : "#F0F2BD"}`,
  // };

  return (
    KVirtualNodeTagged.create("button")
      // .addEventListener("focus", () => setIsFocused(true))
      // .addEventListener("blur", () => setIsFocused(false))
      .addEventListener("click", () => props.onClick())
      // .attributes(attributes)
      .innerHTML(props.text)
  );
};

const Panel: KComponent = () => {
  const [counter, setCounter] = useState(0);

  return KVirtualNodeTagged.create("section")
    .attributes({
      style: "background-color: #CA7842; color: #B2CD9C; padding: 2rem",
    })
    .appendChild(
      KVirtualNodeComponent.create(Button, {
        text: `Increase ${counter}`,
        onClick: () => setCounter(counter + 1),
      }),
    )
    .appendChild(
      KVirtualNodeComponent.create(Button, {
        text: `Decrease ${counter}`,
        onClick: () => setCounter(counter - 1),
      }),
    );
};

const App: KComponent = () => {
  const [counter, setCounter] = useState(0);

  if (counter % 2 === 0) {
    return KVirtualNodeTagged.create("div")
      .appendChild(
        KVirtualNodeTagged.create("div")
          .attributes({
            style: "background-color: #4B352A; color: #F0F2BD; padding: 2rem",
          })
          .innerHTML(`Div: ${counter}`)
          .appendChild(
            KVirtualNodeComponent.create(Button, {
              text: "Click here",
              onClick: () => setCounter(counter + 1),
            }),
          )
          .appendChild(
            KVirtualNodeComponent.create(Button, {
              text: "Click here",
              onClick: () => setCounter(counter + 1),
            }),
          )
          .appendChild(KVirtualNodeComponent.create(Deep1, undefined)),
      )
      .appendChild(KVirtualNodeComponent.create(Panel, undefined));
  }

  return KVirtualNodeTagged.create("b")
    .attributes({
      style:
        "display: block; background-color: #4B352A; color: #F0F2BD; padding: 2rem",
    })
    .innerHTML(`Now Bold: ${counter}`)
    .appendChild(
      KVirtualNodeComponent.create(Button, {
        text: "Click here",
        onClick: () => setCounter(counter + 1),
      }),
    )
    .appendChild(
      KVirtualNodeComponent.create(Button, {
        text: "Click here",
        onClick: () => setCounter(counter + 1),
      }),
    )
    .appendChild(KVirtualNodeComponent.create(Deep1, undefined));
};

// const Root: KComponent = () => {
//   return KVirtualNodeComponent.create(App, undefined);
// };

// const app = new AppBuilder("app").setRootComponent(Root).build();
const app = new AppBuilder("app").setRootComponent(App).build();
