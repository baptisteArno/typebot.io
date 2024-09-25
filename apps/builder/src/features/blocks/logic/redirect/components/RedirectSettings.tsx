import { TextInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { Stack } from "@chakra-ui/react";
import { defaultRedirectOptions } from "@typebot.io/blocks-logic/redirect/constants";
import type { RedirectBlock } from "@typebot.io/blocks-logic/redirect/schema";

type Props = {
  options: RedirectBlock["options"];
  onOptionsChange: (options: RedirectBlock["options"]) => void;
};

export const RedirectSettings = ({ options, onOptionsChange }: Props) => {
  const handleUrlChange = (url?: string) =>
    onOptionsChange({ ...options, url });

  const handleIsNewTabChange = (isNewTab: boolean) =>
    onOptionsChange({ ...options, isNewTab });

  return (
    <Stack spacing={4}>
      <TextInput
        label="Url:"
        defaultValue={options?.url}
        placeholder="Type a URL..."
        onChange={handleUrlChange}
      />
      <SwitchWithLabel
        label="Open in new tab?"
        initialValue={options?.isNewTab ?? defaultRedirectOptions.isNewTab}
        onCheckChange={handleIsNewTabChange}
      />
    </Stack>
  );
};
