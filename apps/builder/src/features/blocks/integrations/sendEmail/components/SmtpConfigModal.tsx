import { useUser } from "@/features/account/hooks/useUser";
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
} from "@chakra-ui/react";
import type { SmtpCredentials } from "@typebot.io/blocks-integrations/sendEmail/schema";
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
  const { showToast } = useToast();
  const [smtpConfig, setSmtpConfig] = useState<SmtpCredentials["data"]>({
    from: {},
    port: 25,
  });
  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext();
  const { mutate } = trpc.credentials.createCredentials.useMutation({
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
      showToast({
        title: "Invalid configuration",
        description: "We couldn't send the test email with your configuration",
        details: {
          content:
            "response" in testSmtpError
              ? (testSmtpError.response as string)
              : testSmtpError.message,
          lang: "json",
        },
      });
      return;
    }
    mutate({
      credentials: {
        data: smtpConfig,
        name: smtpConfig.from.email as string,
        type: "smtp",
        workspaceId: workspace.id,
      },
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
            colorScheme="blue"
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
