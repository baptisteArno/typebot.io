import {
  Checkbox,
  Heading,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { Download01Icon } from "@typebot.io/ui/icons/Download01Icon";
import { FileEmpty02Icon } from "@typebot.io/ui/icons/FileEmpty02Icon";
import { ButtonLink } from "@/components/ButtonLink";
import { useInvoicesQuery } from "../hooks/useInvoicesQuery";

type Props = {
  workspaceId: string;
};

export const InvoicesList = ({ workspaceId }: Props) => {
  const { t } = useTranslate();
  const { data, status } = useInvoicesQuery(workspaceId);

  return (
    <Stack spacing={6}>
      <Heading fontSize="3xl">{t("billing.invoices.heading")}</Heading>
      {data?.invoices.length === 0 && status !== "pending" ? (
        <Text>{t("billing.invoices.empty")}</Text>
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th w="0" />
                <Th>#</Th>
                <Th>{t("billing.invoices.paidAt")}</Th>
                <Th>{t("billing.invoices.subtotal")}</Th>
                <Th w="0" />
              </Tr>
            </Thead>
            <Tbody>
              {data?.invoices.map((invoice) => (
                <Tr key={invoice.id}>
                  <Td>
                    <FileEmpty02Icon />
                  </Td>
                  <Td>{invoice.id}</Td>
                  <Td>
                    {invoice.date
                      ? new Date(invoice.date * 1000).toDateString()
                      : ""}
                  </Td>
                  <Td>{getFormattedPrice(invoice.amount, invoice.currency)}</Td>
                  <Td>
                    {invoice.url && (
                      <ButtonLink
                        size="icon"
                        variant="outline"
                        href={invoice.url}
                        target="_blank"
                        aria-label={"Download invoice"}
                      >
                        <Download01Icon />
                      </ButtonLink>
                    )}
                  </Td>
                </Tr>
              ))}
              {status === "pending" &&
                Array.from({ length: 3 }).map((_, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Checkbox isDisabled />
                    </Td>
                    <Td>
                      <Skeleton className="h-1" />
                    </Td>
                    <Td>
                      <Skeleton className="h-1" />
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
};

const getFormattedPrice = (amount: number, currency: string) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });

  return formatter.format(amount / 100);
};
