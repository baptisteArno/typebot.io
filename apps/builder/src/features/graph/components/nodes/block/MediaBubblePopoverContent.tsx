import { AudioBubbleForm } from "@/features/blocks/bubbles/audio/components/AudioBubbleForm";
import { EmbedBubbleSettings } from "@/features/blocks/bubbles/embed/components/EmbedBubbleSettings";
import { ImageBubbleSettings } from "@/features/blocks/bubbles/image/components/ImageBubbleSettings";
import { VideoUploadContent } from "@/features/blocks/bubbles/video/components/VideoUploadContent";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type {
  BubbleBlock,
  BubbleBlockContent,
} from "@typebot.io/blocks-bubbles/schema";
import type { TextBubbleBlock } from "@typebot.io/blocks-bubbles/text/schema";
import { Popover } from "@typebot.io/ui/components/Popover";
import { cx } from "@typebot.io/ui/lib/cva";

type Props = {
  uploadFileProps: FilePathUploadProps;
  block: Exclude<BubbleBlock, TextBubbleBlock>;
  side?: "left" | "right" | "top" | "bottom";
  onContentChange: (content: BubbleBlockContent) => void;
};

export const MediaBubblePopoverContent = (props: Props) => {
  return (
    <Popover.Popup
      className={cx(
        "p-4",
        props.block.type === BubbleBlockType.IMAGE ? "w-[500px]" : "w-[400px]",
      )}
      side={props.side}
    >
      <MediaBubbleContent {...props} />
    </Popover.Popup>
  );
};

export const MediaBubbleContent = ({
  uploadFileProps,
  block,
  onContentChange,
}: Props) => {
  switch (block.type) {
    case BubbleBlockType.IMAGE: {
      return (
        <ImageBubbleSettings
          uploadFileProps={uploadFileProps}
          block={block}
          onContentChange={onContentChange}
        />
      );
    }
    case BubbleBlockType.VIDEO: {
      return (
        <VideoUploadContent
          content={block.content}
          onSubmit={onContentChange}
        />
      );
    }
    case BubbleBlockType.EMBED: {
      return (
        <EmbedBubbleSettings
          content={block.content}
          onSubmit={onContentChange}
        />
      );
    }
    case BubbleBlockType.AUDIO: {
      return (
        <AudioBubbleForm
          content={block.content}
          uploadFileProps={uploadFileProps}
          onContentChange={onContentChange}
        />
      );
    }
  }
};
