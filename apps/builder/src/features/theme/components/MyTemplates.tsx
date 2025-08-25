import { SaveIcon } from "@/components/icons";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { SimpleGrid, Stack, useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { Button } from "@typebot.io/ui/components/Button";
import { areThemesEqual } from "../helpers/areThemesEqual";
import { SaveThemeDialog } from "./SaveThemeDialog";
import { ThemeTemplateCard } from "./ThemeTemplateCard";

type Props = {
  selectedTemplateId: string | undefined;
  currentTheme: ThemeTemplate["theme"];
  typebotVersion: TypebotV6["version"];
  workspaceId: string;
  onTemplateSelect: (
    template: Partial<Pick<ThemeTemplate, "id" | "theme">>,
  ) => void;
};

export const MyTemplates = ({
  selectedTemplateId,
  currentTheme,
  workspaceId,
  typebotVersion,
  onTemplateSelect,
}: Props) => {
  const { t } = useTranslate();
  const { currentUserMode } = useWorkspace();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = useQuery(
    trpc.theme.listThemeTemplates.queryOptions(
      {
        workspaceId,
      },
      {
        enabled: currentUserMode !== "guest",
      },
    ),
  );
  const selectedTemplate = data?.themeTemplates.find(
    (themeTemplate) => themeTemplate.id === selectedTemplateId,
  );

  const closeDialogAndSelectTemplate = (
    template?: Pick<ThemeTemplate, "id" | "theme">,
  ) => {
    if (template) onTemplateSelect(template);
    onClose();
  };

  return (
    <Stack spacing={4}>
      {(!selectedTemplate ||
        !areThemesEqual(selectedTemplate?.theme, currentTheme)) && (
        <Button onClick={onOpen}>
          <SaveIcon />
          {t("theme.sideMenu.template.myTemplates.saveTheme")}
        </Button>
      )}
      <SaveThemeDialog
        workspaceId={workspaceId}
        selectedTemplate={selectedTemplate}
        isOpen={isOpen}
        onClose={closeDialogAndSelectTemplate}
        theme={currentTheme}
      />
      <SimpleGrid columns={2} spacing={4}>
        {data?.themeTemplates.map((themeTemplate) => (
          <ThemeTemplateCard
            key={themeTemplate.id}
            workspaceId={workspaceId}
            themeTemplate={themeTemplate}
            typebotVersion={typebotVersion}
            isSelected={themeTemplate.id === selectedTemplateId}
            onClick={() => onTemplateSelect(themeTemplate)}
            onRenameClick={onOpen}
            onDeleteSuccess={() => onTemplateSelect({ id: "" })}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
