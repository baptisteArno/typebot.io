import { DropdownList } from "@/components/DropdownList";
import { CredentialsCreateModal } from "@/features/credentials/components/CredentialsCreateModal";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { HStack, Stack, useDisclosure } from "@chakra-ui/react";
import {
  type GroupTitlesAutoGeneration,
  aiProviders,
} from "@typebot.io/workspaces/schemas";
import { useState } from "react";
import { useWorkspace } from "../WorkspaceProvider";

type Props = {
  values: GroupTitlesAutoGeneration;
  onChange: (value: GroupTitlesAutoGeneration) => void;
};
export const GroupTitlesAutoGenForm = ({
  values: { credentialsId, provider },
  onChange,
}: Props) => {
  const { workspace } = useWorkspace();
  const [credsCreatingType, setCredsCreatingType] = useState<
    typeof provider | undefined
  >();

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
            size="sm"
            direction="row"
            label="Provider:"
            items={aiProviders.map((item) => ({
              value: item,
              label: <BlockLabel type={item} />,
              icon: <BlockIcon type={item} boxSize="16px" />,
            }))}
            currentItem={provider}
            onItemSelect={updateProvider}
          />
        </HStack>
        {provider && workspace && (
          <CredentialsDropdown
            size="sm"
            type={provider}
            workspaceId={workspace.id}
            currentCredentialsId={credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={() => {
              setCredsCreatingType(provider);
            }}
            credentialsName="account"
          />
        )}
      </HStack>
      <CredentialsCreateModal
        creatingType={credsCreatingType}
        onClose={() => {
          setCredsCreatingType(undefined);
        }}
        onSubmit={updateCredentialsId}
      />
    </Stack>
  );
};
