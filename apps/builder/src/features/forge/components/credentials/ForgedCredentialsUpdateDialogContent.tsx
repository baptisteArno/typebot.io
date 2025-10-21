import { useMutation, useQuery } from "@tanstack/react-query";
import type { CreatableCredentials } from "@typebot.io/credentials/schemas";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { z } from "@typebot.io/zod";
import type React from "react";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { ZodObjectLayout } from "../zodLayouts/ZodObjectLayout";

type Props = {
  credentialsId: string;
  blockDef: ForgedBlockDefinition;
  scope: "workspace" | "user";
  onUpdate: () => void;
};

export const ForgedCredentialsUpdateDialogContent = ({
  credentialsId,
  blockDef,
  onUpdate,
  scope,
}: Props) => {
  const { workspace } = useWorkspace();
  const [name, setName] = useState("");
  const [data, setData] = useState<any>();

  const [isUpdating, setIsUpdating] = useState(false);

  const { data: existingCredentials, refetch: refetchCredentials } = useQuery(
    trpc.credentials.getCredentials.queryOptions(
      scope === "workspace"
        ? {
            scope: "workspace",
            workspaceId: workspace?.id as string,
            credentialsId,
          }
        : {
            scope: "user",
            credentialsId,
          },
      {
        enabled: !!workspace?.id,
      },
    ),
  );

  useEffect(() => {
    if (!existingCredentials || data) return;
    setName(existingCredentials.name);
    setData(existingCredentials.data);
  }, [data, existingCredentials]);

  const { mutate } = useMutation(
    trpc.credentials.updateCredentials.mutationOptions({
      onMutate: () => setIsUpdating(true),
      onSettled: () => setIsUpdating(false),
      onError: (err) => {
        toast({
          description: err.message,
        });
      },
      onSuccess: () => {
        onUpdate();
        refetchCredentials();
      },
    }),
  );

  const updateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !blockDef.auth) return;
    mutate(
      scope === "workspace"
        ? {
            credentialsId,
            credentials: {
              type: blockDef.id,
              name: name ?? "My account",
              data,
            } as CreatableCredentials,
            scope: "workspace",
            workspaceId: workspace.id,
          }
        : {
            scope: "user",
            credentialsId,
            credentials: {
              type: blockDef.id,
              name: name ?? "My account",
              data,
            } as CreatableCredentials,
          },
    );
  };

  if (!blockDef.auth) return null;

  return (
    <Dialog.Popup render={<form onSubmit={updateCredentials} />}>
      <Dialog.Title>Update {blockDef.auth.name}</Dialog.Title>
      <Field.Root>
        <Field.Label>
          Label
          <MoreInfoTooltip>{`Choose a name to identify this ${blockDef.auth.name}`}</MoreInfoTooltip>
        </Field.Label>
        <Input
          defaultValue={name}
          onValueChange={setName}
          placeholder="My account"
        />
      </Field.Root>
      {data && (
        <ZodObjectLayout
          schema={
            blockDef.auth.type === "encryptedCredentials"
              ? blockDef.auth.schema
              : z.object({})
          }
          data={data}
          onDataChange={setData}
        />
      )}

      <Dialog.Footer>
        <Button
          type="submit"
          disabled={!data || Object.keys(data).length === 0 || isUpdating}
        >
          Update
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
