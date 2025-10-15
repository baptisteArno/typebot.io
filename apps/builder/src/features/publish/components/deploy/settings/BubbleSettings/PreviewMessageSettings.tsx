import { HStack, Input, Stack, Text } from "@chakra-ui/react";
import type { PreviewMessageParams } from "@typebot.io/js";
import { isDefined } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useState } from "react";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";

type Props = {
  defaultAvatar: string;
  onChange: (newPreviewMessage?: PreviewMessageParams) => void;
};

export const PreviewMessageSettings = ({ defaultAvatar, onChange }: Props) => {
  const [isPreviewMessageEnabled, setIsPreviewMessageEnabled] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<PreviewMessageParams>();
  const [autoShowDelay, setAutoShowDelay] = useState(10);

  const [isAutoShowEnabled, setIsAutoShowEnabled] = useState(false);

  const updatePreviewMessage = (previewMessage: PreviewMessageParams) => {
    setPreviewMessage(previewMessage);
    onChange(previewMessage);
  };

  const updateAutoShowDelay = (autoShowDelay?: number) => {
    setAutoShowDelay(autoShowDelay ?? 0);
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? "",
      autoShowDelay,
    });
  };

  const updateAvatarUrl = (avatarUrl: string) => {
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? "",
      avatarUrl,
    });
  };

  const updateMessage = (message: string) => {
    updatePreviewMessage({ ...previewMessage, message });
  };

  const updatePreviewMessageCheck = (isChecked: boolean) => {
    setIsPreviewMessageEnabled(isChecked);
    const newPreviewMessage = {
      autoShowDelay: isAutoShowEnabled ? autoShowDelay : undefined,
      message: previewMessage?.message ?? "I have a question for you!",
      avatarUrl: previewMessage?.avatarUrl ?? defaultAvatar,
    };
    if (isChecked) setPreviewMessage(newPreviewMessage);
    onChange(isChecked ? newPreviewMessage : undefined);
  };

  const updateAutoShowDelayCheck = (isChecked: boolean) => {
    setIsAutoShowEnabled(isChecked);
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? "",

      autoShowDelay: isChecked ? autoShowDelay : undefined,
    });
  };

  return (
    <Stack spacing={4}>
      <Field.Root className="flex-row justify-between">
        <Field.Label>Preview message</Field.Label>
        <Switch
          checked={isPreviewMessageEnabled}
          onCheckedChange={updatePreviewMessageCheck}
        />
      </Field.Root>
      {isPreviewMessageEnabled && (
        <Stack pl="4" spacing={4}>
          <HStack justify="space-between">
            <Text>Avatar URL</Text>
            <Input
              onChange={(e) => updateAvatarUrl(e.target.value)}
              value={previewMessage?.avatarUrl}
              placeholder={"Paste image link (.png, .jpg)"}
            />
          </HStack>
          <HStack justify="space-between">
            <Text>Message</Text>
            <Input
              onChange={(e) => updateMessage(e.target.value)}
              value={previewMessage?.message}
            />
          </HStack>
          <HStack>
            <Text>Auto show</Text>
            <Switch
              checked={isAutoShowEnabled}
              onCheckedChange={updateAutoShowDelayCheck}
            />
            {isAutoShowEnabled && (
              <>
                <Text>After</Text>
                <BasicNumberInput
                  className="max-w-40"
                  defaultValue={autoShowDelay}
                  onValueChange={(val) =>
                    isDefined(val) && updateAutoShowDelay(val)
                  }
                  withVariableButton={false}
                />
                <Text>seconds</Text>
              </>
            )}
          </HStack>
        </Stack>
      )}
    </Stack>
  );
};
