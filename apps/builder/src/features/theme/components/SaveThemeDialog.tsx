import { createId } from "@paralleldrive/cuid2";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { type FormEvent, useRef, useState } from "react";
import { TextInput } from "@/components/inputs/TextInput";
import { queryClient, trpc } from "@/lib/queryClient";

type Props = {
  workspaceId: string;
  isOpen: boolean;
  onClose: (template?: Pick<ThemeTemplate, "id" | "theme">) => void;
  selectedTemplate: Pick<ThemeTemplate, "id" | "name"> | undefined;
  theme: ThemeTemplate["theme"];
};

export const SaveThemeDialog = ({
  workspaceId,
  isOpen,
  onClose,
  selectedTemplate,
  theme,
}: Props) => {
  const { t } = useTranslate();
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useMutation(
    trpc.theme.saveThemeTemplate.mutationOptions({
      onMutate: () => setIsSaving(true),
      onSettled: () => setIsSaving(false),
      onSuccess: ({ themeTemplate }) => {
        queryClient.invalidateQueries({
          queryKey: trpc.theme.listThemeTemplates.queryKey(),
        });
        onClose(themeTemplate);
      },
    }),
  );

  const updateExistingTemplate = (e: FormEvent) => {
    e.preventDefault();
    const newName = inputRef.current?.value;
    if (!newName) return;
    mutate({
      name: newName,
      theme,
      workspaceId,
      themeTemplateId: selectedTemplate?.id ?? createId(),
    });
  };

  const saveNewTemplate = () => {
    const newName = inputRef.current?.value;
    if (!newName) return;
    mutate({
      name: newName,
      theme,
      workspaceId,
      themeTemplateId: createId(),
    });
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup
        render={<form onSubmit={updateExistingTemplate} />}
        initialFocus={inputRef}
      >
        <Dialog.Title>
          {t("theme.sideMenu.template.myTemplates.saveTheme.title")}
        </Dialog.Title>
        <Dialog.CloseButton />

        <TextInput
          ref={inputRef}
          label={t("theme.sideMenu.template.myTemplates.saveTheme.name")}
          defaultValue={selectedTemplate?.name}
          withVariableButton={false}
          placeholder={t(
            "theme.sideMenu.template.myTemplates.saveTheme.myTemplate",
          )}
          isRequired
        />
        <Dialog.Footer>
          {selectedTemplate?.id && (
            <Button
              disabled={isSaving}
              variant="secondary"
              onClick={saveNewTemplate}
            >
              {t("theme.sideMenu.template.myTemplates.saveTheme.saveAsNew")}
            </Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {selectedTemplate?.id ? t("update") : t("save")}
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
