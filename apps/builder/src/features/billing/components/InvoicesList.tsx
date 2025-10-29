import { useTranslate } from "@tolgee/react";
import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { Table } from "@typebot.io/ui/components/Table";
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
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl">{t("billing.invoices.heading")}</h2>
      {data?.invoices.length === 0 && status !== "pending" ? (
        <p>{t("billing.invoices.empty")}</p>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-0" />
              <Table.Head>#</Table.Head>
              <Table.Head>{t("billing.invoices.paidAt")}</Table.Head>
              <Table.Head>{t("billing.invoices.subtotal")}</Table.Head>
              <Table.Head className="w-0" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.invoices.map((invoice) => (
              <Table.Row key={invoice.id}>
                <Table.Cell>
                  <FileEmpty02Icon />
                </Table.Cell>
                <Table.Cell>{invoice.id}</Table.Cell>
                <Table.Cell>
                  {invoice.date
                    ? new Date(invoice.date * 1000).toDateString()
                    : ""}
                </Table.Cell>
                <Table.Cell>
                  {getFormattedPrice(invoice.amount, invoice.currency)}
                </Table.Cell>
                <Table.Cell>
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
                </Table.Cell>
              </Table.Row>
            ))}
            {status === "pending" &&
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
      )}
    </div>
  );
};

const getFormattedPrice = (amount: number, currency: string) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });

  return formatter.format(amount / 100);
};
