import { Flex, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { isNotEmpty } from "@typebot.io/lib/utils";
import {
  BackgroundType,
  defaultBackgroundColor,
  defaultBackgroundType,
} from "@typebot.io/theme/constants";
import type { Background } from "@typebot.io/theme/schemas";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import React from "react";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { ColorPicker } from "../../../../components/ColorPicker";

type BackgroundContentProps = {
  background?: Background;
  onBackgroundContentChange: (content: string) => void;
};

export const BackgroundContent = ({
  background,
  onBackgroundContentChange,
}: BackgroundContentProps) => {
  const controls = useOpenControls();
  const { t } = useTranslate();
  const { typebot } = useTypebot();
  const handleContentChange = (content: string) =>
    onBackgroundContentChange(content);
  const popoverContainerRef = React.useRef<HTMLDivElement>(null);

  if ((background?.type ?? defaultBackgroundType) === BackgroundType.IMAGE) {
    if (!typebot) return null;
    return (
      <Flex ref={popoverContainerRef}>
        <Popover.Root {...controls}>
          <Popover.Trigger>
            {isNotEmpty(background?.content) ? (
              <img
                className="cursor-pointer transition-filter duration-200 rounded-md hover:brightness-90 w-full max-h-[200px] object-cover"
                src={background?.content}
                alt={t("theme.sideMenu.global.background.image.alt")}
              />
            ) : (
              <Button variant="secondary" className="w-full">
                {t("theme.sideMenu.global.background.image.button")}
              </Button>
            )}
          </Popover.Trigger>
          <Popover.Popup className="w-[500px]" side="top">
            <ImageUploadContent
              uploadFileProps={{
                workspaceId: typebot.workspaceId,
                typebotId: typebot.id,
                fileName: "background",
              }}
              defaultUrl={background?.content}
              onSubmit={handleContentChange}
              additionalTabs={{
                unsplash: true,
              }}
            />
          </Popover.Popup>
        </Popover.Root>
      </Flex>
    );
  }
  if (
    typebot &&
    (background?.type ?? defaultBackgroundType) === BackgroundType.COLOR
  ) {
    return (
      <Flex justify="space-between" align="center">
        <Text>{t("theme.sideMenu.global.background.color")}</Text>
        <ColorPicker
          value={background?.content ?? defaultBackgroundColor[typebot.version]}
          onColorChange={handleContentChange}
        />
      </Flex>
    );
  }
  return null;
};
