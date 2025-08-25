import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/table";
import { chatsLimits, seatsLimits } from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { InfinityIcon } from "@typebot.io/ui/icons/InfinityIcon";
import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { chatsTooltip } from "./constants";

type Props = {
  onChatsTiersClick: () => void;
};

export const PlanComparisonTables = ({ onChatsTiersClick }: Props) => (
  <div className="flex flex-col gap-4">
    <TableRoot className="bg-gray-1 rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px] min-w-[150px] pl-6">
              Usage
            </TableHead>
            <PlanTableHeads className="min-w-[150px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="pl-6">Total bots</TableCell>
            <InfinityTableCell />
            <InfinityTableCell />
            <InfinityTableCell />
          </TableRow>
          <TableRow>
            <TableCell className="pl-6">Guests</TableCell>
            <InfinityTableCell />
            <InfinityTableCell />
            <InfinityTableCell />
          </TableRow>
          <TableRow>
            <TableCell className="pl-6">Members</TableCell>
            <TableCell>Just you</TableCell>
            <TableCell>{seatsLimits.STARTER} seats</TableCell>
            <TableCell>{seatsLimits.PRO} seats</TableCell>
          </TableRow>
          <TableRow>
            <TableCellWithTooltip className="pl-6" tooltip={chatsTooltip}>
              Chats
            </TableCellWithTooltip>
            <TableCell>{chatsLimits.FREE} / month</TableCell>
            <TableCell>
              {parseNumberWithCommas(chatsLimits.STARTER)} / month
            </TableCell>
            <TableCell>
              {parseNumberWithCommas(chatsLimits.PRO)} / month
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-6">Additional Chats</TableCell>
            <TableCell />
            <TableCell>{formatPrice(10)} per 500 chats</TableCell>
            <TableCell>
              <Button
                variant="outline-secondary"
                size="xs"
                onClick={onChatsTiersClick}
              >
                See tiers
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableRoot>

    <TableRoot className="bg-gray-1 rounded-xl border py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px] min-w-[200px]">Features</TableHead>
            <PlanTableHeads className="md:min-w-[150px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCellWithTooltip tooltip="Includes display bubbles (text, image, video, embed), question inputs (email, url, phone number...) and logic blocks (conditions, set variables...)">
              20+ blocks
            </TableCellWithTooltip>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Starter templates</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Webhooks</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Google Sheets</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Google Analytics</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Send emails</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Zapier</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Pabbly Connect</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Make.com</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Custom Javascript & CSS</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Export CSV</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>File upload inputs</TableCell>
            <TableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCellWithTooltip tooltip="Organize your typebots into folders">
              Folders
            </TableCellWithTooltip>
            <TableCell />
            <InfinityTableCell />
            <InfinityTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Remove branding</TableCell>
            <TableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>WhatsApp integration</TableCell>
            <TableCell />
            <TableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Custom domains</TableCell>
            <TableCell />
            <TableCell />
            <InfinityTableCell />
          </TableRow>
          <TableRow>
            <TableCellWithTooltip tooltip="Analytics graph that shows your form drop-off rate, submission rate, and more.">
              In-depth analytics
            </TableCellWithTooltip>
            <TableCell />
            <TableCell />
            <CheckedTableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableRoot>

    <TableRoot className="bg-gray-1 rounded-xl border py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px] min-w-[200px]">Support</TableHead>
            <PlanTableHeads className="md:min-w-[150px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Community support</TableCell>
            <CheckedTableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Direct support channel</TableCell>
            <TableCell />
            <CheckedTableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Priority support</TableCell>
            <TableCell />
            <TableCell />
            <CheckedTableCell />
          </TableRow>
          <TableRow>
            <TableCell>Feature request priority</TableCell>
            <TableCell />
            <TableCell />
            <CheckedTableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableRoot>
  </div>
);

const CheckedTableCell = () => (
  <TableCell>
    <TickIcon className="size-4" />
  </TableCell>
);

const InfinityTableCell = () => (
  <TableCell>
    <InfinityIcon className="size-4" />
  </TableCell>
);

const TableCellWithTooltip = ({
  children,
  tooltip,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  tooltip: string;
}) => (
  <TableCell className={cn("flex gap-2 items-center", className)}>
    <p>{children}</p>
    <MoreInfoTooltip>{tooltip}</MoreInfoTooltip>
  </TableCell>
);

const PlanTableHeads = ({ className }: { className?: string }) => (
  <>
    <TableHead className={className}>FREE</TableHead>
    <TableHead className={cn("text-orange-9", className)}>STARTER</TableHead>
    <TableHead className={cn("text-purple-9", className)}>PRO</TableHead>
  </>
);
