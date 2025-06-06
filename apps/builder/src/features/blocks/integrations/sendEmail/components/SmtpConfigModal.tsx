import { useUser } from "@/features/user/hooks/useUser";
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
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import type React from "react";
import { useState } from "react";
import { testSmtpConfig } from "../queries/testSmtpConfigQuery";
import { SmtpConfigForm } from "./SmtpConfigForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const SmtpConfigModal = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <SmtpCreateModalContent
        onNewCredentials={(id) => {
          onNewCredentials(id);
          onClose();
        }}
      />
    </Modal>
  );
};

export const SmtpCreateModalContent = ({
  onNewCredentials,
}: Pick<Props, "onNewCredentials">) => {
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<SmtpCredentials["data"]>({
    from: {},
    port: 25,
  });
  const { mutate } = useMutation(
    trpc.credentials.createCredentials.mutationOptions({
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

  const handleCreateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !workspace?.id) return;
    setIsCreating(true);
    const { error: testSmtpError } = await testSmtpConfig(
      smtpConfig,
      user.email,
    );
    if (testSmtpError) {
      console.error(testSmtpError);
      setIsCreating(false);
      toast({
        description: "We couldn't send the test email with your configuration",
        details:
          "response" in testSmtpError
            ? (testSmtpError.response as string)
            : testSmtpError.message,
      });
      return;
    }
    mutate({
      credentials: {
        data: smtpConfig,
        name: smtpConfig.from.email as string,
        type: "smtp",
      },
      scope: "workspace",
      workspaceId: workspace.id,
    });
  };
  return (
    <ModalContent>
      <ModalHeader>Create SMTP config</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={handleCreateClick}>
        <ModalBody>
          <SmtpConfigForm config={smtpConfig} onConfigChange={setSmtpConfig} />
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="orange"
            isDisabled={
              isNotDefined(smtpConfig.from.email) ||
              isNotDefined(smtpConfig.host) ||
              isNotDefined(smtpConfig.username) ||
              isNotDefined(smtpConfig.password) ||
              isNotDefined(smtpConfig.port)
            }
            isLoading={isCreating}
          >
            Create
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
};
