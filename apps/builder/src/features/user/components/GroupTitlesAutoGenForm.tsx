import { HStack, Stack } from "@chakra-ui/react";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import type { Credentials } from "@typebot.io/credentials/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { defaultGroupTitleGenPrompt } from "@typebot.io/user/constants";
import type { GroupTitlesAutoGeneration } from "@typebot.io/user/schemas";
import { useState } from "react";
import { Textarea } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CredentialsCreateDialog } from "@/features/credentials/components/CredentialsCreateDialog";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { AutocompleteInput } from "@/features/forge/components/ForgeAutocompleteInput";
import { ForgeSelectInput } from "@/features/forge/components/ForgeSelectInput";
import { useForgedBlock } from "@/features/forge/hooks/useForgedBlock";

type Props = {
  userId: string;
  values: GroupTitlesAutoGeneration;
  onChange: (value: GroupTitlesAutoGeneration) => void;
};
export const GroupTitlesAutoGenForm = ({
  userId,
  values: { credentialsId, provider, prompt, model },
  onChange,
}: Props) => {
  const [isCredsDialogOpen, setIsCredsDialogOpen] = useState(false);
  const { blockDef, actionDef } = useForgedBlock({
    nodeType: provider as BlockV6["type"],
    feature: "aiGenerate",
  });
  const [credsCreatingType, setCredsCreatingType] = useState<typeof provider>();

  const updateProvider = (
    provider: GroupTitlesAutoGeneration["provider"] | undefined,
  ) => {
    onChange({
      provider,
    });
  };

  const updateCredentialsId = (credentialsId?: string) => {
    onChange({
      credentialsId,
    });
    setIsCredsDialogOpen(false);
    setCredsCreatingType(undefined);
  };

  return (
    <Stack>
      <HStack>
        <HStack>
          <Field.Root className="flex-row items-center">
            <Field.Label>Provider:</Field.Label>
            <BasicSelect
              placeholder="Select"
              items={Object.values(forgedBlocks)
                .filter((block) => block.actions.some((a) => a.aiGenerate))
                .map((block) => ({
                  value: block.id as GroupTitlesAutoGeneration["provider"],
                  label: (
                    <div className="flex items-center gap-2">
                      <BlockIcon type={block.id} className="size-4" />
                      <BlockLabel type={block.id} />
                    </div>
                  ),
                }))}
              value={provider as GroupTitlesAutoGeneration["provider"]}
              onChange={updateProvider}
            />
          </Field.Root>
        </HStack>
        {provider && (
          <CredentialsDropdown
            scope={{ type: "user", userId }}
            type={provider as Credentials["type"]}
            currentCredentialsId={credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={() => {
              setCredsCreatingType(provider);
              setIsCredsDialogOpen(true);
            }}
            credentialsName="account"
          />
        )}
        {blockDef && credentialsId && actionDef?.aiGenerate && (
          <HStack>
            {actionDef.aiGenerate.models.type === "dynamic" ? (
              <ForgeSelectInput
                defaultValue={model}
                blockDef={blockDef}
                credentialsScope="user"
                fetcherId={actionDef.aiGenerate.models.fetcherId}
                options={{
                  credentialsId,
                }}
                onChange={(value) => {
                  onChange({
                    model: value,
                  });
                }}
              />
            ) : (
              <AutocompleteInput
                items={actionDef.aiGenerate.models.items}
                defaultValue={model}
                onChange={(value) => {
                  onChange({
                    model: value,
                  });
                }}
              />
            )}
            <MoreInfoTooltip>
              We recommend choosing a small model for this feature
            </MoreInfoTooltip>
          </HStack>
        )}
      </HStack>
      <Textarea
        label="Prompt:"
        withVariableButton={false}
        defaultValue={prompt ?? defaultGroupTitleGenPrompt}
        onChange={(value) => {
          onChange({
            prompt: value,
          });
        }}
      />
      <CredentialsCreateDialog
        type={credsCreatingType as Credentials["type"]}
        scope="user"
        isOpen={isCredsDialogOpen}
        onClose={() => {
          setIsCredsDialogOpen(false);
        }}
        onSubmit={updateCredentialsId}
      />
    </Stack>
  );
};
