import { Bot, type BotProps } from "@/components/Bot";
import type { CommandData } from "@/features/commands/types";
import { wipeExistingChatStateInStorage } from "@/utils/storage";
import { EnvironmentProvider } from "@ark-ui/solid";
import typebotColors from "@typebot.io/ui/colors.css";
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

export const Standard = (props: BotProps, { element }: { element: any }) => {
  const [isBotDisplayed, setIsBotDisplayed] = createSignal(false);
  const [prefilledVariables, setPrefilledVariables] = createSignal(
    props.prefilledVariables,
  );
  const [currentTypebotId, setCurrentTypebotId] = createSignal<string>();

  const launchBot = () => {
    setIsBotDisplayed(true);
  };

  const reloadBot = () => {
    setIsBotDisplayed(false);
    setTimeout(() => {
      setIsBotDisplayed(true);
    }, 1);
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
    switch (data.command) {
      case "setPrefilledVariables":
        setPrefilledVariables((existingPrefilledVariables) => ({
          ...existingPrefilledVariables,
          ...data.variables,
        }));
        break;
      case "reload":
        reloadBot();
        break;
      case "reset": {
        const typebotId = currentTypebotId();
        if (!typebotId) return;
        wipeExistingChatStateInStorage(typebotId);
        break;
      }
    }
  };

  const handleOnChatStatePersisted = (
    isEnabled: boolean,
    { typebotId }: { typebotId: string },
  ) => {
    setCurrentTypebotId(typebotId);
    props.onChatStatePersisted?.(isEnabled, { typebotId });
  };

  onCleanup(() => {
    botLauncherObserver.disconnect();
  });

  return (
    <EnvironmentProvider
      value={document.querySelector("typebot-standard")?.shadowRoot as Node}
    >
      <style>
        {typebotColors}
        {styles}
        {hostElementCss}
      </style>
      <Show when={isBotDisplayed()}>
        <Bot
          {...props}
          prefilledVariables={prefilledVariables()}
          onChatStatePersisted={handleOnChatStatePersisted}
        />
      </Show>
    </EnvironmentProvider>
  );
};
