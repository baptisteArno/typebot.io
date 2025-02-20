import assert from "assert";
import {
  BookIcon,
  DownloadIcon,
  FileCurlyIcon,
  MoreVerticalIcon,
  SettingsIcon,
} from "@/components/icons";
import { ParentModalProvider } from "@/features/graph/providers/ParentModalProvider";
import { parseDefaultPublicId } from "@/features/publish/helpers/parseDefaultPublicId";
import { useRightPanel } from "@/hooks/useRightPanel";
import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  type StackProps,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import React, { useState } from "react";
import { useTypebot } from "../providers/TypebotProvider";
import { EditorSettingsModal } from "./EditorSettingsModal";

export const BoardMenuButton = (props: StackProps) => {
  const { typebot, currentUserMode } = useTypebot();
  const [isDownloading, setIsDownloading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslate();
  const [, setRightPanel] = useRightPanel();

  const downloadFlow = () => {
    assert(typebot);
    setIsDownloading(true);
    const data =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(typebot));
    const fileName = `typebot-export-${parseDefaultPublicId(
      typebot.name,
      typebot.id,
    )}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", data);
    linkElement.setAttribute("download", fileName);
    linkElement.click();
    setIsDownloading(false);
  };

  const redirectToDocumentation = () =>
    window.open("https://docs.typebot.io/editor/graph", "_blank");

  return (
    <HStack rounded="md" spacing="4" {...props}>
      <IconButton
        icon={<FileCurlyIcon />}
        aria-label="Open variables drawer"
        size="sm"
        shadow="md"
        bgColor={useColorModeValue("white", undefined)}
        onClick={() => setRightPanel("variables")}
      />
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<MoreVerticalIcon transform={"rotate(90deg)"} />}
          isLoading={isDownloading}
          size="sm"
          shadow="md"
          bgColor={useColorModeValue("white", undefined)}
        />
        <MenuList>
          <MenuItem icon={<BookIcon />} onClick={redirectToDocumentation}>
            {t("editor.graph.menu.documentationItem.label")}
          </MenuItem>
          <MenuItem icon={<SettingsIcon />} onClick={onOpen}>
            {t("editor.graph.menu.editorSettingsItem.label")}
          </MenuItem>
          {currentUserMode !== "guest" ? (
            <MenuItem icon={<DownloadIcon />} onClick={downloadFlow}>
              {t("editor.graph.menu.exportFlowItem.label")}
            </MenuItem>
          ) : null}
        </MenuList>
        <ParentModalProvider>
          <EditorSettingsModal isOpen={isOpen} onClose={onClose} />
        </ParentModalProvider>
      </Menu>
    </HStack>
  );
};
