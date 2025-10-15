import { Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultVideoBubbleContent } from "@typebot.io/blocks-bubbles/video/constants";
import type { VideoBubbleBlock } from "@typebot.io/blocks-bubbles/video/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { TextInput } from "@/components/inputs/TextInput";

export const VideoLinkEmbedContent = ({
  content,
  updateUrl,
  onSubmit,
}: {
  content?: VideoBubbleBlock["content"];
  updateUrl: (url: string) => void;
  onSubmit: (content: VideoBubbleBlock["content"]) => void;
}) => {
  const { t } = useTranslate();

  const updateAspectRatio = (aspectRatio?: string) => {
    return onSubmit({
      ...content,
      aspectRatio,
    });
  };

  const updateMaxWidth = (maxWidth?: string) => {
    return onSubmit({
      ...content,
      maxWidth,
    });
  };

  const updateAutoPlay = (isAutoplayEnabled: boolean) => {
    return onSubmit({ ...content, isAutoplayEnabled });
  };

  const updateControlsDisplay = (areControlsDisplayed: boolean) => {
    if (areControlsDisplayed === false) {
      // Make sure autoplay is enabled when video controls are disabled
      return onSubmit({
        ...content,
        isAutoplayEnabled: true,
        areControlsDisplayed,
      });
    }
    return onSubmit({ ...content, areControlsDisplayed });
  };

  return (
    <div className="flex flex-col gap-4">
      <Stack py="2">
        <TextInput
          placeholder={t("video.urlInput.placeholder")}
          defaultValue={content?.url ?? ""}
          onChange={updateUrl}
        />
        <Text fontSize="xs" color="gray.400" textAlign="center">
          {t("video.urlInput.helperText")}
        </Text>
      </Stack>
      {content?.url && (
        <Stack>
          <TextInput
            label={t("video.aspectRatioInput.label")}
            moreInfoTooltip={t("video.aspectRatioInput.moreInfoTooltip")}
            defaultValue={
              content?.aspectRatio ?? defaultVideoBubbleContent.aspectRatio
            }
            onChange={updateAspectRatio}
            direction="row"
          />
          <TextInput
            label={t("video.maxWidthInput.label")}
            moreInfoTooltip={t("video.maxWidthInput.moreInfoTooltip")}
            defaultValue={
              content?.maxWidth ?? defaultVideoBubbleContent.maxWidth
            }
            onChange={updateMaxWidth}
            direction="row"
          />
        </Stack>
      )}
      {content?.url && content?.type === "url" && (
        <Field.Root className="flex-row">
          <Switch
            checked={
              content?.areControlsDisplayed ??
              defaultVideoBubbleContent.areControlsDisplayed
            }
            onCheckedChange={updateControlsDisplay}
          />
          <Field.Label>Display controls</Field.Label>
        </Field.Root>
      )}
      <Field.Root className="flex-row items-center">
        <Switch
          checked={
            content?.isAutoplayEnabled ??
            defaultVideoBubbleContent.isAutoplayEnabled
          }
          disabled={content?.areControlsDisplayed === false}
          onCheckedChange={updateAutoPlay}
        />
        <Field.Label>
          {t("editor.blocks.bubbles.audio.settings.autoplay.label")}
        </Field.Label>
      </Field.Root>
    </div>
  );
};
