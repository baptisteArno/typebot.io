import { proChatTiers } from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/table";

export const TiersDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => (
  <Dialog.Root isOpen={open} onClose={onClose}>
    <Dialog.Popup>
      <Dialog.Title>Chats pricing table</Dialog.Title>
      <Dialog.CloseButton />
      <TableRoot>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Max chats</TableHead>
              <TableHead>Price per month</TableHead>
              <TableHead>Price per 1k chats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proChatTiers.map((tier, index) => {
              const pricePerMonth =
                (tier.flat_amount ?? proChatTiers.at(-2)?.flat_amount ?? 0) /
                100;
              return (
                <TableRow key={tier.up_to}>
                  <TableCell>
                    {tier.up_to === "inf"
                      ? "2,000,000+"
                      : tier.up_to.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {index === 0 ? "included" : formatPrice(pricePerMonth)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableRoot>
    </Dialog.Popup>
  </Dialog.Root>
);
