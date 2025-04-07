import { Bot, type BotProps } from "@/components/Bot";
import { getPaymentInProgressInStorage } from "@/features/blocks/inputs/payment/helpers/paymentInProgressStorage";
import { chatwootWebWidgetOpenedMessage } from "@/features/blocks/integrations/chatwoot/constants";
import type { CommandData } from "@/features/commands/types";
import {
  getBotOpenedStateFromStorage,
  removeBotOpenedStateInStorage,
  setBotOpenedStateInStorage,
} from "@/utils/storage";
import { EnvironmentProvider } from "@ark-ui/solid";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { cx } from "@typebot.io/ui/lib/cva";
import { zendeskWebWidgetOpenedMessage } from "@typebot.io/zendesk-block/constants";
import {
  Show,
  createEffect,
  createSignal,
  onCleanup,
  splitProps,
} from "solid-js";
import styles from "../../../assets/index.css";
import type { BubbleParams } from "../types";
import { BubbleButton } from "./BubbleButton";
import { PreviewMessage, type PreviewMessageProps } from "./PreviewMessage";

const defaultBottom = "20px";
const buttonBotGap = "12px";

export type BubbleProps = BotProps &
  BubbleParams & {
    inlineStyle?: {
      [key: string]: string;
    };
    onOpen?: () => void;
    onClose?: () => void;
    onPreviewMessageClick?: () => void;
    onPreviewMessageDismissed?: () => void;
  };

export const Bubble = (props: BubbleProps) => {
  const [bubbleProps, botProps] = splitProps(props, [
    "onOpen",
    "onClose",
    "previewMessage",
    "onPreviewMessageClick",
    "onPreviewMessageDismissed",
    "theme",
    "autoShowDelay",
    "inlineStyle",
  ]);
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [isMounted, setIsMounted] = createSignal(true);
  const [prefilledVariables, setPrefilledVariables] = createSignal(
    botProps.prefilledVariables,
  );
  const [isPreviewMessageDisplayed, setIsPreviewMessageDisplayed] =
    createSignal(false);
  const [previewMessage, setPreviewMessage] = createSignal<
    Pick<PreviewMessageProps, "avatarUrl" | "message">
  >({
    message: bubbleProps.previewMessage?.message ?? "",
    avatarUrl: bubbleProps.previewMessage?.avatarUrl,
  });

  const [isBotOpened, setIsBotOpened] = createSignal(false);
  const [isBotStarted, setIsBotStarted] = createSignal(false);
  const [buttonSize, setButtonSize] = createSignal(
    parseButtonSize(bubbleProps.theme?.button?.size ?? "medium"),
  );
  createEffect(() => {
    setButtonSize(parseButtonSize(bubbleProps.theme?.button?.size ?? "medium"));
  });

  let progressBarContainerRef;

  const initializeBubble = () => {
    window.addEventListener("message", processIncomingEvent);
    const autoShowDelay = bubbleProps.autoShowDelay;
    const previewMessageAutoShowDelay =
      bubbleProps.previewMessage?.autoShowDelay;
    if (getBotOpenedStateFromStorage() || getPaymentInProgressInStorage())
      openBot();
    if (isDefined(autoShowDelay)) {
      setTimeout(() => {
        openBot();
      }, autoShowDelay);
    }
    if (isDefined(previewMessageAutoShowDelay)) {
      setTimeout(() => {
        showMessage({
          avatarUrl: bubbleProps.previewMessage?.avatarUrl,
          message: bubbleProps.previewMessage?.message ?? "",
        });
      }, previewMessageAutoShowDelay);
    }
  };

  onCleanup(() => {
    setIsInitialized(false);
    window.removeEventListener("message", processIncomingEvent);
  });

  createEffect(() => {
    if (isInitialized() || isNotDefined(botProps.typebot)) return;
    initializeBubble();
    setIsInitialized(true);
  });

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event;
    if (!data.isFromTypebot || (data.id && botProps.id !== data.id)) return;
    if (data.command === "open") openBot();
    if (data.command === "close") closeBot();
    if (data.command === "toggle") toggleBot();
    if (data.command === "showPreviewMessage") showMessage(data.message);
    if (data.command === "hidePreviewMessage") hideMessage();
    if (data.command === "setPrefilledVariables")
      setPrefilledVariables((existingPrefilledVariables) => ({
        ...existingPrefilledVariables,
        ...data.variables,
      }));
    if (data.command === "unmount") unmount();
  };

  const openBot = () => {
    if (!isBotStarted()) setIsBotStarted(true);
    hideMessage();
    setIsBotOpened(true);
    if (isBotOpened()) bubbleProps.onOpen?.();
  };

  const closeBot = () => {
    setIsBotOpened(false);
    removeBotOpenedStateInStorage();
    if (isBotOpened()) bubbleProps.onClose?.();
  };

  const toggleBot = () => {
    isBotOpened() ? closeBot() : openBot();
  };

  const handlePreviewMessageClick = () => {
    bubbleProps.onPreviewMessageClick?.();
    openBot();
  };

  const showMessage = (
    previewMessage?: Pick<PreviewMessageProps, "avatarUrl" | "message">,
  ) => {
    if (previewMessage) setPreviewMessage(previewMessage);
    if (isBotOpened()) return;
    setIsPreviewMessageDisplayed(true);
  };

  const hideMessage = () => {
    bubbleProps.onPreviewMessageDismissed?.();
    setIsPreviewMessageDisplayed(false);
  };

  const unmount = () => {
    if (isBotOpened()) {
      closeBot();
      setTimeout(() => {
        setIsMounted(false);
      }, 200);
    } else setIsMounted(false);
  };

  const handleOnChatStatePersisted = (isPersisted: boolean) => {
    botProps.onChatStatePersisted?.(isPersisted);
    if (isPersisted) setBotOpenedStateInStorage();
  };

  const handleScriptExecutionSuccessMessage = (message: string) => {
    if (
      message === zendeskWebWidgetOpenedMessage ||
      message === chatwootWebWidgetOpenedMessage
    )
      unmount();
    botProps.onScriptExecutionSuccess?.(message);
  };

  return (
    <Show when={isMounted()}>
      <EnvironmentProvider
        value={document.querySelector("typebot-bubble")?.shadowRoot as Node}
      >
        <style>{styles}</style>
        <div ref={progressBarContainerRef} />
        <div
          class={cx(
            bubbleProps.theme?.position !== "static"
              ? bubbleProps.theme?.placement === "left"
                ? "z-[424242] fixed bottom-5 left-5"
                : "z-[424242] fixed bottom-5 right-5"
              : "relative",
          )}
          style={bubbleProps.inlineStyle}
        >
          <Show when={isPreviewMessageDisplayed()}>
            <PreviewMessage
              {...previewMessage()}
              placement={bubbleProps.theme?.placement}
              previewMessageTheme={bubbleProps.theme?.previewMessage}
              buttonSize={buttonSize()}
              onClick={handlePreviewMessageClick}
              onCloseClick={hideMessage}
            />
          </Show>
          <BubbleButton
            {...bubbleProps.theme?.button}
            placement={bubbleProps.theme?.placement}
            toggleBot={toggleBot}
            isBotOpened={isBotOpened()}
            buttonSize={buttonSize()}
          />
          <div
            part="bot"
            style={{
              "max-height": `calc(100vh - ${defaultBottom} - ${buttonSize()} - ${buttonBotGap})`,
              height: bubbleProps.theme?.chatWindow?.maxHeight ?? "704px",
              "max-width": bubbleProps.theme?.chatWindow?.maxWidth ?? "400px",
              transition:
                "transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out",
              "transform-origin":
                bubbleProps.theme?.placement === "left"
                  ? "bottom left"
                  : "bottom right",
              transform: isBotOpened()
                ? "scale3d(1, 1, 1)"
                : "scale3d(0, 0, 1)",
              "box-shadow": "rgb(0 0 0 / 16%) 0px 5px 40px",
              "background-color":
                bubbleProps.theme?.chatWindow?.backgroundColor,
            }}
            class={cx(
              "absolute rounded-lg w-screen bottom-[calc(100%+12px)]",
              isBotOpened() ? "opacity-1" : "opacity-0 pointer-events-none",
              bubbleProps.theme?.placement === "left"
                ? "sm:left-0 -left-5"
                : "sm:right-0 -right-5",
            )}
          >
            <Show when={isBotStarted()}>
              <Bot
                {...botProps}
                onScriptExecutionSuccess={handleScriptExecutionSuccessMessage}
                onChatStatePersisted={handleOnChatStatePersisted}
                prefilledVariables={prefilledVariables()}
                class="rounded-lg"
                progressBarRef={progressBarContainerRef}
              />
            </Show>
          </div>
        </div>
      </EnvironmentProvider>
    </Show>
  );
};

const parseButtonSize = (
  size: NonNullable<NonNullable<BubbleProps["theme"]>["button"]>["size"],
): `${number}px` =>
  size === "medium" ? "48px" : size === "large" ? "64px" : size ? size : "48px";
