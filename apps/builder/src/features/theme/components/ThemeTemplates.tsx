import { useTranslate } from "@tolgee/react";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { Button } from "@typebot.io/ui/components/Button";
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant={selectedTab === "my-templates" ? "outline" : "ghost"}
          onClick={() => setSelectedTab("my-templates")}
        >
          {t("theme.sideMenu.template.myTemplates")}
        </Button>
        <Button
          variant={selectedTab === "gallery" ? "outline" : "ghost"}
          onClick={() => setSelectedTab("gallery")}
        >
          {t("theme.sideMenu.template.gallery")}
        </Button>
      </div>
      <ThemeTemplatesBody
        tab={selectedTab}
        currentTheme={currentTheme}
        workspaceId={workspaceId}
        typebotVersion={typebotVersion}
        selectedTemplateId={selectedTemplateId}
        onTemplateSelect={onTemplateSelect}
      />
    </div>
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
