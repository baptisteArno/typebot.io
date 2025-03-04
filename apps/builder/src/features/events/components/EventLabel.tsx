import { Text, type TextProps } from "@chakra-ui/react";
import { type TFnType, useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import React from "react";

type Props = { type: TEvent["type"] } & TextProps;

export const EventLabel = ({ type, ...props }: Props): JSX.Element => {
  const { t } = useTranslate();
  const label = getEventBlockLabel(t)[type];

  return (
    <Text fontSize="sm" {...props}>
      {label}
    </Text>
  );
};

export const getEventBlockLabel = (
  t: TFnType,
): { [key in EventType]: string } => ({
  [EventType.START]: t("editor.sidebarBlock.start.label"),
  [EventType.COMMAND]: t("editor.sidebarBlock.command.label"),
});
