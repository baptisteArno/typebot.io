import { useDisclosure } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Menu } from "@typebot.io/ui/components/Menu";
import assert from "assert";
import { useState } from "react";
import {
  BookIcon,
  DownloadIcon,
  MoreVerticalIcon,
  SettingsIcon,
} from "@/components/icons";
import { parseDefaultPublicId } from "@/features/publish/helpers/parseDefaultPublicId";
import { useTypebot } from "../providers/TypebotProvider";
import { EditorSettingsDialog } from "./EditorSettingsDialog";

export const BoardMenuButton = () => {
  const { typebot, currentUserMode } = useTypebot();
  const [isDownloading, setIsDownloading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslate();

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
    <Menu.Root>
      <Menu.TriggerButton
        disabled={isDownloading}
        size="icon"
        className="size-8"
        variant="secondary"
      >
        <MoreVerticalIcon transform={"rotate(90deg)"} />
      </Menu.TriggerButton>
      <Menu.Popup align="end">
        <Menu.Item onClick={redirectToDocumentation}>
          <BookIcon />
          {t("editor.graph.menu.documentationItem.label")}
        </Menu.Item>
        <Menu.Item onClick={onOpen}>
          <SettingsIcon />
          {t("editor.graph.menu.editorSettingsItem.label")}
        </Menu.Item>
        {currentUserMode !== "guest" ? (
          <Menu.Item onClick={downloadFlow}>
            <DownloadIcon />
            {t("editor.graph.menu.exportFlowItem.label")}
          </Menu.Item>
        ) : null}
      </Menu.Popup>
      <EditorSettingsDialog isOpen={isOpen} onClose={onClose} />
    </Menu.Root>
  );
};
