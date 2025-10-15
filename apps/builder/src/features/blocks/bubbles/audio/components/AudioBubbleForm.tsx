import { Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultAudioBubbleContent } from "@typebot.io/blocks-bubbles/audio/constants";
import type { AudioBubbleBlock } from "@typebot.io/blocks-bubbles/audio/schema";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useState } from "react";
import { UploadButton } from "@/components/ImageUploadContent/UploadButton";
import { TextInput } from "@/components/inputs/TextInput";
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
    <Stack>
      <HStack>
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
      </HStack>
      <Stack p="2" spacing={4}>
        <Stack>
          {currentTab === "upload" && (
            <Flex justify="center" py="2">
              <UploadButton
                fileType="audio"
                filePathProps={uploadFileProps}
                onFileUploaded={updateUrl}
              >
                {t("editor.blocks.bubbles.audio.settings.chooseFile.label")}
              </UploadButton>
            </Flex>
          )}
          {currentTab === "link" && (
            <>
              <TextInput
                placeholder={t(
                  "editor.blocks.bubbles.audio.settings.worksWith.placeholder",
                )}
                defaultValue={content?.url ?? ""}
                onChange={updateUrl}
              />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {t("editor.blocks.bubbles.audio.settings.worksWith.text")}
              </Text>
            </>
          )}
        </Stack>
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
      </Stack>
    </Stack>
  );
};
