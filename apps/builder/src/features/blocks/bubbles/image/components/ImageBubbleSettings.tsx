import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultImageBubbleContent } from "@typebot.io/blocks-bubbles/image/constants";
import type { ImageBubbleBlock } from "@typebot.io/blocks-bubbles/image/schema";
import { isDefined, isNotEmpty } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useState } from "react";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { TextInput } from "@/components/inputs/TextInput";
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
    <Stack spacing={4}>
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
      <Stack>
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
            <TextInput
              autoFocus
              placeholder="https://example.com"
              onChange={updateClickLinkUrl}
              defaultValue={block.content?.clickLink?.url}
            />
            <TextInput
              placeholder={t(
                "editor.blocks.bubbles.image.switchWithLabel.onClick.placeholder",
              )}
              onChange={updateClickLinkAltText}
              defaultValue={
                block.content?.clickLink?.alt ??
                defaultImageBubbleContent.clickLink.alt
              }
            />
          </>
        )}
      </Stack>
    </Stack>
  );
};
