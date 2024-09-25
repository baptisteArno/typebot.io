import { Text } from "@chakra-ui/react";
import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import React from "react";

type Props = {
  action: NonNullable<GoogleAnalyticsBlock["options"]>["action"];
};

export const GoogleAnalyticsNodeBody = ({ action }: Props) => (
  <Text color={action ? "currentcolor" : "gray.500"} noOfLines={1}>
    {action ? `Track "${action}"` : "Configure..."}
  </Text>
);
