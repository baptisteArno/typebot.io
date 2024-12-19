import { iconButtonVariants } from "@/components/IconButton";
import { ScrollableDialog } from "@/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { DialogDismiss, DialogHeading } from "@ariakit/react";
import { proChatTiers } from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";

export const TiersDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => (
  <ScrollableDialog open={open} onClose={onClose}>
    <div className="flex justify-between items-center">
      <DialogHeading className="text-2xl">Chats pricing table</DialogHeading>
      <DialogDismiss className={iconButtonVariants({ variant: "secondary" })}>
        <CloseIcon />
      </DialogDismiss>
    </div>
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
            (tier.flat_amount ?? proChatTiers.at(-2)?.flat_amount ?? 0) / 100;
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
  </ScrollableDialog>
);
