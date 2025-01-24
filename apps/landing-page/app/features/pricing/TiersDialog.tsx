import { IconButton } from "@/components/IconButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/table";
import { Dialog, Portal } from "@ark-ui/react";
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
  <Dialog.Root open={open} onOpenChange={(e) => (!e.open ? onClose() : null)}>
    <Portal>
      <Dialog.Backdrop className="fixed inset-0 w-full bg-gray-12/10 data-[state=closed]:motion-opacity-out-0 data-[state=open]:motion-opacity-in-0 data-[state=open]:motion-blur-in-0 data-[state=closed]:motion-blur-out-0 backdrop-blur-sm motion-duration-150 overflow-auto" />
      <Dialog.Positioner className="flex justify-center fixed inset-0 w-full py-12">
        <Dialog.Content className="bg-gray-1 p-6 rounded-xl data-[state=open]:motion-translate-y-in-[15px] data-[state=closed]:motion-translate-y-out-[15px] motion-duration-150 w-full max-w-xl overflow-auto">
          <Dialog.Title className="text-2xl">Chats pricing table</Dialog.Title>
          <Dialog.CloseTrigger asChild>
            <IconButton
              aria-label="Close"
              variant="secondary"
              className="absolute top-4 right-4"
            >
              <CloseIcon />
            </IconButton>
          </Dialog.CloseTrigger>
          <Dialog.Description>
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
                      (tier.flat_amount ??
                        proChatTiers.at(-2)?.flat_amount ??
                        0) / 100;
                    return (
                      <TableRow key={tier.up_to}>
                        <TableCell>
                          {tier.up_to === "inf"
                            ? "2,000,000+"
                            : tier.up_to.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {index === 0
                            ? "included"
                            : formatPrice(pricePerMonth)}
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
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);
