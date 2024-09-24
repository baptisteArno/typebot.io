import { useUser } from "@/features/account/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react";
import type { SmtpCredentials } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { isNotDefined } from "@typebot.io/lib/utils";
import type React from "react";
import { useEffect, useState } from "react";
import { testSmtpConfig } from "../queries/testSmtpConfigQuery";
import { SmtpConfigForm } from "./SmtpConfigForm";

type Props = {
  credentialsId: string;
  onUpdate: () => void;
};

export const SmtpUpdateModalContent = ({ credentialsId, onUpdate }: Props) => {
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();
  const [smtpConfig, setSmtpConfig] = useState<SmtpCredentials["data"]>();

  const { data: existingCredentials } =
    trpc.credentials.getCredentials.useQuery(
      {
        workspaceId: workspace!.id,
        credentialsId: credentialsId,
      },
      {
        enabled: !!workspace?.id,
      },
    );

  useEffect(() => {
    if (!existingCredentials || smtpConfig) return;
    setSmtpConfig(existingCredentials.data);
  }, [existingCredentials, smtpConfig]);

  const { mutate } = trpc.credentials.updateCredentials.useMutation({
    onSettled: () => setIsCreating(false),
    onError: (err) => {
      showToast({
        description: err.message,
        status: "error",
      });
    },
    onSuccess: () => {
      onUpdate();
    },
  });

  const handleUpdateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !workspace?.id || !smtpConfig) return;
    setIsCreating(true);
    const { error: testSmtpError } = await testSmtpConfig(
      smtpConfig,
      user.email,
    );
    if (testSmtpError) {
      setIsCreating(false);
      return showToast({
        title: "Invalid configuration",
        description: "We couldn't send the test email with your configuration",
      });
    }
    mutate({
      credentialsId,
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
      <ModalHeader>Update SMTP config</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={handleUpdateClick}>
        <ModalBody>
          <SmtpConfigForm config={smtpConfig} onConfigChange={setSmtpConfig} />
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="blue"
            isDisabled={
              isNotDefined(smtpConfig?.from.email) ||
              isNotDefined(smtpConfig?.host) ||
              isNotDefined(smtpConfig?.username) ||
              isNotDefined(smtpConfig?.password) ||
              isNotDefined(smtpConfig?.port)
            }
            isLoading={isCreating}
          >
            Update
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
};
