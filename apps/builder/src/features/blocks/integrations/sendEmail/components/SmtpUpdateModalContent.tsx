import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
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
  const [smtpConfig, setSmtpConfig] = useState<SmtpCredentials["data"]>();

  const { data: existingCredentials } = useQuery(
    trpc.credentials.getCredentials.queryOptions(
      {
        scope: "workspace",
        workspaceId: workspace!.id,
        credentialsId: credentialsId,
      },
      {
        enabled: !!workspace?.id,
      },
    ),
  );

  useEffect(() => {
    if (!existingCredentials || smtpConfig) return;
    setSmtpConfig(existingCredentials.data as any);
  }, [existingCredentials, smtpConfig]);

  const { mutate } = useMutation(
    trpc.credentials.updateCredentials.mutationOptions({
      onSettled: () => setIsCreating(false),
      onError: (err) => {
        toast({
          description: err.message,
        });
      },
      onSuccess: () => {
        onUpdate();
      },
    }),
  );

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
      toast({
        description: "We couldn't send the test email with your configuration",
      });
    }
    mutate({
      credentialsId,
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
      <ModalHeader>Update SMTP config</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={handleUpdateClick}>
        <ModalBody>
          <SmtpConfigForm config={smtpConfig} onConfigChange={setSmtpConfig} />
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="orange"
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
