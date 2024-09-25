import { RadioButtons } from "@/components/inputs/RadioButtons";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  BackgroundType,
  defaultBackgroundType,
} from "@typebot.io/theme/constants";
import type { Background } from "@typebot.io/theme/schemas";
import React from "react";
import { BackgroundContent } from "./BackgroundContent";

type Props = {
  background?: Background;
  onBackgroundChange: (newBackground: Background) => void;
};

export const BackgroundSelector = ({
  background,
  onBackgroundChange,
}: Props) => {
  const { t } = useTranslate();

  const handleBackgroundTypeChange = (type: BackgroundType) =>
    onBackgroundChange({ ...background, type, content: undefined });

  const handleBackgroundContentChange = (content: string) =>
    onBackgroundChange({ ...background, content });

  return (
    <Stack spacing={4}>
      <RadioButtons
        options={[
          {
            label: t("theme.sideMenu.global.background.color.select"),
            value: BackgroundType.COLOR,
          },
          {
            label: t("theme.sideMenu.global.background.image.select"),
            value: BackgroundType.IMAGE,
          },
          {
            label: t("theme.sideMenu.global.background.none.select"),
            value: BackgroundType.NONE,
          },
        ]}
        value={background?.type ?? defaultBackgroundType}
        onSelect={handleBackgroundTypeChange}
      />
      <BackgroundContent
        background={background}
        onBackgroundContentChange={handleBackgroundContentChange}
      />
    </Stack>
  );
};
