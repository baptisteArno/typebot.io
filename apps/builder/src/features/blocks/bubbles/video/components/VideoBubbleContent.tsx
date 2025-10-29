import { useTranslate } from "@tolgee/react";
import {
  embedBaseUrls,
  VideoBubbleContentType,
} from "@typebot.io/blocks-bubbles/video/constants";
import type { VideoBubbleBlock } from "@typebot.io/blocks-bubbles/video/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";

type Props = {
  block: VideoBubbleBlock;
};

export const VideoBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  if (!block.content?.url || !block.content.type)
    return <p color="gray.500">{t("clickToEdit")}</p>;
  const variable = typebot
    ? findUniqueVariable(typebot?.variables)(block.content?.url)
    : null;
  switch (block.content.type) {
    case VideoBubbleContentType.URL:
      return (
        <div
          className={cx("w-full relative", variable ? undefined : "h-[120px]")}
        >
          {variable ? (
            <p>
              Display <VariableTag variableName={variable.name} />
            </p>
          ) : (
            <video
              key={block.content.url}
              controls={block.content?.areControlsDisplayed}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                left: "0",
                top: "0",
                borderRadius: "10px",
              }}
            >
              <source src={block.content.url} />
            </video>
          )}
        </div>
      );
    case VideoBubbleContentType.GUMLET:
    case VideoBubbleContentType.VIMEO:
    case VideoBubbleContentType.YOUTUBE: {
      const baseUrl = embedBaseUrls[block.content.type];
      return (
        <div className="w-full h-[120px] relative">
          <iframe
            src={`${baseUrl}/${block.content.id}`}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              left: "0",
              top: "0",
              borderRadius: "10px",
              pointerEvents: "none",
            }}
          />
        </div>
      );
    }
    case VideoBubbleContentType.TIKTOK: {
      return (
        <div className="w-full h-[300px] relative">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${block.content.id}`}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              left: "0",
              top: "0",
              borderRadius: "10px",
              pointerEvents: "none",
            }}
          />
        </div>
      );
    }
  }
};
