import { Flex, HStack, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { defaultSendEmailOptions } from "@typebot.io/blocks-integrations/sendEmail/constants";
import type { SendEmailBlock } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { env } from "@typebot.io/env";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { Variable } from "@typebot.io/variables/schemas";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { TextInput } from "@/components/inputs/TextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { isFreePlan } from "@/features/billing/helpers/isFreePlan";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { SmtpCredentialsCreateDialog } from "./SmtpCredentialsCreateDialog";

type Props = {
  options: SendEmailBlock["options"];
  onOptionsChange: (options: SendEmailBlock["options"]) => void;
};

export const SendEmailSettings = ({ options, onOptionsChange }: Props) => {
  const { workspace } = useWorkspace();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const updateCredentialsId = (credentialsId?: string) => {
    onOptionsChange({
      ...options,
      credentialsId: credentialsId === undefined ? "default" : credentialsId,
    });
  };

  const handleToChange = (recipientsStr: string) => {
    const recipients: string[] = recipientsStr
      .split(",")
      .map((str) => str.trim())
      .filter(isNotEmpty);
    onOptionsChange({
      ...options,
      recipients,
    });
  };

  const handleCcChange = (ccStr: string) => {
    const cc: string[] = ccStr
      .split(",")
      .map((str) => str.trim())
      .filter(isNotEmpty);
    onOptionsChange({
      ...options,
      cc,
    });
  };

  const handleBccChange = (bccStr: string) => {
    const bcc: string[] = bccStr
      .split(",")
      .map((str) => str.trim())
      .filter(isNotEmpty);
    onOptionsChange({
      ...options,
      bcc,
    });
  };

  const handleSubjectChange = (subject: string) =>
    onOptionsChange({
      ...options,
      subject,
    });

  const handleBodyChange = (body: string) =>
    onOptionsChange({
      ...options,
      body,
    });

  const handleReplyToChange = (replyTo: string) =>
    onOptionsChange({
      ...options,
      replyTo,
    });

  const handleIsCustomBodyChange = (isCustomBody: boolean) =>
    onOptionsChange({
      ...options,
      isCustomBody,
    });

  const handleIsBodyCodeChange = () =>
    onOptionsChange({
      ...options,
      isBodyCode: options?.isBodyCode ? !options.isBodyCode : true,
    });

  const handleChangeAttachmentVariable = (
    variable: Pick<Variable, "id" | "name"> | undefined,
  ) =>
    onOptionsChange({
      ...options,
      attachmentsVariableId: variable?.id,
    });

  return (
    <Stack spacing={4}>
      <Stack>
        <Text>From: </Text>
        {workspace && (
          <CredentialsDropdown
            type="smtp"
            scope={{ type: "workspace", workspaceId: workspace.id }}
            currentCredentialsId={getCredentialsIdOrDefault({
              workspace,
              credentialsId: options?.credentialsId,
            })}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={onOpen}
            defaultCredentialLabel={
              isFreePlan(workspace)
                ? undefined
                : env.NEXT_PUBLIC_SMTP_FROM?.match(/<(.*)>/)?.pop()
            }
            credentialsName="SMTP account"
          />
        )}
      </Stack>
      <TextInput
        label="To:"
        onChange={handleToChange}
        defaultValue={options?.recipients?.join(", ")}
        placeholder="email1@gmail.com, email2@gmail.com"
      />
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>Advanced</Accordion.Trigger>
          <Accordion.Panel>
            <TextInput
              label="Reply to:"
              onChange={handleReplyToChange}
              defaultValue={options?.replyTo}
              placeholder={"email@gmail.com"}
            />
            <TextInput
              label="Cc:"
              onChange={handleCcChange}
              defaultValue={options?.cc?.join(", ") ?? ""}
              placeholder="email1@gmail.com, email2@gmail.com"
            />
            <TextInput
              label="Bcc:"
              onChange={handleBccChange}
              defaultValue={options?.bcc?.join(", ") ?? ""}
              placeholder="email1@gmail.com, email2@gmail.com"
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>

      <TextInput
        label="Subject:"
        onChange={handleSubjectChange}
        defaultValue={options?.subject ?? ""}
      />
      <Field.Root className="flex-row items-center">
        <Switch
          checked={
            options?.isCustomBody ?? defaultSendEmailOptions.isCustomBody
          }
          onCheckedChange={handleIsCustomBodyChange}
        />
        <Field.Label>
          Custom content{" "}
          <MoreInfoTooltip>
            By default, the email body will be a recap of what has been
            collected so far. You can override it with this option.
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
      {options?.isCustomBody && (
        <Stack>
          <Flex justifyContent="space-between">
            <Text>Content: </Text>
            <HStack>
              <Text fontSize="sm">Text</Text>
              <Switch
                checked={
                  options.isBodyCode ?? defaultSendEmailOptions.isBodyCode
                }
                onCheckedChange={handleIsBodyCodeChange}
              />
              <Text fontSize="sm">Code</Text>
            </HStack>
          </Flex>
          {options.isBodyCode ? (
            <CodeEditor
              defaultValue={options.body ?? ""}
              onChange={handleBodyChange}
              lang="html"
              withLineNumbers={true}
            />
          ) : (
            <DebouncedTextareaWithVariablesButton
              onValueChange={handleBodyChange}
              defaultValue={options.body ?? ""}
            />
          )}
          <Field.Root className="pb-4">
            <Field.Label>
              Attach files
              <MoreInfoTooltip>
                The selected variable should have previously collected files
                from the File upload input block.
              </MoreInfoTooltip>
            </Field.Label>
            <VariablesCombobox
              initialVariableId={options?.attachmentsVariableId}
              onSelectVariable={handleChangeAttachmentVariable}
            />
          </Field.Root>
        </Stack>
      )}

      <SmtpCredentialsCreateDialog
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={updateCredentialsId}
      />
    </Stack>
  );
};

const getCredentialsIdOrDefault = ({
  workspace,
  credentialsId,
}: {
  workspace: Pick<Workspace, "plan">;
  credentialsId: string | undefined;
}): string | undefined => {
  if (credentialsId) return credentialsId;
  if (isFreePlan(workspace)) return;
  return defaultSendEmailOptions.credentialsId;
};
