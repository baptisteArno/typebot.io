import { AudioBubble } from "@/features/blocks/bubbles/audio/components/AudioBubble";
import { CustomEmbedBubble } from "@/features/blocks/bubbles/embed/components/CustomEmbedBubble";
import { EmbedBubble } from "@/features/blocks/bubbles/embed/components/EmbedBubble";
import { ImageBubble } from "@/features/blocks/bubbles/image/components/ImageBubble";
import { TextBubble } from "@/features/blocks/bubbles/textBubble/components/TextBubble";
import { VideoBubble } from "@/features/blocks/bubbles/video/components/VideoBubble";
import type { InputSubmitContent } from "@/types";
import type { AudioBubbleBlock } from "@typebot.io/blocks-bubbles/audio/schema";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { EmbedBubbleBlock } from "@typebot.io/blocks-bubbles/embed/schema";
import type { ImageBubbleBlock } from "@typebot.io/blocks-bubbles/image/schema";
import type { TextBubbleBlock } from "@typebot.io/blocks-bubbles/text/schema";
import type { VideoBubbleBlock } from "@typebot.io/blocks-bubbles/video/schema";
import type { ChatMessage } from "@typebot.io/bot-engine/schemas/api";
import type { CustomEmbedBubble as CustomEmbedBubbleProps } from "@typebot.io/bot-engine/schemas/api";
import type { Settings } from "@typebot.io/settings/schemas";
import { Match, Switch } from "solid-js";

type Props = {
  message: ChatMessage;
  typingEmulation: Settings["typingEmulation"];
  isTypingSkipped: boolean;
  onTransitionEnd?: (ref?: HTMLDivElement) => void;
  onCompleted: (reply?: InputSubmitContent) => void;
};

export const HostBubble = (props: Props) => (
  <Switch>
    <Match when={props.message.type === BubbleBlockType.TEXT}>
      <TextBubble
        content={props.message.content as TextBubbleBlock["content"]}
        isTypingSkipped={props.isTypingSkipped}
        typingEmulation={props.typingEmulation}
        onTransitionEnd={props.onTransitionEnd}
      />
    </Match>
    <Match when={props.message.type === BubbleBlockType.IMAGE}>
      <ImageBubble
        content={props.message.content as ImageBubbleBlock["content"]}
        onTransitionEnd={props.onTransitionEnd}
      />
    </Match>
    <Match when={props.message.type === BubbleBlockType.VIDEO}>
      <VideoBubble
        content={props.message.content as VideoBubbleBlock["content"]}
        onTransitionEnd={props.onTransitionEnd}
      />
    </Match>
    <Match when={props.message.type === BubbleBlockType.EMBED}>
      <EmbedBubble
        content={props.message.content as EmbedBubbleBlock["content"]}
        onTransitionEnd={props.onTransitionEnd}
        onCompleted={props.onCompleted}
      />
    </Match>
    <Match when={props.message.type === "custom-embed"}>
      <CustomEmbedBubble
        content={props.message.content as CustomEmbedBubbleProps["content"]}
        onTransitionEnd={props.onTransitionEnd}
        onCompleted={props.onCompleted}
      />
    </Match>
    <Match when={props.message.type === BubbleBlockType.AUDIO}>
      <AudioBubble
        content={props.message.content as AudioBubbleBlock["content"]}
        onTransitionEnd={props.onTransitionEnd}
      />
    </Match>
  </Switch>
);
