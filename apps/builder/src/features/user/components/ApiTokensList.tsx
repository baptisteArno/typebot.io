import { T, useTranslate } from "@tolgee/react";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { Table } from "@typebot.io/ui/components/Table";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import type { ClientUser } from "@typebot.io/user/schemas";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TimeSince } from "@/components/TimeSince";
import { toast } from "@/lib/toast";
import { useApiTokens } from "../hooks/useApiTokens";
import { deleteApiTokenQuery } from "../queries/deleteApiTokenQuery";
import type { ApiTokenFromServer } from "../types";
import { CreateApiTokenDialog } from "./CreateApiTokenDialog";

type Props = { user: ClientUser };

export const ApiTokensList = ({ user }: Props) => {
  const { t } = useTranslate();
  const { apiTokens, isLoading, mutate } = useApiTokens({
    userId: user.id,
    onError: (e) =>
      toast({
        title: "Failed to fetch tokens",
        description: e.message,
      }),
  });
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useOpenControls();
  const [deletingId, setDeletingId] = useState<string>();

  const refreshListWithNewToken = (token: ApiTokenFromServer) => {
    if (!apiTokens) return;
    mutate({ apiTokens: [token, ...apiTokens] });
  };

  const deleteToken = async (tokenId?: string) => {
    if (!apiTokens || !tokenId) return;
    const { error } = await deleteApiTokenQuery({ userId: user.id, tokenId });
    if (!error)
      mutate({ apiTokens: apiTokens.filter((t) => t.id !== tokenId) });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>{t("account.apiTokens.heading")}</h2>
      <p>{t("account.apiTokens.description")}</p>
      <div className="flex justify-end">
        <Button onClick={onCreateOpen} variant="secondary">
          {t("account.apiTokens.createButton.label")}
        </Button>
        <CreateApiTokenDialog
          userId={user.id}
          isOpen={isCreateOpen}
          onNewToken={refreshListWithNewToken}
          onClose={onCreateClose}
        />
      </div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>{t("account.apiTokens.table.nameHeader")}</Table.Head>
            <Table.Head className="w-32">
              {t("account.apiTokens.table.createdHeader")}
            </Table.Head>
            <Table.Head className="w-0" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {apiTokens?.map((token) => (
            <Table.Row key={token.id}>
              <Table.Cell>{token.name}</Table.Cell>
              <Table.Cell>
                <TimeSince date={token.createdAt} />
              </Table.Cell>
              <Table.Cell>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={() => setDeletingId(token.id)}
                >
                  {t("account.apiTokens.deleteButton.label")}
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
          {isLoading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>
                  <Checkbox disabled />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-1" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-1" />
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table.Root>
      <ConfirmDialog
        isOpen={isDefined(deletingId)}
        onConfirm={() => deleteToken(deletingId)}
        onClose={() => setDeletingId(undefined)}
        actionType="destructive"
        confirmButtonLabel={t("account.apiTokens.deleteButton.label")}
      >
        <p>
          <T
            keyName="account.apiTokens.deleteConfirmationMessage"
            params={{
              strong: (
                <strong>{apiTokens?.find(byId(deletingId))?.name}</strong>
              ),
            }}
          />
        </p>
      </ConfirmDialog>
    </div>
  );
};
