import { useTranslate } from "@tolgee/react";
import { defaultImageBubbleContent } from "@typebot.io/blocks-bubbles/image/constants";
import type { ImageBubbleBlock } from "@typebot.io/blocks-bubbles/image/schema";
import { isDefined, isNotEmpty } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useState } from "react";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";

type Props = {
  uploadFileProps: FilePathUploadProps;
  block: ImageBubbleBlock;
  onContentChange: (content: ImageBubbleBlock["content"]) => void;
};

export const ImageBubbleSettings = ({
  uploadFileProps,
  block,
  onContentChange,
}: Props) => {
  const { t } = useTranslate();
  const [showClickLinkInput, setShowClickLinkInput] = useState(
    isNotEmpty(block.content?.clickLink?.url),
  );

  const updateImage = (url: string) => {
    onContentChange({ ...block.content, url });
  };

  const updateClickLinkUrl = (url: string) => {
    onContentChange({
      ...block.content,
      clickLink: { ...block.content?.clickLink, url },
    });
  };

  const updateClickLinkAltText = (alt: string) => {
    onContentChange({
      ...block.content,
      clickLink: { ...block.content?.clickLink, alt },
    });
  };

  const toggleClickLink = () => {
    if (isDefined(block.content?.clickLink) && showClickLinkInput) {
      onContentChange({ ...block.content, clickLink: undefined });
    }
    setShowClickLinkInput(!showClickLinkInput);
  };

  return (
    <div className="flex flex-col gap-4">
      <ImageUploadContent
        uploadFileProps={uploadFileProps}
        defaultUrl={block.content?.url}
        onSubmit={updateImage}
        additionalTabs={{
          giphy: true,
          unsplash: true,
          icon: true,
        }}
      />
      <div className="flex flex-col gap-2">
        <Field.Root className="flex-row items-center">
          <Switch
            checked={showClickLinkInput}
            onCheckedChange={toggleClickLink}
          />
          <Field.Label>
            {t("editor.blocks.bubbles.image.switchWithLabel.onClick.label")}
          </Field.Label>
        </Field.Root>
        {showClickLinkInput && (
          <>
            <DebouncedTextInputWithVariablesButton
              autoFocus
              placeholder="https://example.com"
              onValueChange={updateClickLinkUrl}
              defaultValue={block.content?.clickLink?.url}
            />
            <DebouncedTextInputWithVariablesButton
              placeholder={t(
                "editor.blocks.bubbles.image.switchWithLabel.onClick.placeholder",
              )}
              onValueChange={updateClickLinkAltText}
              defaultValue={
                block.content?.clickLink?.alt ??
                defaultImageBubbleContent.clickLink.alt
              }
            />
          </>
        )}
      </div>
    </div>
  );
};
