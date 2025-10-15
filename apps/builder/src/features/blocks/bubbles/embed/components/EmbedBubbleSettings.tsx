import { Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultEmbedBubbleContent } from "@typebot.io/blocks-bubbles/embed/constants";
import type { EmbedBubbleBlock } from "@typebot.io/blocks-bubbles/embed/schema";
import { sanitizeUrl } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  content: EmbedBubbleBlock["content"];
  onSubmit: (content: EmbedBubbleBlock["content"]) => void;
};

export const EmbedBubbleSettings = ({ content, onSubmit }: Props) => {
  const { t } = useTranslate();
  const handleUrlChange = (url: string) => {
    const iframeUrl = sanitizeUrl(
      url.trim().startsWith("<iframe") ? extractUrlFromIframe(url) : url,
    );
    onSubmit({ ...content, url: iframeUrl });
  };

  const handleHeightChange = (
    height?: NonNullable<EmbedBubbleBlock["content"]>["height"],
  ) => onSubmit({ ...content, height });

  const updateWaitEventName = (name: string) =>
    onSubmit({ ...content, waitForEvent: { ...content?.waitForEvent, name } });

  const updateWaitForEventEnabled = (isEnabled: boolean) =>
    onSubmit({
      ...content,
      waitForEvent: { ...content?.waitForEvent, isEnabled },
    });

  const updateSaveDataInVariableId = (variable?: Pick<Variable, "id">) => {
    onSubmit({
      ...content,
      waitForEvent: {
        ...content?.waitForEvent,
        saveDataInVariableId: variable?.id,
      },
    });
  };

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

      <Field.Root className="inline-flex flex-row items-center">
        <Field.Label>Height</Field.Label>
        <BasicNumberInput
          min={0}
          step={30}
          defaultValue={content?.height ?? defaultEmbedBubbleContent.height}
          onValueChange={handleHeightChange}
        />
        {t("editor.blocks.bubbles.embed.settings.numberInput.unit")}
      </Field.Root>

      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={content?.waitForEvent?.isEnabled ?? false}
            onCheckedChange={updateWaitForEventEnabled}
          />
          <Field.Label>Wait for event?</Field.Label>
        </Field.Root>
        {content?.waitForEvent?.isEnabled ??
          (false && (
            <>
              <TextInput
                direction="row"
                label="Name:"
                defaultValue={content?.waitForEvent?.name}
                onChange={updateWaitEventName}
              />
              <Field.Root>
                <Field.Label>Save data in variable</Field.Label>
                <VariablesCombobox
                  onSelectVariable={updateSaveDataInVariableId}
                  initialVariableId={
                    content?.waitForEvent?.saveDataInVariableId
                  }
                />
              </Field.Root>
            </>
          ))}
      </Field.Container>
    </Stack>
  );
};

const extractUrlFromIframe = (iframe: string) =>
  [...iframe.matchAll(/src="([^"]+)"/g)][0][1];
