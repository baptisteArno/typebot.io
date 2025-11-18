import { useTranslate } from "@tolgee/react";
import { sendRequest } from "@typebot.io/lib/utils";
import { Standard } from "@typebot.io/react";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useCallback, useEffect, useState } from "react";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { toast } from "@/lib/toast";
import { useTemplates } from "../hooks/useTemplates";
import type { TemplateProps } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onTypebotChoose: (typebot: Typebot, args: { fromTemplate: string }) => void;
  isLoading: boolean;
};

export const TemplatesDialog = ({
  isOpen,
  onClose,
  onTypebotChoose,
  isLoading,
}: Props) => {
  const { t } = useTranslate();
  const [typebot, setTypebot] = useState<Typebot>();
  const templates = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateProps>(
    templates[0],
  );
  const { workspace } = useWorkspace();

  const fetchTemplate = useCallback(
    async (template: TemplateProps) => {
      if (!workspace?.id) return;
      setSelectedTemplate(template);
      const { data, error } = await sendRequest(
        `/templates/${template.fileName}`,
      );
      if (error)
        return toast({
          title: error.name,
          description: error.message,
        });
      setTypebot({
        ...(data as Typebot),
        name: template.name,
        workspaceId: workspace.id,
      });
    },
    [workspace?.id],
  );

  useEffect(() => {
    if (typebot?.id) return;
    fetchTemplate(selectedTemplate);
  }, [fetchTemplate, typebot?.id, selectedTemplate.fileName]);

  const onUseThisTemplateClick = async () => {
    if (!typebot) return;
    onTypebotChoose(typebot, { fromTemplate: selectedTemplate.name });
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="p-0 flex flex-row max-w-6xl max-h-full gap-0">
        <div className="flex flex-col gap-2 w-[300px] py-4 px-2 border-r justify-between overflow-y-auto shrink-0">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium pl-1" color="gray.500">
                {t("templates.modal.menuHeading.marketing")}
              </p>
              {templates
                .filter((template) => template.category === "marketing")
                .map((template) => (
                  <Button
                    size="sm"
                    key={template.name}
                    onClick={() => fetchTemplate(template)}
                    className="w-full"
                    variant={
                      selectedTemplate.name === template.name
                        ? "outline"
                        : "ghost"
                    }
                    disabled={template.isComingSoon}
                  >
                    <div className="flex items-center gap-2 overflow-hidden text-sm w-full">
                      <p>{template.emoji}</p>
                      <p>{template.name}</p>
                      {template.isNew && (
                        <Badge colorScheme="orange" className="shrink-0">
                          {t("templates.modal.menuHeading.new.tag")}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium pl-1" color="gray.500">
                {t("templates.modal.menuHeading.product")}
              </p>
              {templates
                .filter((template) => template.category === "product")
                .map((template) => (
                  <Button
                    size="sm"
                    key={template.name}
                    onClick={() => fetchTemplate(template)}
                    className="w-full"
                    variant={
                      selectedTemplate.name === template.name
                        ? "outline"
                        : "ghost"
                    }
                    disabled={template.isComingSoon}
                  >
                    <div className="flex items-center gap-2 overflow-hidden text-sm w-full">
                      <p>{template.emoji}</p>
                      <p>{template.name}</p>
                      {template.isNew && (
                        <Badge colorScheme="orange" className="shrink-0">
                          {t("templates.modal.menuHeading.new.tag")}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium pl-1" color="gray.500">
                {t("templates.modal.menuHeading.other")}
              </p>
              {templates
                .filter((template) => template.category === undefined)
                .map((template) => (
                  <Button
                    size="sm"
                    key={template.name}
                    onClick={() => fetchTemplate(template)}
                    className="w-full"
                    variant={
                      selectedTemplate.name === template.name
                        ? "outline"
                        : "ghost"
                    }
                    disabled={template.isComingSoon}
                  >
                    <div className="flex items-center gap-2 overflow-hidden text-sm w-full">
                      <p>{template.emoji}</p>
                      <p>{template.name}</p>
                      {template.isNew && (
                        <Badge colorScheme="orange" className="shrink-0">
                          {t("templates.modal.menuHeading.new.tag")}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
            </div>
          </div>
        </div>
        <div
          style={{
            backgroundColor: selectedTemplate.backgroundColor ?? "white",
          }}
          className="flex flex-col w-full gap-4 items-center pb-4"
        >
          {typebot && (
            <Standard
              key={typebot.id}
              typebot={typebot}
              style={{
                borderRadius: "0.25rem",
                backgroundColor: "#fff",
              }}
            />
          )}
          <div className="flex items-center p-6 border rounded-md w-[95%] gap-4 bg-gray-1">
            <div className="flex flex-col flex-1 gap-4">
              <h2 className="text-2xl">
                {selectedTemplate.emoji}{" "}
                <span className="ml-2">{selectedTemplate.name}</span>
              </h2>
              <p>{selectedTemplate.description}</p>
            </div>
            <Button onClick={onUseThisTemplateClick} disabled={isLoading}>
              {t("templates.modal.useTemplateButton.label")}
            </Button>
          </div>
        </div>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
