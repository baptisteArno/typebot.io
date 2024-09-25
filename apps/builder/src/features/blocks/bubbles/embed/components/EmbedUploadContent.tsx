import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { NumberInput, TextInput } from "@/components/inputs";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultEmbedBubbleContent } from "@typebot.io/blocks-bubbles/embed/constants";
import type { EmbedBubbleBlock } from "@typebot.io/blocks-bubbles/embed/schema";
import { sanitizeUrl } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";

type Props = {
  content: EmbedBubbleBlock["content"];
  onSubmit: (content: EmbedBubbleBlock["content"]) => void;
};

export const EmbedUploadContent = ({ content, onSubmit }: Props) => {
  const { t } = useTranslate();
  const handleUrlChange = (url: string) => {
    const iframeUrl = sanitizeUrl(
      url.trim().startsWith("<iframe") ? extractUrlFromIframe(url) : url,
    );
    onSubmit({ ...content, url: iframeUrl });
  };

  const handleHeightChange = (
    height?: NonNullable<EmbedBubbleBlock["content"]>["height"],
  ) => height && onSubmit({ ...content, height });

  const updateWaitEventName = (name: string) =>
    onSubmit({ ...content, waitForEvent: { ...content?.waitForEvent, name } });

  const updateWaitForEventEnabled = (isEnabled: boolean) =>
    onSubmit({
      ...content,
      waitForEvent: { ...content?.waitForEvent, isEnabled },
    });

  const updateSaveDataInVariableId = (variable?: Pick<Variable, "id">) =>
    onSubmit({
      ...content,
      waitForEvent: {
        ...content?.waitForEvent,
        saveDataInVariableId: variable?.id,
      },
    });

  return (
    <Stack p="2" spacing={6}>
      <Stack>
        <TextInput
          placeholder={t(
            "editor.blocks.bubbles.embed.settings.worksWith.placeholder",
          )}
          defaultValue={content?.url ?? ""}
          onChange={handleUrlChange}
        />
        <Text fontSize="sm" color="gray.400" textAlign="center">
          {t("editor.blocks.bubbles.embed.settings.worksWith.text")}
        </Text>
      </Stack>

      <NumberInput
        label="Height:"
        defaultValue={content?.height ?? defaultEmbedBubbleContent.height}
        onValueChange={handleHeightChange}
        suffix={t("editor.blocks.bubbles.embed.settings.numberInput.unit")}
        direction="row"
      />
      <SwitchWithRelatedSettings
        label="Wait for event?"
        initialValue={content?.waitForEvent?.isEnabled ?? false}
        onCheckChange={updateWaitForEventEnabled}
      >
        <TextInput
          direction="row"
          label="Name:"
          defaultValue={content?.waitForEvent?.name}
          onChange={updateWaitEventName}
        />
        <VariableSearchInput
          onSelectVariable={updateSaveDataInVariableId}
          initialVariableId={content?.waitForEvent?.saveDataInVariableId}
          label="Save data in variable"
        />
      </SwitchWithRelatedSettings>
    </Stack>
  );
};

const extractUrlFromIframe = (iframe: string) =>
  [...iframe.matchAll(/src="([^"]+)"/g)][0][1];
