import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import type React from "react";
import { useState } from "react";
import { testSmtpConfig } from "../queries/testSmtpConfigQuery";
import { SmtpConfigForm } from "./SmtpConfigForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const SmtpCredentialsCreateDialog = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <SmtpCredentialsCreateDialogBody
        onNewCredentials={(id) => {
          onNewCredentials(id);
          onClose();
        }}
      />
    </Dialog.Root>
  );
};

export const SmtpCredentialsDialogTitle = ({
  mode,
}: {
  mode: "create" | "update";
}) => {
  return (
    <Dialog.Title>
      {mode === "create" ? "Create" : "Update"} SMTP config
    </Dialog.Title>
  );
};

export const SmtpCredentialsCreateDialogBody = ({
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
    <Dialog.Popup render={<form onSubmit={handleCreateClick} />}>
      <SmtpCredentialsDialogTitle mode="create" />
      <SmtpConfigForm config={smtpConfig} onConfigChange={setSmtpConfig} />

      <Dialog.Footer>
        <Button
          type="submit"
          disabled={
            isNotDefined(smtpConfig.from.email) ||
            isNotDefined(smtpConfig.host) ||
            isNotDefined(smtpConfig.username) ||
            isNotDefined(smtpConfig.password) ||
            isNotDefined(smtpConfig.port) ||
            isCreating
          }
        >
          Create
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
