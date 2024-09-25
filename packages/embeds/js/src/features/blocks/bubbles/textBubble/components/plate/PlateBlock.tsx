import { isDefined } from "@typebot.io/lib/utils";
import type { TDescendant, TElement, TText } from "@typebot.io/rich-text/types";
import { For, type JSXElement, Match, Switch } from "solid-js";
import { PlateText, type PlateTextProps } from "./PlateText";

type Props = {
  element: TElement | TText;
  isUniqueChild?: boolean;
  insideInlineVariable?: boolean;
};

export const PlateElement = (props: Props) => (
  <Switch>
    <Match when={isDefined(props.element.text)}>
      <PlateText
        {...(props.element as PlateTextProps)}
        isUniqueChild={props.isUniqueChild ?? false}
      />
    </Match>
    <Match when={true}>
      <Switch>
        <Match when={props.element.type === "a"}>
          <a
            href={props.element.url as string}
            target="_blank"
            rel="noopener noreferrer"
          >
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </a>
        </Match>
        <Match when={props.element.type === "ol"}>
          <ol>
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </ol>
        </Match>
        <Match when={props.element.type === "ul"}>
          <ul>
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </ul>
        </Match>
        <Match when={props.element.type === "li"}>
          <li>
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </li>
        </Match>
        <Match when={true}>
          <ElementRoot
            element={props.element as TElement}
            insideInlineVariable={props.insideInlineVariable ?? false}
          >
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                  insideInlineVariable={
                    props.element.type === "inline-variable"
                  }
                />
              )}
            </For>
          </ElementRoot>
        </Match>
      </Switch>
    </Match>
  </Switch>
);

type ElementRootProps = {
  element: TElement;
  children: JSXElement;
  insideInlineVariable?: boolean;
};

const ElementRoot = (props: ElementRootProps) => {
  return (
    <Switch>
      <Match
        when={
          props.element.type === "inline-variable" || props.insideInlineVariable
        }
      >
        <span data-element-type={props.element.type}>{props.children}</span>
      </Match>
      <Match when={true}>
        <div data-element-type={props.element.type}>{props.children}</div>
      </Match>
    </Switch>
  );
};
