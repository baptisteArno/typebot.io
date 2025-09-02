import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { toast } from "@/lib/toast";
import {
  HStack,
  Heading,
  Stack,
  Tag,
  Text,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { sendRequest } from "@typebot.io/lib/utils";
import { Standard } from "@typebot.io/react";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import React, { useCallback, useEffect, useState } from "react";
import { useTemplates } from "../hooks/useTemplates";
import type { TemplateProps } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onTypebotChoose: (typebot: Typebot, fromTemplate: string) => void;
  isLoading: boolean;
};

export const TemplatesDialog = ({
  isOpen,
  onClose,
  onTypebotChoose,
  isLoading,
}: Props) => {
  const { t } = useTranslate();
  const templateCardBackgroundColor = useColorModeValue("white", "gray.900");
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
    onTypebotChoose(typebot, selectedTemplate.name);
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="p-0 flex flex-row max-w-6xl max-h-full gap-0">
        <Stack
          w="300px"
          py="4"
          px="2"
          borderRightWidth={1}
          justify="space-between"
          flexShrink={0}
          overflowY="auto"
        >
          <Stack spacing={5}>
            <Stack spacing={2}>
              <Text fontSize="xs" fontWeight="medium" pl="1" color="gray.500">
                {t("templates.modal.menuHeading.marketing")}
              </Text>
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
                    <HStack overflow="hidden" fontSize="sm" w="full">
                      <Text>{template.emoji}</Text>
                      <Text>{template.name}</Text>
                      {template.isNew && (
                        <Tag colorScheme="orange" size="sm" flexShrink={0}>
                          {t("templates.modal.menuHeading.new.tag")}
                        </Tag>
                      )}
                    </HStack>
                  </Button>
                ))}
            </Stack>
            <Stack spacing={2}>
              <Text fontSize="xs" fontWeight="medium" pl="1" color="gray.500">
                {t("templates.modal.menuHeading.product")}
              </Text>
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
                    <HStack overflow="hidden" fontSize="sm" w="full">
                      <Text>{template.emoji}</Text>
                      <Text>{template.name}</Text>
                      {template.isNew && (
                        <Tag colorScheme="orange" size="sm" flexShrink={0}>
                          {t("templates.modal.menuHeading.new.tag")}
                        </Tag>
                      )}
                    </HStack>
                  </Button>
                ))}
            </Stack>
            <Stack spacing={2}>
              <Text fontSize="xs" fontWeight="medium" pl="1" color="gray.500">
                {t("templates.modal.menuHeading.other")}
              </Text>
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
                    <HStack overflow="hidden" fontSize="sm" w="full">
                      <Text>{template.emoji}</Text>
                      <Text>{template.name}</Text>
                      {template.isNew && (
                        <Tag colorScheme="orange" size="sm" flexShrink={0}>
                          {t("templates.modal.menuHeading.new.tag")}
                        </Tag>
                      )}
                    </HStack>
                  </Button>
                ))}
            </Stack>
          </Stack>
        </Stack>
        <Stack
          w="full"
          spacing="4"
          align="center"
          pb="4"
          bgColor={selectedTemplate.backgroundColor ?? "white"}
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
          <HStack
            p="6"
            borderWidth={1}
            rounded="md"
            w="95%"
            spacing={4}
            bgColor={templateCardBackgroundColor}
          >
            <Stack flex="1" spacing={4}>
              <Heading fontSize="2xl">
                {selectedTemplate.emoji}{" "}
                <chakra.span ml="2">{selectedTemplate.name}</chakra.span>
              </Heading>
              <Text>{selectedTemplate.description}</Text>
            </Stack>
            <Button onClick={onUseThisTemplateClick} disabled={isLoading}>
              {t("templates.modal.useTemplateButton.label")}
            </Button>
          </HStack>
        </Stack>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
