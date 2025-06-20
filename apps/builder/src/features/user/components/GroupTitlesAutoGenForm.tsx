import { DropdownList } from "@/components/DropdownList";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { Textarea } from "@/components/inputs";
import { CredentialsCreateModal } from "@/features/credentials/components/CredentialsCreateModal";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { ForgeSelectInput } from "@/features/forge/components/ForgeSelectInput";
import { useForgedBlock } from "@/features/forge/hooks/useForgedBlock";
import { HStack, Stack } from "@chakra-ui/react";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import type { Credentials } from "@typebot.io/credentials/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { defaultGroupTitleGenPrompt } from "@typebot.io/user/constants";
import type { GroupTitlesAutoGeneration } from "@typebot.io/user/schemas";
import { useState } from "react";

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
  const { blockDef, actionDef } = useForgedBlock({
    nodeType: provider as BlockV6["type"],
    feature: "aiGenerate",
  });
  const [credsCreatingType, setCredsCreatingType] = useState<typeof provider>();

  const updateProvider = (provider: string) => {
    onChange({
      provider: provider as GroupTitlesAutoGeneration["provider"],
    });
  };

  const updateCredentialsId = (credentialsId?: string) => {
    onChange({
      credentialsId,
    });
    setCredsCreatingType(undefined);
  };

  return (
    <Stack>
      <HStack>
        <HStack>
          <DropdownList
            direction="row"
            label="Provider:"
            placeholder="Select"
            items={Object.values(forgedBlocks)
              .filter((block) => block.actions.some((a) => a.aiGenerate))
              .map((block) => ({
                value: block.id,
                label: <BlockLabel type={block.id} />,
                icon: <BlockIcon type={block.id} boxSize="16px" />,
              }))}
            currentItem={provider}
            onItemSelect={updateProvider}
          />
        </HStack>
        {provider && (
          <CredentialsDropdown
            scope={{ type: "user", userId }}
            type={provider as Credentials["type"]}
            currentCredentialsId={credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={() => {
              setCredsCreatingType(provider);
            }}
            credentialsName="account"
            flexShrink={0}
          />
        )}
        {blockDef && credentialsId && actionDef?.aiGenerate?.fetcherId && (
          <HStack>
            <ForgeSelectInput
              defaultValue={model}
              blockDef={blockDef}
              credentialsScope="user"
              fetcherId={actionDef.aiGenerate.fetcherId}
              options={{
                credentialsId,
              }}
              onChange={(value) => {
                onChange({
                  model: value,
                });
              }}
            />
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
      <CredentialsCreateModal
        creatingType={credsCreatingType as Credentials["type"]}
        scope="user"
        onClose={() => {
          setCredsCreatingType(undefined);
        }}
        onSubmit={updateCredentialsId}
      />
    </Stack>
  );
};
