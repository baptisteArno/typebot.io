import { defaultSendEmailOptions } from "@typebot.io/blocks-integrations/sendEmail/constants";
import type { SendEmailBlock } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { env } from "@typebot.io/env";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import type { Variable } from "@typebot.io/variables/schemas";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
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
  const { isOpen, onOpen, onClose } = useOpenControls();

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p>From: </p>
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
      </div>
      <Field.Root>
        <Field.Label>To:</Field.Label>
        <DebouncedTextInputWithVariablesButton
          onValueChange={handleToChange}
          defaultValue={options?.recipients?.join(", ")}
          placeholder="email1@gmail.com, email2@gmail.com"
        />
      </Field.Root>
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>Advanced</Accordion.Trigger>
          <Accordion.Panel>
            <Field.Root>
              <Field.Label>Reply to:</Field.Label>
              <DebouncedTextInputWithVariablesButton
                onValueChange={handleReplyToChange}
                defaultValue={options?.replyTo}
                placeholder={"email@gmail.com"}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Cc:</Field.Label>
              <DebouncedTextInputWithVariablesButton
                onValueChange={handleCcChange}
                defaultValue={options?.cc?.join(", ") ?? ""}
                placeholder="email1@gmail.com, email2@gmail.com"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Bcc:</Field.Label>
              <DebouncedTextInputWithVariablesButton
                onValueChange={handleBccChange}
                defaultValue={options?.bcc?.join(", ") ?? ""}
                placeholder="email1@gmail.com, email2@gmail.com"
              />
            </Field.Root>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
      <Field.Root>
        <Field.Label>Subject:</Field.Label>
        <DebouncedTextInputWithVariablesButton
          onValueChange={handleSubjectChange}
          defaultValue={options?.subject ?? ""}
        />
      </Field.Root>
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
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <p>Content: </p>
            <div className="flex items-center gap-2">
              <p className="text-sm">Text</p>
              <Switch
                checked={
                  options.isBodyCode ?? defaultSendEmailOptions.isBodyCode
                }
                onCheckedChange={handleIsBodyCodeChange}
              />
              <p className="text-sm">Code</p>
            </div>
          </div>
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
        </div>
      )}
      <SmtpCredentialsCreateDialog
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={updateCredentialsId}
      />
    </div>
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
