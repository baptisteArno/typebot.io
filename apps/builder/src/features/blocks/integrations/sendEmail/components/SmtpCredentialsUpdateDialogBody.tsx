import { ORPCError } from "@orpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import type React from "react";
import { useEffect, useState } from "react";
import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { orpc, orpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { SmtpConfigForm } from "./SmtpConfigForm";

type Props = {
  credentialsId: string;
  onUpdate: () => void;
};

export const SmtpCredentialsUpdateDialogBody = ({
  credentialsId,
  onUpdate,
}: Props) => {
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<SmtpCredentials["data"]>();

  const { data: existingCredentials } = useQuery(
    orpc.credentials.getCredentials.queryOptions({
      input: {
        scope: "workspace",
        workspaceId: workspace!.id,
        credentialsId: credentialsId,
      },
      enabled: !!workspace?.id,
    }),
  );

  useEffect(() => {
    if (!existingCredentials || smtpConfig) return;
    setSmtpConfig(existingCredentials.data as any);
  }, [existingCredentials, smtpConfig]);

  const { mutate } = useMutation(
    orpc.credentials.updateCredentials.mutationOptions({
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
    if (
      !user?.email ||
      !workspace?.id ||
      !smtpConfig ||
      !smtpConfig.username ||
      !smtpConfig.password ||
      !smtpConfig.host
    )
      return;
    setIsCreating(true);
    try {
      await orpcClient.email.testSmtpConfig({
        from: smtpConfig.from,
        port: smtpConfig.port,
        isTlsEnabled: smtpConfig.isTlsEnabled,
        username: smtpConfig.username,
        password: smtpConfig.password,
        host: smtpConfig.host,
        to: user.email,
      });
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
    } catch (err) {
      if (err instanceof ORPCError && err.code === "INTERNAL_SERVER_ERROR") {
        toast({
          description:
            "We couldn't send the test email with your configuration",
          details: err.data?.message,
        });
      }
    }
    setIsCreating(false);
  };
  return (
    <Dialog.Popup render={<form onSubmit={handleUpdateClick} />}>
      <SmtpConfigForm config={smtpConfig} onConfigChange={setSmtpConfig} />

      <Dialog.Footer>
        <Button
          type="submit"
          disabled={
            isNotDefined(smtpConfig?.from.email) ||
            isNotDefined(smtpConfig?.host) ||
            isNotDefined(smtpConfig?.username) ||
            isNotDefined(smtpConfig?.password) ||
            isNotDefined(smtpConfig?.port) ||
            isCreating
          }
        >
          Update
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
