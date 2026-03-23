import { useMutation, useQuery } from "@tanstack/react-query";
import { T, useTranslate } from "@tolgee/react";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { AlertDialog } from "@typebot.io/ui/components/AlertDialog";
import { Button } from "@typebot.io/ui/components/Button";
import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { Table } from "@typebot.io/ui/components/Table";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { useRef, useState } from "react";
import { TimeSince } from "@/components/TimeSince";
import { orpc } from "@/lib/queryClient";
import { CreateApiTokenDialog } from "./CreateApiTokenDialog";

export const ApiTokensList = () => {
  const { t } = useTranslate();
  const { data, error, refetch } = useQuery(
    orpc.user.listApiTokens.queryOptions(),
  );
  const loadingRowKeys = Array.from(
    { length: 3 },
    (_, index) => `loading-row-${index}`,
  );
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useOpenControls();
  const [deletingId, setDeletingId] = useState<string>();
  const deleteCancelRef = useRef<HTMLButtonElement | null>(null);

  const { mutate: deleteToken } = useMutation(
    orpc.user.deleteApiToken.mutationOptions({
      onSuccess: () => {
        refetch();
        setDeletingId(undefined);
      },
    }),
  );

  const handleTokenCreated = () => {
    refetch();
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
          isOpen={isCreateOpen}
          onNewToken={handleTokenCreated}
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
          {data?.apiTokens?.map((token) => (
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
          {!error &&
            !data &&
            loadingRowKeys.map((key) => (
              <Table.Row key={key}>
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
      <AlertDialog.Root
        isOpen={isDefined(deletingId)}
        onClose={() => setDeletingId(undefined)}
      >
        <AlertDialog.Content initialFocus={deleteCancelRef}>
          <AlertDialog.Header>
            <AlertDialog.Title>
              {t("confirmModal.defaultTitle")}
            </AlertDialog.Title>
            <AlertDialog.Description>
              <T
                keyName="account.apiTokens.deleteConfirmationMessage"
                params={{
                  strong: (
                    <strong>
                      {data?.apiTokens?.find(byId(deletingId))?.name}
                    </strong>
                  ),
                }}
              />
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel ref={deleteCancelRef}>
              {t("cancel")}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              variant="destructive"
              onClick={() => {
                if (deletingId) {
                  deleteToken({ tokenId: deletingId });
                  setDeletingId(undefined);
                }
              }}
            >
              {t("account.apiTokens.deleteButton.label")}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};
