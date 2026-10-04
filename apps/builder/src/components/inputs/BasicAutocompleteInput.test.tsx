import { afterEach, expect, it } from "bun:test";
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BasicAutocompleteInput } from "./BasicAutocompleteInput";

type TestDom = {
  window: {
    document: Document;
    Element: typeof Element;
    HTMLElement: typeof HTMLElement;
    Node: typeof Node;
    MutationObserver: typeof MutationObserver;
    getComputedStyle: Window["getComputedStyle"];
    close: () => void;
  };
};

const JSDOM: new (html: string) => TestDom = require("jsdom").JSDOM;
let root: Root | undefined;
let dom: TestDom | undefined;

const renderInput = async (
  container: HTMLElement,
  props: ComponentProps<typeof BasicAutocompleteInput>,
) => {
  if (!root) root = createRoot(container);
  await act(async () => root?.render(<BasicAutocompleteInput {...props} />));
};

const setupDom = () => {
  dom = new JSDOM("<!doctype html><div id='root'></div>");
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    Element: dom.window.Element,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    MutationObserver: dom.window.MutationObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  });

  const container = dom.window.document.getElementById("root");
  if (!container) throw new Error("Test root element was not created");
  return container;
};

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  dom?.window.close();
  root = undefined;
  dom = undefined;
});

it("updates the displayed value when an async option label resolves", async () => {
  const container = setupDom();
  let changeCount = 0;
  const onChange = () => {
    changeCount++;
  };
  const unresolvedValue = "provider.action";
  const resolvedLabel = "Resolved action label";

  await renderInput(container, {
    items: [unresolvedValue],
    defaultValue: unresolvedValue,
    onChange,
  });
  expect(container.querySelector("input")?.value).toBe(unresolvedValue);
  const inputBeforeResolution = container.querySelector("input");

  await renderInput(container, {
    items: [resolvedLabel],
    defaultValue: resolvedLabel,
    onChange,
  });

  expect(container.querySelector("input")).toBe(inputBeforeResolution);
  expect(container.querySelector("input")?.value).toBe(resolvedLabel);
  expect(changeCount).toBe(0);
});

it("preserves an unknown value when options update without user interaction", async () => {
  const container = setupDom();
  let changeCount = 0;
  const unknownValue = "removed.option";
  const onChange = () => {
    changeCount++;
  };

  await renderInput(container, {
    items: [unknownValue],
    defaultValue: unknownValue,
    onChange,
  });
  await renderInput(container, {
    items: ["another.option"],
    defaultValue: unknownValue,
    onChange,
  });

  expect(container.querySelector("input")?.value).toBe(unknownValue);
  expect(changeCount).toBe(0);
});
