import type {
  BotContext,
  ChatChunk as ChatChunkType,
  InputSubmitContent,
} from "@/types";
import { isMobile } from "@/utils/isMobileSignal";
import type { ContinueChatResponse } from "@typebot.io/bot-engine/schemas/api";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import {
  defaultGuestAvatarIsEnabled,
  defaultHostAvatarIsEnabled,
} from "@typebot.io/theme/constants";
import type { Theme } from "@typebot.io/theme/schemas";
import { For, Show, createSignal, onMount } from "solid-js";
import { InputChatBlock } from "../InputChatBlock";
import { HostBubble } from "../bubbles/HostBubble";
import { StreamingBubble } from "../bubbles/StreamingBubble";
import { AvatarSideContainer } from "./AvatarSideContainer";

type Props = Pick<ContinueChatResponse, "messages" | "input"> & {
  theme: Theme;
  settings: Settings;
  index: number;
  context: BotContext;
  hasError: boolean;
  hideAvatar: boolean;
  streamingMessageId: ChatChunkType["streamingMessageId"];
  isTransitionDisabled?: boolean;
  onNewBubbleDisplayed: (blockId: string) => Promise<void>;
  onScrollToBottom: (ref?: HTMLDivElement, offset?: number) => void;
  onSubmit: (answer?: InputSubmitContent) => void;
  onSkip: () => void;
  onAllBubblesDisplayed: () => void;
};

export const ChatChunk = (props: Props) => {
  let inputRef: HTMLDivElement | undefined;
  const [displayedMessageIndex, setDisplayedMessageIndex] = createSignal(
    props.isTransitionDisabled ? props.messages.length : 0,
  );
  const [lastBubble, setLastBubble] = createSignal<HTMLDivElement>();

  onMount(() => {
    if (props.streamingMessageId) return;
    if (props.messages.length === 0) {
      props.onAllBubblesDisplayed();
    }
    props.onScrollToBottom(inputRef, 50);
  });

  const displayNextMessage = async (bubbleRef?: HTMLDivElement) => {
    if (
      (props.settings.typingEmulation?.delayBetweenBubbles ??
        defaultSettings.typingEmulation.delayBetweenBubbles) > 0 &&
      displayedMessageIndex() < props.messages.length - 1
    ) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          (props.settings.typingEmulation?.delayBetweenBubbles ??
            defaultSettings.typingEmulation.delayBetweenBubbles) * 1000,
        ),
      );
    }
    const lastBubbleBlockId = props.messages[displayedMessageIndex()]!.id;
    await props.onNewBubbleDisplayed(lastBubbleBlockId);
    setDisplayedMessageIndex(
      displayedMessageIndex() === props.messages.length
        ? displayedMessageIndex()
        : displayedMessageIndex() + 1,
    );
    props.onScrollToBottom(bubbleRef);
    if (displayedMessageIndex() === props.messages.length) {
      setLastBubble(bubbleRef);
      props.onAllBubblesDisplayed();
    }
  };

  return (
    <div class="flex flex-col w-full min-w-0 gap-2 typebot-chat-chunk">
      <Show when={props.messages.length > 0}>
        <div class={"flex" + (isMobile() ? " gap-1" : " gap-2")}>
          <Show
            when={
              (props.theme.chat?.hostAvatar?.isEnabled ??
                defaultHostAvatarIsEnabled) &&
              props.messages.length > 0
            }
          >
            <AvatarSideContainer
              hostAvatarSrc={props.theme.chat?.hostAvatar?.url}
              hideAvatar={props.hideAvatar}
              isTransitionDisabled={props.isTransitionDisabled}
            />
          </Show>

          <div
            class="flex flex-col flex-1 gap-2"
            style={{
              "max-width":
                (props.theme.chat?.guestAvatar?.isEnabled ??
                defaultGuestAvatarIsEnabled)
                  ? isMobile()
                    ? "calc(100% - 60px)"
                    : "calc(100% - 48px - 48px)"
                  : "100%",
            }}
          >
            <For each={props.messages.slice(0, displayedMessageIndex() + 1)}>
              {(message, idx) => (
                <HostBubble
                  message={message}
                  typingEmulation={props.settings.typingEmulation}
                  isTypingSkipped={
                    (props.settings.typingEmulation?.isDisabledOnFirstMessage ??
                      defaultSettings.typingEmulation
                        .isDisabledOnFirstMessage) &&
                    props.index === 0 &&
                    idx() === 0
                  }
                  onTransitionEnd={
                    props.isTransitionDisabled ? undefined : displayNextMessage
                  }
                  onCompleted={props.onSubmit}
                />
              )}
            </For>
          </div>
        </div>
      </Show>
      {props.input && displayedMessageIndex() === props.messages.length && (
        <InputChatBlock
          ref={inputRef}
          block={props.input}
          chunkIndex={props.index}
          hasHostAvatar={
            props.theme.chat?.hostAvatar?.isEnabled ??
            defaultHostAvatarIsEnabled
          }
          guestAvatar={props.theme.chat?.guestAvatar}
          context={props.context}
          isInputPrefillEnabled={
            props.settings.general?.isInputPrefillEnabled ??
            defaultSettings.general.isInputPrefillEnabled
          }
          hasError={props.hasError}
          onTransitionEnd={() => props.onScrollToBottom(lastBubble())}
          onSubmit={props.onSubmit}
          onSkip={props.onSkip}
        />
      )}
      <Show when={props.streamingMessageId} keyed>
        {(streamingMessageId) => (
          <div class={"flex" + (isMobile() ? " gap-1" : " gap-2")}>
            <Show
              when={
                props.theme.chat?.hostAvatar?.isEnabled ??
                defaultHostAvatarIsEnabled
              }
            >
              <AvatarSideContainer
                hostAvatarSrc={props.theme.chat?.hostAvatar?.url}
                hideAvatar={props.hideAvatar}
              />
            </Show>

            <div
              class="flex flex-col flex-1 gap-2"
              style={{
                "max-width":
                  (props.theme.chat?.guestAvatar?.isEnabled ??
                  defaultGuestAvatarIsEnabled)
                    ? isMobile()
                      ? "calc(100% - 60px)"
                      : "calc(100% - 48px - 48px)"
                    : "100%",
              }}
            >
              <StreamingBubble
                streamingMessageId={streamingMessageId}
                context={props.context}
              />
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};
