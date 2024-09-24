import { TextInput } from "@/components/inputs/TextInput";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
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
import type { Credentials } from "@typebot.io/credentials/schemas";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type React from "react";
import { useState } from "react";
import { ZodObjectLayout } from "../zodLayouts/ZodObjectLayout";

type Props = {
  blockDef: ForgedBlockDefinition;
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultData?: any;
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const CreateForgedCredentialsModal = ({
  blockDef,
  isOpen,
  defaultData,
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
}: Pick<Props, "blockDef" | "onNewCredentials" | "defaultData">) => {
  const { workspace } = useWorkspace();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [data, setData] = useState({});

  const [isCreating, setIsCreating] = useState(false);

  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext();

  const { mutate } = trpc.credentials.createCredentials.useMutation({
    onMutate: () => setIsCreating(true),
    onSettled: () => setIsCreating(false),
    onError: (err) => {
      showToast({
        description: err.message,
        status: "error",
      });
    },
    onSuccess: (data) => {
      refetchCredentials();
      onNewCredentials(data.credentialsId);
    },
  });

  const createOpenAICredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !blockDef.auth) return;
    mutate({
      credentials: {
        type: blockDef.id,
        workspaceId: workspace.id,
        name,
        data,
      } as Credentials,
    });
  };

  if (!blockDef.auth) return null;
  return (
    <ModalContent>
      <ModalHeader>Add {blockDef.auth.name}</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={createOpenAICredentials}>
        <ModalBody as={Stack} spacing="6">
          <TextInput
            isRequired
            label="Name"
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
            colorScheme="blue"
          >
            Create
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
};
