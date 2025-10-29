import { useTranslate } from "@tolgee/react";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { CopyInput } from "@/components/inputs/CopyInput";
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
    <div className="flex flex-col gap-4">
      <CollaborationList />
      <div className="flex flex-col gap-2 p-4 border-t">
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
            <CopyInput value={currentUrl} />
          )}
        </Field.Container>
      </div>
    </div>
  );
};
