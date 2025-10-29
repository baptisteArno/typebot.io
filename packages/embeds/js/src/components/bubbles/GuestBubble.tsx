import { isNotEmpty } from "@typebot.io/lib/utils";
import {
  defaultGuestAvatarIsEnabled,
  defaultHostAvatarIsEnabled,
} from "@typebot.io/theme/constants";
import { isChatContainerLight } from "@typebot.io/theme/helpers/isChatContainerLight";
import type { Theme } from "@typebot.io/theme/schemas";
import { cx } from "@typebot.io/ui/lib/cva";
import { createSignal, For, Match, Show, Switch } from "solid-js";
import { FilePreview } from "@/features/blocks/inputs/fileUpload/components/FilePreview";
import type {
  InputSubmitContent,
  RecordingInputSubmitContent,
  TextInputSubmitContent,
} from "@/types";
import { Avatar } from "../avatars/Avatar";
import { Modal } from "../Modal";

type Props = {
  answer?: InputSubmitContent;
  theme: Theme;
};

export const GuestBubble = (props: Props) => {
  return (
    <div
      class={cx(
        "flex justify-end items-end animate-fade-in gap-2 guest-container",
        (props.theme.chat?.hostAvatar?.isEnabled ??
          defaultHostAvatarIsEnabled) &&
          "ml-7 @xs:ml-[50px]",
      )}
    >
      <Switch>
        <Match when={props.answer?.type === "text"}>
          <TextGuestBubble answer={props.answer as TextInputSubmitContent} />
        </Match>
        <Match when={props.answer?.type === "recording"}>
          <AudioGuestBubble
            answer={props.answer as RecordingInputSubmitContent}
          />
        </Match>
      </Switch>

      <Show
        when={
          props.theme.chat?.guestAvatar?.isEnabled ??
          defaultGuestAvatarIsEnabled
        }
      >
        <Avatar
          src={props.theme.chat?.guestAvatar?.url}
          isChatContainerLight={isChatContainerLight({
            chatContainer: props.theme.chat?.container,
            generalBackground: props.theme.general?.background,
          })}
        />
      </Show>
    </div>
  );
};

const TextGuestBubble = (props: { answer: TextInputSubmitContent }) => {
  const [clickedImageSrc, setClickedImageSrc] = createSignal<string>();

  return (
    <div class="flex flex-col gap-1 items-end">
      <Show when={(props.answer.attachments ?? []).length > 0}>
        <div class="flex gap-1 overflow-auto max-w-[350px] flex-wrap justify-end @xs:items-center @xs:flex-nowrap">
          <For
            each={props.answer.attachments?.filter((attachment) =>
              attachment.type.startsWith("image"),
            )}
          >
            {(attachment, idx) => (
              <img
                src={attachment.blobUrl ?? attachment.url}
                alt={`Attached image ${idx() + 1}`}
                class={cx(
                  "typebot-guest-bubble-image-attachment cursor-pointer",
                  props.answer.attachments!.filter((attachment) =>
                    attachment.type.startsWith("image"),
                  ).length > 1 && "max-w-[90%]",
                )}
                onClick={() =>
                  setClickedImageSrc(attachment.blobUrl ?? attachment.url)
                }
              />
            )}
          </For>
        </div>
        <div class="flex gap-1 overflow-auto max-w-[350px] flex-wrap justify-end @xs:items-center @xs:flex-nowrap">
          <For
            each={props.answer.attachments?.filter(
              (attachment) => !attachment.type.startsWith("image"),
            )}
          >
            {(attachment) => (
              <FilePreview
                file={{
                  name: attachment.url.split("/").at(-1)!,
                }}
              />
            )}
          </For>
        </div>
      </Show>
      <div
        class="p-px whitespace-pre-wrap max-w-full typebot-guest-bubble flex flex-col"
        data-testid="guest-bubble"
      >
        <Show when={isNotEmpty(props.answer.label ?? props.answer.value)}>
          <span class="px-[15px] py-[7px]">
            {props.answer.label ?? props.answer.value}
          </span>
        </Show>
      </div>
      <Modal
        isOpen={clickedImageSrc() !== undefined}
        onClose={() => setClickedImageSrc(undefined)}
      >
        <img
          src={clickedImageSrc()}
          alt="Attachment"
          class="max-h-[calc(100vh-1rem)] max-w-[calc(100%-1rem)] rounded-[6px] m-auto"
        />
      </Modal>
    </div>
  );
};

const AudioGuestBubble = (props: { answer: RecordingInputSubmitContent }) => {
  return (
    <div class="flex flex-col gap-1 items-end">
      <div
        class="p-2 w-full whitespace-pre-wrap typebot-guest-bubble flex flex-col"
        data-testid="guest-bubble"
      >
        <audio controls src={props.answer.blobUrl ?? props.answer.url} />
      </div>
    </div>
  );
};
