import { Stack } from "@chakra-ui/react";
import { defaultRedirectOptions } from "@typebot.io/blocks-logic/redirect/constants";
import type { RedirectBlock } from "@typebot.io/blocks-logic/redirect/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { TextInput } from "@/components/inputs/TextInput";

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
      <Field.Root className="flex-row items-center">
        <Switch
          checked={options?.isNewTab ?? defaultRedirectOptions.isNewTab}
          onCheckedChange={handleIsNewTabChange}
        />
        <Field.Label>Open in new tab</Field.Label>
      </Field.Root>
    </Stack>
  );
};
