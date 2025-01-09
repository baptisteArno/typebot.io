import { Bot, type BotProps } from "@/components/Bot";
import type { CommandData } from "@/features/commands/types";
import { EnvironmentProvider } from "@ark-ui/solid";
import { Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import styles from "../../../assets/index.css";

const hostElementCss = `
:host {
  display: block;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
`;

export const Standard = (
  props: BotProps,
  { element }: { element: HTMLElement },
) => {
  const [isBotDisplayed, setIsBotDisplayed] = createSignal(false);
  const [prefilledVariables, setPrefilledVariables] = createSignal(
    props.prefilledVariables,
  );

  const launchBot = () => {
    setIsBotDisplayed(true);
  };

  const botLauncherObserver = new IntersectionObserver((intersections) => {
    if (intersections.some((intersection) => intersection.isIntersecting))
      launchBot();
  });

  onMount(() => {
    window.addEventListener("message", processIncomingEvent);
    botLauncherObserver.observe(element);
  });

  createEffect(() => {
    if (!props.prefilledVariables) return;
    setPrefilledVariables((existingPrefilledVariables) => ({
      ...existingPrefilledVariables,
      ...props.prefilledVariables,
    }));
  });

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event;
    if (!data.isFromTypebot || (data.id && props.id !== data.id)) return;
    if (data.command === "setPrefilledVariables")
      setPrefilledVariables((existingPrefilledVariables) => ({
        ...existingPrefilledVariables,
        ...data.variables,
      }));
  };

  onCleanup(() => {
    botLauncherObserver.disconnect();
  });

  return (
    <EnvironmentProvider
      value={document.querySelector("typebot-standard")?.shadowRoot as Node}
    >
      <style>
        {styles}
        {hostElementCss}
      </style>
      <Show when={isBotDisplayed()}>
        <Bot {...props} prefilledVariables={prefilledVariables()} />
      </Show>
    </EnvironmentProvider>
  );
};
