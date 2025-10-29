import { useTranslate } from "@tolgee/react";
import { defaultVideoBubbleContent } from "@typebot.io/blocks-bubbles/video/constants";
import type { VideoBubbleBlock } from "@typebot.io/blocks-bubbles/video/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";

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
      <div className="flex flex-col gap-2 py-2">
        <DebouncedTextInputWithVariablesButton
          placeholder={t("video.urlInput.placeholder")}
          defaultValue={content?.url ?? ""}
          onValueChange={updateUrl}
        />
        <p className="text-xs text-center" color="gray.400">
          {t("video.urlInput.helperText")}
        </p>
      </div>
      {content?.url && (
        <div className="flex flex-col gap-2">
          <Field.Root className="flex-row items-center">
            <Field.Label>
              {t("video.aspectRatioInput.label")}
              <MoreInfoTooltip>
                {t("video.aspectRatioInput.moreInfoTooltip")}
              </MoreInfoTooltip>
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={
                content?.aspectRatio ?? defaultVideoBubbleContent.aspectRatio
              }
              onValueChange={updateAspectRatio}
            />
          </Field.Root>
          <Field.Root className="flex-row items-center">
            <Field.Label>
              {t("video.maxWidthInput.label")}
              <MoreInfoTooltip>
                {t("video.maxWidthInput.moreInfoTooltip")}
              </MoreInfoTooltip>
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={
                content?.maxWidth ?? defaultVideoBubbleContent.maxWidth
              }
              onValueChange={updateMaxWidth}
            />
          </Field.Root>
        </div>
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
