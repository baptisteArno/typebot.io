import { useTranslate } from "@tolgee/react";
import { defaultAudioBubbleContent } from "@typebot.io/blocks-bubbles/audio/constants";
import type { AudioBubbleBlock } from "@typebot.io/blocks-bubbles/audio/schema";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useState } from "react";
import { UploadButton } from "@/components/ImageUploadContent/UploadButton";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";

type Props = {
  uploadFileProps: FilePathUploadProps;
  content: AudioBubbleBlock["content"];
  onContentChange: (content: AudioBubbleBlock["content"]) => void;
};

export const AudioBubbleForm = ({
  uploadFileProps,
  content,
  onContentChange,
}: Props) => {
  const { t } = useTranslate();
  const [currentTab, setCurrentTab] = useState<"link" | "upload">("link");

  const updateUrl = (url: string) => onContentChange({ ...content, url });

  const updateAutoPlay = (isAutoplayEnabled: boolean) =>
    onContentChange({ ...content, isAutoplayEnabled });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant={currentTab === "upload" ? "outline" : "ghost"}
          onClick={() => setCurrentTab("upload")}
          size="sm"
        >
          {t("editor.blocks.bubbles.audio.settings.upload.label")}
        </Button>
        <Button
          variant={currentTab === "link" ? "outline" : "ghost"}
          onClick={() => setCurrentTab("link")}
          size="sm"
        >
          {t("editor.blocks.bubbles.audio.settings.embedLink.label")}
        </Button>
      </div>
      <div className="flex flex-col p-2 gap-4">
        <div className="flex flex-col gap-2">
          {currentTab === "upload" && (
            <div className="flex justify-center py-2">
              <UploadButton
                fileType="audio"
                filePathProps={uploadFileProps}
                onFileUploaded={updateUrl}
              >
                {t("editor.blocks.bubbles.audio.settings.chooseFile.label")}
              </UploadButton>
            </div>
          )}
          {currentTab === "link" && (
            <>
              <DebouncedTextInputWithVariablesButton
                placeholder={t(
                  "editor.blocks.bubbles.audio.settings.worksWith.placeholder",
                )}
                defaultValue={content?.url ?? ""}
                onValueChange={updateUrl}
              />
              <p className="text-sm text-center" color="gray.400">
                {t("editor.blocks.bubbles.audio.settings.worksWith.text")}
              </p>
            </>
          )}
        </div>
        <Field.Root>
          <Field.Label>
            {t("editor.blocks.bubbles.audio.settings.autoplay.label")}
          </Field.Label>
          <Switch
            checked={
              content?.isAutoplayEnabled ??
              defaultAudioBubbleContent.isAutoplayEnabled
            }
            onCheckedChange={updateAutoPlay}
          />
        </Field.Root>
      </div>
    </div>
  );
};
