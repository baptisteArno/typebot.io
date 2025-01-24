import { SimpleGrid, Stack } from "@chakra-ui/react";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { galleryTemplates } from "../galleryTemplates";
import { ThemeTemplateCard } from "./ThemeTemplateCard";

type Props = {
  selectedTemplateId: string | undefined;
  currentTheme: ThemeTemplate["theme"];
  workspaceId: string;
  typebotVersion: TypebotV6["version"];
  onTemplateSelect: (
    template: Partial<Pick<ThemeTemplate, "id" | "theme">>,
  ) => void;
};

export const TemplatesGallery = ({
  selectedTemplateId,
  typebotVersion,
  workspaceId,
  onTemplateSelect,
}: Props) => (
  <Stack spacing={4}>
    <SimpleGrid columns={2} spacing={4}>
      {galleryTemplates
        .filter((t) => !t.isVisible || t.isVisible(typebotVersion))
        .map((themeTemplate) => (
          <ThemeTemplateCard
            key={themeTemplate.id}
            workspaceId={workspaceId}
            typebotVersion={typebotVersion}
            themeTemplate={themeTemplate}
            isSelected={themeTemplate.id === selectedTemplateId}
            onClick={() => onTemplateSelect(themeTemplate)}
          />
        ))}
    </SimpleGrid>
  </Stack>
);
