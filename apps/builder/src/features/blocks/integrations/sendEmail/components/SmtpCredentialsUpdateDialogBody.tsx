import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import type React from "react";
import { useEffect, useState } from "react";
import { testSmtpConfig } from "../queries/testSmtpConfigQuery";
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
