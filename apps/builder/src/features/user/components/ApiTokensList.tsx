import {
  Checkbox,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { T, useTranslate } from "@tolgee/react";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
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
  } = useDisclosure();
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
    <Stack spacing={4}>
      <Heading fontSize="2xl">{t("account.apiTokens.heading")}</Heading>
      <Text>{t("account.apiTokens.description")}</Text>
      <Flex justifyContent="flex-end">
        <Button onClick={onCreateOpen} variant="secondary">
          {t("account.apiTokens.createButton.label")}
        </Button>
        <CreateApiTokenDialog
          userId={user.id}
          isOpen={isCreateOpen}
          onNewToken={refreshListWithNewToken}
          onClose={onCreateClose}
        />
      </Flex>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>{t("account.apiTokens.table.nameHeader")}</Th>
              <Th w="130px">{t("account.apiTokens.table.createdHeader")}</Th>
              <Th w="0" />
            </Tr>
          </Thead>
          <Tbody>
            {apiTokens?.map((token) => (
              <Tr key={token.id}>
                <Td>{token.name}</Td>
                <Td>
                  <TimeSince date={token.createdAt} />
                </Td>
                <Td>
                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={() => setDeletingId(token.id)}
                  >
                    {t("account.apiTokens.deleteButton.label")}
                  </Button>
                </Td>
              </Tr>
            ))}
            {isLoading &&
              Array.from({ length: 3 }).map((_, idx) => (
                <Tr key={idx}>
                  <Td>
                    <Checkbox isDisabled />
                  </Td>
                  <Td>
                    <Skeleton h="5px" />
                  </Td>
                  <Td>
                    <Skeleton h="5px" />
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
      <ConfirmDialog
        isOpen={isDefined(deletingId)}
        onConfirm={() => deleteToken(deletingId)}
        onClose={() => setDeletingId(undefined)}
        actionType="destructive"
        confirmButtonLabel={t("account.apiTokens.deleteButton.label")}
      >
        <Text>
          <T
            keyName="account.apiTokens.deleteConfirmationMessage"
            params={{
              strong: (
                <strong>{apiTokens?.find(byId(deletingId))?.name}</strong>
              ),
            }}
          />
        </Text>
      </ConfirmDialog>
    </Stack>
  );
};
