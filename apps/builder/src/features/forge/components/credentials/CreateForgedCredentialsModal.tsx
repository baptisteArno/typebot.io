import { TextInput } from "@/components/inputs/TextInput";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import type { Credentials } from "@typebot.io/credentials/schemas";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { useState } from "react";
import { ZodObjectLayout } from "../zodLayouts/ZodObjectLayout";

type Props = {
  blockDef: ForgedBlockDefinition;
  isOpen: boolean;
  defaultData?: any;
  scope: "workspace" | "user";
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const CreateForgedCredentialsModal = ({
  blockDef,
  isOpen,
  defaultData,
  scope,
  onClose,
  onNewCredentials,
}: Props) => {
  if (!blockDef.auth) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <CreateForgedCredentialsModalContent
        defaultData={defaultData}
        blockDef={blockDef}
        scope={scope}
        onNewCredentials={(id) => {
          onClose();
          onNewCredentials(id);
        }}
      />
    </Modal>
  );
};

export const CreateForgedCredentialsModalContent = ({
  blockDef,
  onNewCredentials,
  scope,
}: Pick<Props, "blockDef" | "onNewCredentials" | "defaultData" | "scope">) => {
  const { workspace } = useWorkspace();
  const [name, setName] = useState("");
  const [data, setData] = useState({});

  const [isCreating, setIsCreating] = useState(false);

  const { mutate } = useMutation(
    trpc.credentials.createCredentials.mutationOptions({
      onMutate: () => setIsCreating(true),
      onSettled: () => setIsCreating(false),
      onError: (err) => {
        toast({
          description: err.message,
        });
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.credentials.listCredentials.queryKey(),
        });
        onNewCredentials(data.credentialsId);
      },
    }),
  );

  const createOpenAICredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !blockDef.auth) return;
    mutate(
      scope === "workspace"
        ? {
            credentials: {
              type: blockDef.id,
              name: name ?? "My account",
              data,
            } as Credentials,
            scope: "workspace",
            workspaceId: workspace.id,
          }
        : {
            credentials: {
              type: blockDef.id,
              name: name ?? "My account",
              data,
            } as Credentials,
            scope: "user",
          },
    );
  };

  if (!blockDef.auth) return null;
  return (
    <ModalContent>
      <ModalHeader>Add {blockDef.auth.name}</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={createOpenAICredentials}>
        <ModalBody as={Stack} spacing="6">
          <TextInput
            label="Label"
            moreInfoTooltip={`Choose a name to identify this ${blockDef.auth.name}`}
            onChange={setName}
            placeholder="My account"
            withVariableButton={false}
            debounceTimeout={0}
          />
          <ZodObjectLayout
            schema={blockDef.auth.schema}
            data={data}
            onDataChange={setData}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            isLoading={isCreating}
            isDisabled={Object.keys(data).length === 0}
            colorScheme="orange"
          >
            Create
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
};
