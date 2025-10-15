import { Heading, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/queryClient";

const hostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

type Props = {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  domain?: string;
  onNewDomain: (customDomain: string) => void;
};

export const CreateCustomDomainDialog = ({
  workspaceId,
  isOpen,
  onClose,
  onNewDomain,
  domain = "",
}: Props) => {
  const { t } = useTranslate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(domain);
  const [hostname, setHostname] = useState({
    domain: splitHostname(domain)?.domain ?? "",
    subdomain: splitHostname(domain)?.subdomain ?? "",
  });

  const { mutate } = useMutation(
    trpc.customDomains.createCustomDomain.mutationOptions({
      onMutate: () => {
        setIsLoading(true);
      },
      onSettled: () => {
        setIsLoading(false);
      },
      onSuccess: (data) => {
        onNewDomain(data.customDomain.name);
        onClose();
      },
    }),
  );

  useEffect(() => {
    if (inputValue === "" || !isOpen) return;
    if (!hostnameRegex.test(inputValue))
      return setHostname({ domain: "", subdomain: "" });
    const hostnameDetails = splitHostname(inputValue);
    if (!hostnameDetails) return setHostname({ domain: "", subdomain: "" });
    setHostname({
      domain: hostnameDetails.domain,
      subdomain: hostnameDetails.subdomain,
    });
  }, [inputValue]);

  const onAddDomainClick = async () => {
    if (!hostnameRegex.test(inputValue)) return;
    mutate({ name: inputValue, workspaceId });
  };
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl" initialFocus={inputRef}>
        <Dialog.Title>
          <Heading size="md">{t("customDomain.modal.heading")}</Heading>
        </Dialog.Title>
        <Dialog.CloseButton />
        <Stack>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="bot.my-domain.com"
          />
          {hostname.domain !== "" && (
            <>
              <Text>{t("customDomain.modal.recordText")}</Text>
              {hostname.subdomain ? (
                <HStack
                  bgColor="gray.700"
                  color="white"
                  rounded="md"
                  p={4}
                  spacing={8}
                >
                  <Stack>
                    <Text fontWeight="bold">
                      {t("customDomain.modal.type")}
                    </Text>
                    <Text>CNAME</Text>
                  </Stack>
                  <Stack>
                    <Text fontWeight="bold">
                      {t("customDomain.modal.name")}
                    </Text>
                    <Text>{hostname.subdomain}</Text>
                  </Stack>
                  <Stack>
                    <Text fontWeight="bold">
                      {t("customDomain.modal.value")}
                    </Text>
                    <Text>cname.vercel-dns.com</Text>
                  </Stack>
                </HStack>
              ) : (
                <HStack
                  bgColor="gray.700"
                  color="white"
                  rounded="md"
                  p={4}
                  spacing={8}
                >
                  <Stack>
                    <Text fontWeight="bold">
                      {t("customDomain.modal.type")}
                    </Text>
                    <Text>A</Text>
                  </Stack>
                  <Stack>
                    <Text fontWeight="bold">
                      {t("customDomain.modal.name")}
                    </Text>
                    <Text>@</Text>
                  </Stack>
                  <Stack>
                    <Text fontWeight="bold">
                      {t("customDomain.modal.value")}
                    </Text>
                    <Text>76.76.21.21</Text>
                  </Stack>
                </HStack>
              )}
              <Alert.Root>
                <InformationSquareIcon />
                <Alert.Description>
                  {t("customDomain.modal.warningMessage")}
                </Alert.Description>
              </Alert.Root>
            </>
          )}
        </Stack>
        <Dialog.Footer>
          <Button
            onClick={onAddDomainClick}
            disabled={hostname.domain === "" || isLoading}
          >
            {t("save")}
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};

const splitHostname = (
  hostname: string,
): { domain: string; type: string; subdomain: string } | undefined => {
  if (!hostname.includes(".")) return;
  const urlParts = /([a-z-0-9]{2,63}).([a-z.]{2,5})$/.exec(hostname);
  if (!urlParts) return;
  const [, domain, type] = urlParts;
  const subdomain = hostname.replace(`${domain}.${type}`, "").slice(0, -1);
  return {
    domain,
    type,
    subdomain,
  };
};
