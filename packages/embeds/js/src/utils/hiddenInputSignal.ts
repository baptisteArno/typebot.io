import { createSignal } from "solid-js";

export const [hiddenInput, setHiddenInput] = createSignal<{
  [key: string]: boolean;
}>({});
