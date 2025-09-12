import { isEmpty } from "@typebot.io/lib/utils";
import { isElementDescendant } from "@typebot.io/rich-text/helpers/isElementDescendant";
import { isTextDescendant } from "@typebot.io/rich-text/helpers/isTextDescendant";
import type { Descendant } from "@typebot.io/rich-text/plate";
import { createMemo, For, Match, Switch } from "solid-js";
import { PlateText } from "./PlateText";

type Props = {
  element: Descendant;
};

export const PlateElement = (props: Props) => {
  const textDescendant = createMemo(() => {
    const element = props.element;
    return isTextDescendant(element) ? element : undefined;
  });
  const elementDescendant = createMemo(() => {
    const element = props.element;
    return isElementDescendant(element) ? element : undefined;
  });
  return (
    <Switch>
      <Match when={textDescendant()} keyed>
        {(textDescendant) => <PlateText {...textDescendant} />}
      </Match>
      <Match when={elementDescendant()} keyed>
        {(elementDescendant) => (
          <Switch>
            <Match when={elementDescendant.type === "a"}>
              <a
                href={elementDescendant.url as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                <For each={elementDescendant.children}>
                  {(child) => <PlateElement element={child} />}
                </For>
              </a>
            </Match>
            <Match when={elementDescendant.type === "ol"}>
              <ol>
                <For each={elementDescendant.children}>
                  {(child) => <PlateElement element={child} />}
                </For>
              </ol>
            </Match>
            <Match when={props.element.type === "ul"}>
              <ul>
                <For each={elementDescendant.children}>
                  {(child) => <PlateElement element={child} />}
                </For>
              </ul>
            </Match>
            <Match when={props.element.type === "li"}>
              <li>
                <For each={elementDescendant.children}>
                  {(child) => <PlateElement element={child} />}
                </For>
              </li>
            </Match>
            <Match
              when={
                elementDescendant.type === "p" &&
                elementDescendant.children.length === 1 &&
                isEmpty(elementDescendant.children[0].text as string)
              }
            >
              <br />
            </Match>
            <Match when={true}>
              <div data-element-type={props.element.type}>
                <For each={elementDescendant.children}>
                  {(child) => <PlateElement element={child} />}
                </For>
              </div>
            </Match>
          </Switch>
        )}
      </Match>
    </Switch>
  );
};
