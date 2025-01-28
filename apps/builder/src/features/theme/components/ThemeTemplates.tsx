import { Button, HStack, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { useState } from "react";
import { MyTemplates } from "./MyTemplates";
import { TemplatesGallery } from "./TemplatesGallery";

type Tab = "my-templates" | "gallery";

type Props = {
  workspaceId: string;
  selectedTemplateId: string | undefined;
  typebotVersion: TypebotV6["version"];
  currentTheme: ThemeTemplate["theme"];
  onTemplateSelect: (
    template: Partial<Pick<ThemeTemplate, "id" | "theme">>,
  ) => void;
};

export const ThemeTemplates = ({
  workspaceId,
  typebotVersion,
  selectedTemplateId,
  currentTheme,
  onTemplateSelect,
}: Props) => {
  const { t } = useTranslate();

  const [selectedTab, setSelectedTab] = useState<Tab>("my-templates");

  return (
    <Stack spacing={4}>
      <HStack>
        <Button
          flex="1"
          variant="outline"
          colorScheme={selectedTab === "my-templates" ? "orange" : "gray"}
          onClick={() => setSelectedTab("my-templates")}
        >
          {t("theme.sideMenu.template.myTemplates")}
        </Button>
        <Button
          flex="1"
          variant="outline"
          colorScheme={selectedTab === "gallery" ? "orange" : "gray"}
          onClick={() => setSelectedTab("gallery")}
        >
          {t("theme.sideMenu.template.gallery")}
        </Button>
      </HStack>
      <ThemeTemplatesBody
        tab={selectedTab}
        currentTheme={currentTheme}
        workspaceId={workspaceId}
        typebotVersion={typebotVersion}
        selectedTemplateId={selectedTemplateId}
        onTemplateSelect={onTemplateSelect}
      />
    </Stack>
  );
};

const ThemeTemplatesBody = ({
  tab,
  workspaceId,
  selectedTemplateId,
  typebotVersion,
  currentTheme,
  onTemplateSelect,
}: {
  tab: Tab;
} & Props) => {
  switch (tab) {
    case "my-templates":
      return (
        <MyTemplates
          onTemplateSelect={onTemplateSelect}
          currentTheme={currentTheme}
          typebotVersion={typebotVersion}
          selectedTemplateId={selectedTemplateId}
          workspaceId={workspaceId}
        />
      );
    case "gallery":
      return (
        <TemplatesGallery
          onTemplateSelect={onTemplateSelect}
          currentTheme={currentTheme}
          typebotVersion={typebotVersion}
          selectedTemplateId={selectedTemplateId}
          workspaceId={workspaceId}
        />
      );
  }
};
