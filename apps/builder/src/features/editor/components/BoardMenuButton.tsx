import { useTranslate } from "@tolgee/react";
import { getPublicId } from "@typebot.io/typebot/helpers/getPublicId";
import { Menu } from "@typebot.io/ui/components/Menu";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { Book02Icon } from "@typebot.io/ui/icons/Book02Icon";
import { Download01Icon } from "@typebot.io/ui/icons/Download01Icon";
import { MoreHorizontalIcon } from "@typebot.io/ui/icons/MoreHorizontalIcon";
import { Settings01Icon } from "@typebot.io/ui/icons/Settings01Icon";
import assert from "assert";
import { useState } from "react";
import { useTypebot } from "../providers/TypebotProvider";
import { EditorSettingsDialog } from "./EditorSettingsDialog";

export const BoardMenuButton = () => {
  const { typebot, currentUserMode } = useTypebot();
  const [isDownloading, setIsDownloading] = useState(false);
  const { isOpen, onOpen, onClose } = useOpenControls();
  const { t } = useTranslate();

  const downloadFlow = () => {
    assert(typebot);
    setIsDownloading(true);
    const data =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(typebot));
    const fileName = `typebot-export-${getPublicId(typebot)}.json`;
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
        <MoreHorizontalIcon />
      </Menu.TriggerButton>
      <Menu.Popup align="end">
        <Menu.Item onClick={redirectToDocumentation}>
          <Book02Icon />
          {t("editor.graph.menu.documentationItem.label")}
        </Menu.Item>
        <Menu.Item onClick={onOpen}>
          <Settings01Icon />
          {t("editor.graph.menu.editorSettingsItem.label")}
        </Menu.Item>
        {currentUserMode !== "guest" ? (
          <Menu.Item onClick={downloadFlow}>
            <Download01Icon />
            {t("editor.graph.menu.exportFlowItem.label")}
          </Menu.Item>
        ) : null}
      </Menu.Popup>
      <EditorSettingsDialog isOpen={isOpen} onClose={onClose} />
    </Menu.Root>
  );
};
