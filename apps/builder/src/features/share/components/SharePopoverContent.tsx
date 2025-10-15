import { Input, InputGroup, InputRightElement, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { CopyButton } from "@/components/CopyButton";
import { CollaborationList } from "@/features/collaboration/components/CollaborationList";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

export const SharePopoverContent = () => {
  const { t } = useTranslate();
  const { typebot, updateTypebot } = useTypebot();

  const currentUrl = `${window.location.origin}/typebots/${typebot?.id}/edit`;

  const updateIsPublicShareEnabled = async (isEnabled: boolean) => {
    await updateTypebot({
      updates: {
        settings: {
          ...typebot?.settings,
          publicShare: {
            ...typebot?.settings.publicShare,
            isEnabled,
          },
        },
      },
      save: true,
    });
  };

  return (
    <Stack spacing={4}>
      <CollaborationList />
      <Stack p="4" borderTopWidth={1}>
        <Field.Container>
          <Field.Root className="flex-row items-center">
            <Switch
              checked={typebot?.settings.publicShare?.isEnabled ?? false}
              onCheckedChange={updateIsPublicShareEnabled}
            />
            <Field.Label>
              {t("share.button.popover.publicFlow.label")}
            </Field.Label>
          </Field.Root>
          {(typebot?.settings.publicShare?.isEnabled ?? false) && (
            <Stack spacing={4}>
              <InputGroup size="sm">
                <Input type={"text"} defaultValue={currentUrl} pr="16" />
                <InputRightElement width="60px">
                  <CopyButton textToCopy={currentUrl} />
                </InputRightElement>
              </InputGroup>
            </Stack>
          )}
        </Field.Container>
      </Stack>
    </Stack>
  );
};
