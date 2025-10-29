import { useTranslate } from "@tolgee/react";
import { proChatTiers } from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Table } from "@typebot.io/ui/components/Table";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ChatsProTiersDialog = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslate();

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup>
        <Dialog.Title>{t("billing.tiersModal.heading")}</Dialog.Title>
        <Dialog.CloseButton />
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Max chats</Table.Head>
              <Table.Head>Price per month</Table.Head>
              <Table.Head>Price per 1k chats</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {proChatTiers.map((tier, index) => {
              const pricePerMonth =
                (tier.flat_amount ?? proChatTiers.at(-2)?.flat_amount ?? 0) /
                100;
              return (
                <Table.Row key={tier.up_to}>
                  <Table.Cell>
                    {tier.up_to === "inf"
                      ? "2,000,000+"
                      : tier.up_to.toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>
                    {index === 0 ? "included" : formatPrice(pricePerMonth)}
                  </Table.Cell>
                  <Table.Cell>
                    {index === proChatTiers.length - 1
                      ? formatPrice(4.42, { maxFractionDigits: 2 })
                      : index === 0
                        ? "included"
                        : formatPrice(
                            (((pricePerMonth * 100) /
                              ((tier.up_to as number) -
                                (proChatTiers.at(0)?.up_to as number))) *
                              1000) /
                              100,
                            { maxFractionDigits: 2 },
                          )}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
