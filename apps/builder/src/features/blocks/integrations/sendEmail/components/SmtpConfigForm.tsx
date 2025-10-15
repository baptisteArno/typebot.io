import { Stack } from "@chakra-ui/react";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { TextInput } from "@/components/inputs/TextInput";

type Props = {
  config: SmtpCredentials["data"] | undefined;
  onConfigChange: (config: SmtpCredentials["data"]) => void;
};

export const SmtpConfigForm = ({ config, onConfigChange }: Props) => {
  const handleFromEmailChange = (email: string) =>
    config && onConfigChange({ ...config, from: { ...config.from, email } });

  const handleFromNameChange = (name: string) =>
    config && onConfigChange({ ...config, from: { ...config.from, name } });

  const handleHostChange = (host: string) =>
    config && onConfigChange({ ...config, host });

  const handleUsernameChange = (username: string) =>
    config && onConfigChange({ ...config, username });

  const handlePasswordChange = (password: string) =>
    config && onConfigChange({ ...config, password });

  const handleTlsCheck = (isTlsEnabled: boolean) =>
    config && onConfigChange({ ...config, isTlsEnabled });

  const handlePortNumberChange = (port?: number) =>
    config && isDefined(port) && onConfigChange({ ...config, port });

  return (
    <Stack spacing={4}>
      <TextInput
        isRequired
        label="From email"
        defaultValue={config?.from.email}
        onChange={handleFromEmailChange}
        placeholder="notifications@provider.com"
        withVariableButton={false}
        isDisabled={!config}
      />
      <TextInput
        label="From name"
        defaultValue={config?.from.name}
        onChange={handleFromNameChange}
        placeholder="John Smith"
        withVariableButton={false}
        isDisabled={!config}
      />
      <TextInput
        isRequired
        label="Host"
        defaultValue={config?.host}
        onChange={handleHostChange}
        placeholder="mail.provider.com"
        withVariableButton={false}
        isDisabled={!config}
      />
      <TextInput
        isRequired
        label="Username"
        defaultValue={config?.username}
        onChange={handleUsernameChange}
        withVariableButton={false}
        isDisabled={!config}
      />
      <TextInput
        isRequired
        label="Password"
        type="password"
        defaultValue={config?.password}
        onChange={handlePasswordChange}
        withVariableButton={false}
        isDisabled={!config}
      />
      <Field.Root className="flex-row items-center">
        <Switch
          checked={config?.isTlsEnabled}
          onCheckedChange={handleTlsCheck}
        />
        <Field.Label>
          Secure{" "}
          <MoreInfoTooltip>
            If enabled, the connection will use TLS when connecting to server.
            If disabled then TLS is used if server supports the STARTTLS
            extension. In most cases enable it if you are connecting to port
            465. For port 587 or 25 keep it disabled.
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
      <Field.Root className="flex-row">
        <Field.Label>Port number:</Field.Label>
        <BasicNumberInput
          defaultValue={config?.port}
          onValueChange={handlePortNumberChange}
          withVariableButton={false}
          disabled={!config}
        />
      </Field.Root>
    </Stack>
  );
};
