import { ForgedBlockLabel } from "@/features/forge/ForgedBlockLabel";
import { Text, type TextProps } from "@chakra-ui/react";
import { type TFnType, useTranslate } from "@tolgee/react";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  isBubbleBlockType,
  isForgedBlockType,
  isInputBlockType,
  isIntegrationBlockType,
  isLogicBlockType,
} from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import React from "react";

type Props = { type: Block["type"] } & TextProps;

export const BlockLabel = ({ type, ...props }: Props): JSX.Element => {
  const { t } = useTranslate();

  if (isForgedBlockType(type))
    return <ForgedBlockLabel type={type} {...props} />;

  const label = isBubbleBlockType(type)
    ? getBubbleBlockLabel(t)[type]
    : isInputBlockType(type)
      ? getInputBlockLabel(t)[type]
      : isLogicBlockType(type)
        ? getLogicBlockLabel(t)[type]
        : isIntegrationBlockType(type)
          ? getIntegrationBlockLabel(t)[type]
          : t("editor.sidebarBlock.start.label");

  return (
    <Text fontSize="sm" {...props}>
      {label}
    </Text>
  );
};

export const getBubbleBlockLabel = (
  t: TFnType,
): Record<BubbleBlockType, string> => ({
  [BubbleBlockType.TEXT]: t("editor.sidebarBlock.text.label"),
  [BubbleBlockType.IMAGE]: t("editor.sidebarBlock.image.label"),
  [BubbleBlockType.VIDEO]: t("editor.sidebarBlock.video.label"),
  [BubbleBlockType.EMBED]: t("editor.sidebarBlock.embed.label"),
  [BubbleBlockType.AUDIO]: t("editor.sidebarBlock.audio.label"),
});

export const getInputBlockLabel = (
  t: TFnType,
): Record<InputBlockType, string> => ({
  [InputBlockType.NUMBER]: t("editor.sidebarBlock.number.label"),
  [InputBlockType.EMAIL]: t("editor.sidebarBlock.email.label"),
  [InputBlockType.TEXT]: t("editor.sidebarBlock.text.label"),
  [InputBlockType.URL]: t("editor.sidebarBlock.website.label"),
  [InputBlockType.DATE]: t("editor.sidebarBlock.date.label"),
  [InputBlockType.PHONE]: t("editor.sidebarBlock.phone.label"),
  [InputBlockType.CHOICE]: t("editor.sidebarBlock.button.label"),
  [InputBlockType.PICTURE_CHOICE]: t("editor.sidebarBlock.picChoice.label"),
  [InputBlockType.PAYMENT]: t("editor.sidebarBlock.payment.label"),
  [InputBlockType.RATING]: t("editor.sidebarBlock.rating.label"),
  [InputBlockType.FILE]: t("editor.sidebarBlock.file.label"),
});

export const getLogicBlockLabel = (
  t: TFnType,
): Record<LogicBlockType, string> => ({
  [LogicBlockType.SET_VARIABLE]: t("editor.sidebarBlock.setVariable.label"),
  [LogicBlockType.CONDITION]: t("editor.sidebarBlock.condition.label"),
  [LogicBlockType.REDIRECT]: t("editor.sidebarBlock.redirect.label"),
  [LogicBlockType.SCRIPT]: t("editor.sidebarBlock.script.label"),
  [LogicBlockType.TYPEBOT_LINK]: t("editor.sidebarBlock.typebot.label"),
  [LogicBlockType.WAIT]: t("editor.sidebarBlock.wait.label"),
  [LogicBlockType.JUMP]: t("editor.sidebarBlock.jump.label"),
  [LogicBlockType.AB_TEST]: t("editor.sidebarBlock.abTest.label"),
});

export const getIntegrationBlockLabel = (
  t: TFnType,
): Record<IntegrationBlockType, string> => ({
  [IntegrationBlockType.GOOGLE_SHEETS]: t("editor.sidebarBlock.sheets.label"),
  [IntegrationBlockType.GOOGLE_ANALYTICS]: t(
    "editor.sidebarBlock.analytics.label",
  ),
  [IntegrationBlockType.WEBHOOK]: "HTTP request",
  [IntegrationBlockType.ZAPIER]: t("editor.sidebarBlock.zapier.label"),
  [IntegrationBlockType.MAKE_COM]: t("editor.sidebarBlock.makecom.label"),
  [IntegrationBlockType.PABBLY_CONNECT]: t("editor.sidebarBlock.pabbly.label"),
  [IntegrationBlockType.EMAIL]: t("editor.sidebarBlock.email.label"),
  [IntegrationBlockType.CHATWOOT]: t("editor.sidebarBlock.chatwoot.label"),
  [IntegrationBlockType.OPEN_AI]: t("editor.sidebarBlock.openai.label"),
  [IntegrationBlockType.PIXEL]: t("editor.sidebarBlock.pixel.label"),
});
