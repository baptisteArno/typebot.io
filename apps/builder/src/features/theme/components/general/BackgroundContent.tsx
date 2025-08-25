import { ImageUploadContent } from "@/components/ImageUploadContent";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useOpenControls } from "@/hooks/useOpenControls";
import { Flex, Image, Text } from "@chakra-ui/react";
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
import React from "react";
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
              <Image
                src={background?.content}
                alt={t("theme.sideMenu.global.background.image.alt")}
                cursor="pointer"
                _hover={{ filter: "brightness(.9)" }}
                transition="filter 200ms"
                rounded="md"
                w="full"
                maxH="200px"
                objectFit="cover"
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
