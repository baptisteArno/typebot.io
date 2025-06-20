import { Bot, type BotProps } from "@/components/Bot";
import { getPaymentInProgressInStorage } from "@/features/blocks/inputs/payment/helpers/paymentInProgressStorage";
import { chatwootWebWidgetOpenedMessage } from "@/features/blocks/integrations/chatwoot/constants";
import type { CommandData } from "@/features/commands/types";
import { resolveButtonSize } from "@/utils/resolveBubbleButtonSize";
import {
  getBotOpenedStateFromStorage,
  removeBotOpenedStateInStorage,
  setBotOpenedStateInStorage,
} from "@/utils/storage";
import { EnvironmentProvider } from "@ark-ui/solid";
import { isDefined } from "@typebot.io/lib/utils";
import typebotColors from "@typebot.io/ui/colors.css";
import { cx } from "@typebot.io/ui/lib/cva";
import { zendeskWebWidgetOpenedMessage } from "@typebot.io/zendesk-block/constants";
import {
  Show,
  createEffect,
  createMemo,
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

type BubbleLifecycle = "idle" | "ready" | "closed" | "open" | "unmounted";

export type BubbleProps = BotProps &
  BubbleParams & {
    inlineStyle?: {
      [key: string]: string;
    };
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    onPreviewMessageClick?: () => void;
    onPreviewMessageDismissed?: () => void;
  };

export const Bubble = (props: BubbleProps) => {
  const [bubbleProps, botProps] = splitProps(props, [
    "isOpen",
    "onOpen",
    "onClose",
    "previewMessage",
    "onPreviewMessageClick",
    "onPreviewMessageDismissed",
    "theme",
    "autoShowDelay",
    "inlineStyle",
  ]);

  const [bubbleLifecycle, setBubbleLifecycle] =
    createSignal<BubbleLifecycle>("idle");
  const [hasOpenedOnce, setHasOpenedOnce] = createSignal(false);

  const isControlled = createMemo(() => isDefined(bubbleProps.isOpen));

  const isOpen = createMemo(() =>
    isControlled() ? bubbleProps.isOpen! : bubbleLifecycle() === "open",
  );

  const [prefilledVariables, setPrefilledVariables] = createSignal(
    botProps.prefilledVariables,
  );

  const [previewMessage, setPreviewMessage] = createSignal<
    Pick<PreviewMessageProps, "avatarUrl" | "message">
  >({
    message: bubbleProps.previewMessage?.message ?? "",
    avatarUrl: bubbleProps.previewMessage?.avatarUrl,
  });
  const [isPreviewMessageOpen, setIsPreviewMessageOpen] = createSignal(false);

  const attachEventListeners = () => {
    window.addEventListener("message", handlePostMessage);
  };

  const detachEventListeners = () => {
    window.removeEventListener("message", handlePostMessage);
  };

  // Simulating onMount because botProps.typebot is not available at first render
  createEffect(() => {
    if (bubbleLifecycle() !== "idle" || !botProps.typebot) return;

    setBubbleLifecycle("ready");
    attachEventListeners();
    autoShowIfNeeded();
  });

  onCleanup(() => {
    setBubbleLifecycle("idle");
    detachEventListeners();
  });

  createEffect(() => {
    if (bubbleProps.isOpen && !hasOpenedOnce()) setHasOpenedOnce(true);
  });

  const handlePostMessage = (event: MessageEvent<CommandData>) => {
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
      case "showPreviewMessage":
        showPreviewMessage(data.message);
        break;
      case "hidePreviewMessage":
        hidePreviewMessage();
        break;
      case "setPrefilledVariables":
        setPrefilledVariables((prev) => ({ ...prev, ...data.variables }));
        break;
      case "unmount":
        unmountBubble();
        break;
      case "reload":
        reloadBot();
        break;
    }
  };

  const openBot = () => {
    bubbleProps.onOpen?.();
    if (isControlled()) return;
    setHasOpenedOnce(true);
    hidePreviewMessage();
    setBubbleLifecycle("open");
  };

  const closeBot = () => {
    bubbleProps.onClose?.();
    if (isControlled()) return;
    setBubbleLifecycle("closed");
    removeBotOpenedStateInStorage();
  };

  const toggleBot = () => {
    isOpen() ? closeBot() : openBot();
  };

  const reloadBot = () => {
    setHasOpenedOnce(false);
    setHasOpenedOnce(true);
  };

  const handlePreviewMessageClick = () => {
    bubbleProps.onPreviewMessageClick?.();
    openBot();
  };

  const showPreviewMessage = (
    previewMessage?: Pick<PreviewMessageProps, "avatarUrl" | "message">,
  ) => {
    if (isOpen()) return;
    const previewMessageToSet =
      previewMessage ??
      (bubbleProps.previewMessage
        ? {
            message: bubbleProps.previewMessage.message,
            avatarUrl: bubbleProps.previewMessage.avatarUrl,
          }
        : undefined);
    if (!previewMessageToSet) return;
    setPreviewMessage(previewMessageToSet);
    setIsPreviewMessageOpen(true);
  };

  const hidePreviewMessage = () => {
    setIsPreviewMessageOpen(false);
    bubbleProps.onPreviewMessageDismissed?.();
  };

  const unmountBubble = () => {
    if (isOpen()) {
      closeBot();
      // Wait for close animation
      setTimeout(() => {
        setBubbleLifecycle("unmounted");
      }, 200);
    } else setBubbleLifecycle("unmounted");
  };

  const autoShowIfNeeded = () => {
    /* Restore last state if the visitor already opened or is in payment flow */
    if (getBotOpenedStateFromStorage() || getPaymentInProgressInStorage()) {
      openBot();
    }

    if (isDefined(bubbleProps.autoShowDelay)) {
      setTimeout(openBot, bubbleProps.autoShowDelay);
    }

    const previewAutoDelay = bubbleProps.previewMessage?.autoShowDelay;
    if (isDefined(previewAutoDelay)) {
      setTimeout(showPreviewMessage, previewAutoDelay);
    }
  };

  const handleOnChatStatePersisted = (isPersisted: boolean) => {
    botProps.onChatStatePersisted?.(isPersisted);
    if (isPersisted) setBotOpenedStateInStorage();
  };

  const handleScriptExecutionSuccess = (message: string) => {
    if (
      message === zendeskWebWidgetOpenedMessage ||
      message === chatwootWebWidgetOpenedMessage
    )
      unmountBubble();
    botProps.onScriptExecutionSuccess?.(message);
  };

  let progressBarContainerRef;

  return (
    <Show when={bubbleLifecycle() !== "unmounted"}>
      <EnvironmentProvider
        value={document.querySelector("typebot-bubble")?.shadowRoot as Node}
      >
        <style>
          {typebotColors}
          {styles}
        </style>
        {/* Needed for progress bar with fixed position we need to be outside of fixed bubble container */}
        <div ref={progressBarContainerRef} />
        <div
          class={cx(
            bubbleProps.theme?.position === "static"
              ? "relative"
              : "z-[424242] fixed bottom-[var(--container-bottom)] right-5",
            bubbleProps.theme?.placement === "left" && "left-5",
          )}
          style={{
            "--container-bottom": defaultBottom,
            "--button-gap": buttonBotGap,
            "--button-size": resolveButtonSize(
              bubbleProps.theme?.button?.size ?? "medium",
              { isHidden: bubbleProps.theme?.button?.isHidden },
            ),
            "--bot-bg-color": bubbleProps.theme?.chatWindow?.backgroundColor,
            "--bot-max-width":
              bubbleProps.theme?.chatWindow?.maxWidth ?? "400px",
            "--bot-max-height":
              bubbleProps.theme?.chatWindow?.maxHeight ?? "704px",
            "--container-border-radius": "7px",
            ...bubbleProps.inlineStyle,
          }}
        >
          <Show when={isPreviewMessageOpen()}>
            <PreviewMessage
              {...previewMessage()}
              placement={bubbleProps.theme?.placement}
              previewMessageTheme={bubbleProps.theme?.previewMessage}
              onClick={handlePreviewMessageClick}
              onCloseClick={hidePreviewMessage}
            />
          </Show>
          <Show when={!bubbleProps.theme?.button?.isHidden}>
            <BubbleButton
              {...bubbleProps.theme?.button}
              placement={bubbleProps.theme?.placement}
              toggleBot={toggleBot}
              isBotOpen={isOpen()}
            />
          </Show>
          <div
            part="bot"
            style={{
              transition:
                "transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out",
              "transform-origin":
                bubbleProps.theme?.placement === "left"
                  ? "bottom left"
                  : "bottom right",
              transform: isOpen() ? "scale3d(1, 1, 1)" : "scale3d(0, 0, 1)",
            }}
            class={cx(
              "absolute rounded-lg max-h-[calc(100dvh-var(--container-bottom)-var(--button-gap)-var(--button-size))] shadow-lg bg-[var(--bot-bg-color)] h-[var(--bot-max-height)] max-w-[var(--bot-max-width)] overflow-hidden",
              isOpen() ? "opacity-1" : "opacity-0 pointer-events-none",
              bubbleProps.theme?.placement === "left"
                ? "sm:left-0 -left-5"
                : "sm:right-0 -right-5",
              bubbleProps.theme?.button?.isHidden
                ? "bottom-0 ml-2 sm:ml-0 w-[calc(100vw-16px)] sm:w-screen"
                : "bottom-[calc(100%+var(--button-gap))] w-screen",
            )}
          >
            <Show when={hasOpenedOnce()}>
              <Bot
                {...botProps}
                onScriptExecutionSuccess={handleScriptExecutionSuccess}
                onChatStatePersisted={handleOnChatStatePersisted}
                prefilledVariables={prefilledVariables()}
              />
            </Show>
          </div>
        </div>
      </EnvironmentProvider>
    </Show>
  );
};
