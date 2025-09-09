import { EnvironmentProvider } from "@ark-ui/solid";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import typebotColors from "@typebot.io/ui/colors.css";
import { zendeskWebWidgetOpenedMessage } from "@typebot.io/zendesk-block/constants";
import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
  splitProps,
} from "solid-js";
import { Bot, type BotProps } from "@/components/Bot";
import { getPaymentInProgressInStorage } from "@/features/blocks/inputs/payment/helpers/paymentInProgressStorage";
import { chatwootWebWidgetOpenedMessage } from "@/features/blocks/integrations/chatwoot/constants";
import {
  getBotOpenedStateFromStorage,
  removeBotOpenedStateInStorage,
  setBotOpenedStateInStorage,
  wipeExistingChatStateInStorage,
} from "@/utils/storage";
import styles from "../../../assets/index.css";
import type { CommandData } from "../../commands/types";
import type { PopupParams } from "../types";

export type PopupProps = BotProps &
  PopupParams & {
    defaultOpen?: boolean;
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
  };

export const Popup = (props: PopupProps) => {
  const [popupProps, botProps] = splitProps(props, [
    "onOpen",
    "onClose",
    "autoShowDelay",
    "theme",
    "isOpen",
    "defaultOpen",
  ]);

  const [currentTypebotId, setCurrentTypebotId] = createSignal<string>();
  const [prefilledVariables, setPrefilledVariables] = createSignal(
    botProps.prefilledVariables,
  );

  const [isBotOpened, setIsBotOpened] = createSignal(
    popupProps.isOpen ?? false,
  );

  onMount(() => {
    if (
      popupProps.defaultOpen ||
      getPaymentInProgressInStorage() ||
      getBotOpenedStateFromStorage()
    )
      openBot();
    window.addEventListener("message", processIncomingEvent);
    const autoShowDelay = popupProps.autoShowDelay;
    if (isDefined(autoShowDelay)) {
      setTimeout(() => {
        openBot();
      }, autoShowDelay);
    }
  });

  onCleanup(() => {
    window.removeEventListener("message", processIncomingEvent);
  });

  createEffect(() => {
    if (isNotDefined(props.isOpen) || props.isOpen === isBotOpened()) return;
    toggleBot();
  });

  createEffect(() => {
    if (!props.prefilledVariables) return;
    setPrefilledVariables((existingPrefilledVariables) => ({
      ...existingPrefilledVariables,
      ...props.prefilledVariables,
    }));
  });

  const stopPropagation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event;
    if (!data.isFromTypebot || (data.id && botProps.id !== data.id)) return;
    switch (data.command) {
      case "open":
        openBot();
        break;
      case "close":
        closeBot();
        break;
      case "toggle":
        toggleBot();
        break;
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
        removeBotOpenedStateInStorage();
        break;
      }
    }
  };

  const openBot = () => {
    setIsBotOpened(true);
    popupProps.onOpen?.();
    document.body.style.setProperty("overflow", "hidden", "important");
    document.addEventListener("pointerdown", closeBot);
  };

  const closeBot = () => {
    setIsBotOpened(false);
    popupProps.onClose?.();
    document.body.style.overflow = "auto";
    document.removeEventListener("pointerdown", closeBot);
    removeBotOpenedStateInStorage();
  };

  const toggleBot = () => {
    isBotOpened() ? closeBot() : openBot();
  };

  const reloadBot = () => {
    setIsBotOpened(false);
    setIsBotOpened(true);
  };

  const handleOnChatStatePersisted = (
    isEnabled: boolean,
    { typebotId }: { typebotId: string },
  ) => {
    botProps.onChatStatePersisted?.(isEnabled, { typebotId });
    setCurrentTypebotId(typebotId);
    if (isEnabled) setBotOpenedStateInStorage();
  };

  const handleScriptExecutionSuccessMessage = (message: string) => {
    if (
      message === zendeskWebWidgetOpenedMessage ||
      message === chatwootWebWidgetOpenedMessage
    )
      closeBot();
    props.onScriptExecutionSuccess?.(message);
  };

  return (
    <Show when={isBotOpened()}>
      <EnvironmentProvider
        value={document.querySelector("typebot-popup")?.shadowRoot as Node}
      >
        <style>
          {typebotColors}
          {styles}
        </style>
        <div
          class="relative"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
          style={{
            "z-index": props.theme?.zIndex ?? 42424242,
          }}
        >
          <div
            class="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
            part="overlay"
          />
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div
                class={
                  "relative h-[80vh] transform overflow-hidden rounded-lg text-left transition-all sm:my-8 w-full max-w-lg" +
                  (props.theme?.backgroundColor ? " shadow-xl" : "")
                }
                style={{
                  "background-color":
                    props.theme?.backgroundColor ?? "transparent",
                  "max-width": props.theme?.width ?? "512px",
                }}
                on:pointerdown={stopPropagation}
              >
                <Bot
                  {...botProps}
                  onScriptExecutionSuccess={handleScriptExecutionSuccessMessage}
                  prefilledVariables={prefilledVariables()}
                  onChatStatePersisted={handleOnChatStatePersisted}
                />
              </div>
            </div>
          </div>
        </div>
      </EnvironmentProvider>
    </Show>
  );
};
