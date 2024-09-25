import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { TagsInput } from "@/components/TagsInput";
import { FormControl, FormLabel, Stack } from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import type { Settings } from "@typebot.io/settings/schemas";
import React from "react";

type Props = {
  security: Settings["security"];
  onUpdate: (security: Settings["security"]) => void;
};

export const SecurityForm = ({ security, onUpdate }: Props) => {
  const updateItems = (items: string[]) => {
    if (items.length === 0) onUpdate(undefined);
    onUpdate({
      allowedOrigins: items.filter(isDefined),
    });
  };

  return (
    <Stack spacing={6}>
      <FormControl>
        <FormLabel display="flex" flexShrink={0} gap="1" mr="0" mb="4">
          Allowed origins
          <MoreInfoTooltip>
            Restrict the execution of your typebot to specific website origins.
            By default your bot can be executed on any website.
          </MoreInfoTooltip>
        </FormLabel>
        <TagsInput
          items={security?.allowedOrigins}
          onChange={updateItems}
          placeholder={env.NEXT_PUBLIC_VIEWER_URL[0]}
        />
      </FormControl>
    </Stack>
  );
};
