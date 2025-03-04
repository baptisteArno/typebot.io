import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";
import {
  Alert,
  Button,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { useEffect, useRef, useState } from "react";

const hostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

type Props = {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  domain?: string;
  onNewDomain: (customDomain: string) => void;
};

export const CreateCustomDomainModal = ({
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

  const { mutate } = trpc.customDomains.createCustomDomain.useMutation({
    onMutate: () => {
      setIsLoading(true);
    },
    onError: (error) => {
      toast({
        context: "Error while creating custom domain",
        description: error.message,
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
    onSuccess: (data) => {
      onNewDomain(data.customDomain.name);
      onClose();
    },
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const onAddDomainClick = async () => {
    if (!hostnameRegex.test(inputValue)) return;
    mutate({ name: inputValue, workspaceId });
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      initialFocusRef={inputRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">{t("customDomain.modal.heading")}</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
                <Alert rounded="md">
                  {t("customDomain.modal.warningMessage")}
                </Alert>
              </>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter as={HStack}>
          <Tooltip
            label={t("customDomain.modal.domainInvalid.label")}
            isDisabled={hostname.domain !== ""}
          >
            <span>
              <Button
                onClick={onAddDomainClick}
                isDisabled={hostname.domain === ""}
                isLoading={isLoading}
                colorScheme="orange"
              >
                {t("save")}
              </Button>
            </span>
          </Tooltip>
        </ModalFooter>
      </ModalContent>
    </Modal>
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
