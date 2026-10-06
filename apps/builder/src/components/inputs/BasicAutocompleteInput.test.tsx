import { afterEach, expect, it } from "bun:test";
import { JSDOM } from "jsdom";
import { act, type ComponentProps } from "react";
import type { Root } from "react-dom/client";
import { BasicAutocompleteInput } from "./BasicAutocompleteInput";

const globalKeys = [
  "window",
  "document",
  "Element",
  "HTMLElement",
  "Node",
  "MutationObserver",
  "getComputedStyle",
  "IS_REACT_ACT_ENVIRONMENT",
] as const;
type GlobalKey = (typeof globalKeys)[number];

let originalGlobals = new Map<GlobalKey, PropertyDescriptor | undefined>();
let root: Root | undefined;
let dom: JSDOM | undefined;

const renderInput = async (
  container: HTMLElement,
  props: ComponentProps<typeof BasicAutocompleteInput>,
) => {
  if (!root) {
    const { createRoot } = await import("react-dom/client");
    root = createRoot(container);
  }
  await act(async () => root?.render(<BasicAutocompleteInput {...props} />));
};

const setupDom = () => {
  dom = new JSDOM("<!doctype html><div id='root'></div>");
  for (const key of globalKeys)
    originalGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));

  Object.defineProperties(globalThis, {
    window: { configurable: true, writable: true, value: dom.window },
    document: {
      configurable: true,
      writable: true,
      value: dom.window.document,
    },
    Element: { configurable: true, writable: true, value: dom.window.Element },
    HTMLElement: {
      configurable: true,
      writable: true,
      value: dom.window.HTMLElement,
    },
    Node: { configurable: true, writable: true, value: dom.window.Node },
    MutationObserver: {
      configurable: true,
      writable: true,
      value: dom.window.MutationObserver,
    },
    getComputedStyle: {
      configurable: true,
      writable: true,
      value: dom.window.getComputedStyle.bind(dom.window),
    },
    IS_REACT_ACT_ENVIRONMENT: {
      configurable: true,
      writable: true,
      value: true,
    },
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

  for (const key of globalKeys) {
    const descriptor = originalGlobals.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
  originalGlobals = new Map();
});

it("resolves the persisted provider selection when async labels arrive", async () => {
  const container = setupDom();
  let changeCount = 0;
  const onChange = () => {
    changeCount++;
  };
  const unresolvedLabel = "cashier-report-read (not listed by the provider)";
  const resolvedLabel = "مشاهده گزارش صندوق";

  await renderInput(container, {
    items: [unresolvedLabel],
    defaultValue: unresolvedLabel,
    onChange,
  });
  const inputBeforeResolution = container.querySelector<HTMLInputElement>(
    '[data-slot="autocomplete-input"]',
  );
  expect(inputBeforeResolution?.value).toBe(unresolvedLabel);

  await renderInput(container, {
    items: [resolvedLabel],
    defaultValue: resolvedLabel,
    onChange,
  });

  expect(container.querySelector('[data-slot="autocomplete-input"]')).toBe(
    inputBeforeResolution,
  );
  expect(inputBeforeResolution?.value).toBe(resolvedLabel);
  expect(changeCount).toBe(0);
});

it("preserves an in-progress draft and its caret while async labels arrive", async () => {
  const container = setupDom();
  const changes: Array<string | undefined> = [];
  const unresolvedLabel = "cashier-report-read (not listed by the provider)";
  const resolvedLabel = "مشاهده گزارش صندوق";

  await renderInput(container, {
    items: [unresolvedLabel],
    defaultValue: unresolvedLabel,
    debounceTimeout: 20,
    onChange: (value) => changes.push(value),
  });

  const input = container.querySelector<HTMLInputElement>(
    '[data-slot="autocomplete-input"]',
  );
  const nativeValueSetter = Object.getOwnPropertyDescriptor(
    dom?.window.HTMLInputElement.prototype,
    "value",
  )?.set;
  if (!input || !nativeValueSetter)
    throw new Error("Autocomplete input missing");

  await act(async () => {
    nativeValueSetter.call(input, "typed draft");
    input.setSelectionRange(5, 5);
    input.dispatchEvent(
      new (dom?.window.InputEvent ?? InputEvent)("input", {
        bubbles: true,
        inputType: "insertText",
        data: "d",
      }),
    );
  });
  expect(input.value).toBe("typed draft");
  expect(changes).toEqual([]);

  await renderInput(container, {
    items: [resolvedLabel],
    defaultValue: resolvedLabel,
    debounceTimeout: 20,
    onChange: (value) => changes.push(value),
  });

  expect(container.querySelector('[data-slot="autocomplete-input"]')).toBe(
    input,
  );
  expect(input.value).toBe("typed draft");
  expect(input.selectionStart).toBe(5);
  expect(changes).toEqual([]);

  await act(async () => new Promise((resolve) => setTimeout(resolve, 30)));
  expect(changes).toEqual(["typed draft"]);
  expect(input.value).toBe("typed draft");
});

it("keeps a genuinely unknown provider value unresolved", async () => {
  const container = setupDom();
  let changeCount = 0;
  const unknownValue = "removed-access-key (not listed by the provider)";

  await renderInput(container, {
    items: [unknownValue],
    defaultValue: unknownValue,
    onChange: () => changeCount++,
  });
  await renderInput(container, {
    items: ["another Host option"],
    defaultValue: unknownValue,
    onChange: () => changeCount++,
  });

  expect(
    container.querySelector<HTMLInputElement>(
      '[data-slot="autocomplete-input"]',
    )?.value,
  ).toBe(unknownValue);
  expect(changeCount).toBe(0);
});
