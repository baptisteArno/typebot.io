import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";

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
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>From email</Field.Label>
        <DebouncedTextInput
          defaultValue={config?.from.email}
          onValueChange={handleFromEmailChange}
          placeholder="notifications@provider.com"
          disabled={!config}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>From name</Field.Label>
        <DebouncedTextInput
          defaultValue={config?.from.name}
          onValueChange={handleFromNameChange}
          placeholder="John Smith"
          disabled={!config}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Host</Field.Label>
        <DebouncedTextInput
          defaultValue={config?.host}
          onValueChange={handleHostChange}
          placeholder="mail.provider.com"
          disabled={!config}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Username</Field.Label>
        <DebouncedTextInput
          defaultValue={config?.username}
          onValueChange={handleUsernameChange}
          disabled={!config}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Password</Field.Label>
        <DebouncedTextInput
          type="password"
          defaultValue={config?.password}
          onValueChange={handlePasswordChange}
          disabled={!config}
        />
      </Field.Root>
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
    </div>
  );
};
