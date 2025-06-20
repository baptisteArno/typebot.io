import { TextLink } from "@/components/TextLink";
import { TextInput } from "@/components/inputs/TextInput";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import {
  Alert,
  AlertIcon,
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
import type React from "react";
import { useState } from "react";

const openAITokensPage = "https://platform.openai.com/account/api-keys";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const OpenAICredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  const { workspace } = useWorkspace();
  const [apiKey, setApiKey] = useState("");
  const [name, setName] = useState("");

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
        onClose();
      },
    }),
  );

  const createOpenAICredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    mutate({
      scope: "workspace",
      workspaceId: workspace.id,
      credentials: {
        type: "openai",
        name,
        data: {
          apiKey,
        },
      } as Credentials,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add OpenAI account</ModalHeader>
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
            <TextInput
              isRequired
              type="password"
              label="API key"
              helperText={
                <>
                  You can generate an API key{" "}
                  <TextLink href={openAITokensPage} isExternal>
                    here
                  </TextLink>
                  .
                </>
              }
              onChange={setApiKey}
              placeholder="sk-..."
              withVariableButton={false}
              debounceTimeout={0}
            />
            <Alert status="warning">
              <AlertIcon />
              Make sure to add a payment method to your OpenAI account.
              Otherwise, it will not work after a few messages.
            </Alert>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              isLoading={isCreating}
              isDisabled={apiKey === "" || name === ""}
              colorScheme="orange"
            >
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
