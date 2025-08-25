import { ColorPicker } from "@/components/ColorPicker";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useOpenControls } from "@/hooks/useOpenControls";
import { HStack, Heading, Stack, Text } from "@chakra-ui/react";
import type { ButtonTheme } from "@typebot.io/js";
import { Popover } from "@typebot.io/ui/components/Popover";

import React from "react";

type Props = {
  buttonTheme: ButtonTheme | undefined;
  onChange: (newButtonTheme?: ButtonTheme) => void;
};

export const ButtonThemeSettings = ({ buttonTheme, onChange }: Props) => {
  const { workspace } = useWorkspace();
  const { typebot } = useTypebot();
  const customIconPopoverControls = useOpenControls();

  const updateBackgroundColor = (backgroundColor: string) => {
    onChange({
      ...buttonTheme,
      backgroundColor,
    });
  };

  const updateCustomIconSrc = (customIconSrc: string) => {
    onChange({
      ...buttonTheme,
      customIconSrc,
    });
  };

  const updateSize = (size: any) =>
    onChange({
      ...buttonTheme,
      size,
    });

  return (
    <Stack spacing={4} borderWidth="1px" rounded="md" p="4">
      <Heading size="sm">Button</Heading>
      <Stack spacing={4}>
        <HStack justify="space-between">
          <Text>Size</Text>
          <BasicSelect
            size="sm"
            items={[
              {
                value: "medium",
                label: "Medium",
              },
              { value: "large", label: "Large" },
            ]}
            value={buttonTheme?.size}
            defaultValue="medium"
            onChange={updateSize}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Color</Text>
          <ColorPicker
            defaultValue={buttonTheme?.backgroundColor}
            onColorChange={updateBackgroundColor}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Custom icon</Text>
          <Popover.Root {...customIconPopoverControls}>
            <Popover.TriggerButton size="sm" variant="secondary">
              Pick an image
            </Popover.TriggerButton>
            <Popover.Popup className="w-[500px]">
              {workspace?.id && typebot?.id && (
                <ImageUploadContent
                  onSubmit={(url) => {
                    updateCustomIconSrc(url);
                    customIconPopoverControls.onClose();
                  }}
                  uploadFileProps={{
                    workspaceId: workspace.id,
                    typebotId: typebot.id,
                    fileName: "bubble-icon",
                  }}
                />
              )}
            </Popover.Popup>
          </Popover.Root>
        </HStack>
      </Stack>
    </Stack>
  );
};
