import { useQuery } from "@tanstack/react-query";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { CancelCircleIcon } from "@typebot.io/ui/icons/CancelCircleIcon";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { trpc } from "@/lib/queryClient";

type Props = {
  workspaceId: string;
  isOpen: boolean;
  domain: string;
  onClose: () => void;
};

export const CustomDomainConfigDialog = ({
  workspaceId,
  isOpen,
  onClose,
  domain,
}: Props) => {
  const { data, error } = useQuery(
    trpc.customDomains.verifyCustomDomain.queryOptions({
      name: domain,
      workspaceId,
    }),
  );

  const { domainJson, status } = data ?? {};

  if (!status || status === "Valid Configuration" || !domainJson) return null;

  if ("error" in domainJson) return null;

  const subdomain = getSubdomain(domainJson.name, domainJson.apexName);

  const recordType = subdomain ? "CNAME" : "A";

  const txtVerification =
    (status === "Pending Verification" &&
      domainJson.verification?.find((x) => x.type === "TXT")) ||
    null;

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>
          <div className="flex items-center gap-2">
            <CancelCircleIcon className="text-red-9" />
            <p className="text-lg font-medium">{status}</p>
          </div>
        </Dialog.Title>
        <Dialog.CloseButton />
        {txtVerification ? (
          <div className="flex flex-col gap-4">
            <p>
              Please set the following <code>TXT</code> record on{" "}
              <span className="font-bold">{domainJson.apexName}</span> to prove
              ownership of <span className="font-bold">{domainJson.name}</span>:
            </p>
            <div className="flex justify-between items-start gap-6">
              <div className="flex flex-col gap-2">
                <p className="font-bold">Type</p>
                <p className="text-sm font-mono">{txtVerification.type}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold">Name</p>
                <p className="text-sm font-mono">
                  {txtVerification.domain.slice(
                    0,
                    txtVerification.domain.length -
                      domainJson.apexName.length -
                      1,
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold">Value</p>
                <p className="text-sm font-mono">
                  <div className="text-overflow-ellipsis whitespace-nowrap">
                    {txtVerification.value}
                  </div>
                </p>
              </div>
            </div>
            <Alert.Root variant="warning">
              <TriangleAlertIcon />
              <Alert.Description>
                If you are using this domain for another site, setting this TXT
                record will transfer domain ownership away from that site and
                break it. Please exercise caution when setting this record.
              </Alert.Description>
            </Alert.Root>
          </div>
        ) : status === "Unknown Error" ? (
          <p className="mb-5 text-sm">{error?.message}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <p>
              To configure your{" "}
              {recordType === "A" ? "apex domain" : "subdomain"} (
              <span className="font-bold">
                {recordType === "A" ? domainJson.apexName : domainJson.name}
              </span>
              ), set the following {recordType} record on your DNS provider to
              continue:
            </p>
            <div className="flex items-center gap-2 justify-between">
              <div className="flex flex-col gap-2">
                <p className="font-bold">Type</p>
                <p className="text-sm font-mono">{recordType}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold">Name</p>
                <p className="text-sm font-mono">
                  {recordType === "A" ? "@" : (subdomain ?? "www")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold">Value</p>
                <p className="text-sm font-mono">
                  {recordType === "A" ? "76.76.21.21" : `cname.vercel-dns.com`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold">TTL</p>
                <p className="text-sm font-mono">86400</p>
              </div>
            </div>
            <Alert.Root>
              <TriangleAlertIcon />
              <Alert.Description>
                Note: for TTL, if <code>86400</code> is not available, set the
                highest value possible. Also, domain propagation can take up to
                an hour.
              </Alert.Description>
            </Alert.Root>
          </div>
        )}
        <Dialog.Footer>
          <Dialog.CloseButton>Close</Dialog.CloseButton>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};

const getSubdomain = (name: string, apexName: string) => {
  if (name === apexName) return null;
  return name.slice(0, name.length - apexName.length - 1);
};
