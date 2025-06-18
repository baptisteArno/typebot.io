import type {
  BotContext,
  ChatChunk as ChatChunkType,
  InputSubmitContent,
} from "@/types";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import {
  defaultGuestAvatarIsEnabled,
  defaultHostAvatarIsEnabled,
} from "@typebot.io/theme/constants";
import type { Theme } from "@typebot.io/theme/schemas";
import { cx } from "@typebot.io/ui/lib/cva";
import { For, Show, createSignal, onMount } from "solid-js";
import { InputChatBlock } from "../InputChatBlock";
import { HostBubble } from "../bubbles/HostBubble";
import { StreamingBubble } from "../bubbles/StreamingBubble";
import { AvatarSideContainer } from "./AvatarSideContainer";

type Props = Pick<ChatChunkType, "messages" | "input" | "streamingMessage"> & {
  theme: Theme;
  settings: Settings;
  index: number;
  context: BotContext;
  hideAvatar: boolean;
  isTransitionDisabled?: boolean;
  onNewBubbleDisplayed: (blockId: string) => Promise<void>;
  onScrollToBottom: ({
    lastElement,
    offset,
  }: {
    lastElement?: HTMLDivElement;
    offset?: number;
  }) => void;
  onSubmit: (answer?: InputSubmitContent) => void;
  onSkip: (label: string) => void;
  onAllBubblesDisplayed: () => void;
};

export const ChatChunk = (props: Props) => {
  let inputRef: HTMLDivElement | undefined;
  const [displayedMessageIndex, setDisplayedMessageIndex] = createSignal(
    props.isTransitionDisabled ? props.messages.length : 0,
  );
  const [lastBubble, setLastBubble] = createSignal<HTMLDivElement>();

  onMount(() => {
    if (props.streamingMessage) return;
    if (props.messages.length === 0) {
      props.onAllBubblesDisplayed();
    }
    props.onScrollToBottom({ lastElement: inputRef, offset: 50 });
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
    props.onScrollToBottom({ lastElement: bubbleRef });
    if (displayedMessageIndex() === props.messages.length) {
      setLastBubble(bubbleRef);
      props.onAllBubblesDisplayed();
    }
  };

  return (
    <div class="flex flex-col w-full min-w-0 gap-2 typebot-chat-chunk">
      <Show when={props.messages.length > 0}>
        <div class="flex gap-1 @xs:gap-2">
          <Show
            when={
              (props.theme.chat?.hostAvatar?.isEnabled ??
                defaultHostAvatarIsEnabled) &&
              props.messages.length > 0
            }
          >
            <AvatarSideContainer
              hideAvatar={props.hideAvatar}
              isTransitionDisabled={props.isTransitionDisabled}
              theme={props.theme}
            />
          </Show>

          <div
            class={cx(
              "flex flex-col flex-1 gap-2",
              (props.theme.chat?.guestAvatar?.isEnabled ??
                defaultGuestAvatarIsEnabled)
                ? "max-w-[calc(100%-60px)] sm:max-w-[calc(100%-48px-48px)]"
                : "max-w-full",
            )}
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
      <Show
        when={
          props.input &&
          displayedMessageIndex() === props.messages.length &&
          !props.input.isHidden
        }
      >
        <InputChatBlock
          ref={inputRef}
          input={props.input!}
          chunkIndex={props.index}
          theme={props.theme}
          context={props.context}
          isInputPrefillEnabled={
            props.settings.general?.isInputPrefillEnabled ??
            defaultSettings.general.isInputPrefillEnabled
          }
          onTransitionEnd={() =>
            props.onScrollToBottom({ lastElement: lastBubble() })
          }
          onSubmit={props.onSubmit}
          onSkip={props.onSkip}
        />
      </Show>
      <Show when={props.streamingMessage}>
        <div class="flex gap-1 @xs:gap-2">
          <Show
            when={
              props.theme.chat?.hostAvatar?.isEnabled ??
              defaultHostAvatarIsEnabled
            }
          >
            <AvatarSideContainer
              hideAvatar={props.hideAvatar}
              theme={props.theme}
            />
          </Show>

          <div
            class={cx(
              "flex flex-col flex-1 gap-2",
              (props.theme.chat?.guestAvatar?.isEnabled ??
                defaultGuestAvatarIsEnabled)
                ? "max-w-[calc(100%-60px)] sm:max-w-[calc(100%-48px-48px)]"
                : "max-w-full",
            )}
          >
            <StreamingBubble content={props.streamingMessage!} />
          </div>
        </div>
      </Show>
    </div>
  );
};
