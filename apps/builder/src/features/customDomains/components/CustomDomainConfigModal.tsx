import { XCircleIcon } from "@/components/icons";
import { trpc } from "@/lib/trpc";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Code,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";

type Props = {
  workspaceId: string;
  isOpen: boolean;
  domain: string;
  onClose: () => void;
};

export const CustomDomainConfigModal = ({
  workspaceId,
  isOpen,
  onClose,
  domain,
}: Props) => {
  const { data, error } = trpc.customDomains.verifyCustomDomain.useQuery({
    name: domain,
    workspaceId,
  });

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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <XCircleIcon stroke="red.500" />
            <Text fontSize="lg" fontWeight="semibold">
              {status}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {txtVerification ? (
            <Stack spacing="4">
              <Text>
                Please set the following <Code>TXT</Code> record on{" "}
                <Text as="span" fontWeight="bold">
                  {domainJson.apexName}
                </Text>{" "}
                to prove ownership of{" "}
                <Text as="span" fontWeight="bold">
                  {domainJson.name}
                </Text>
                :
              </Text>
              <HStack
                justifyContent="space-between"
                alignItems="flex-start"
                spacing="6"
              >
                <Stack>
                  <Text fontWeight="bold">Type</Text>
                  <Text fontSize="sm" fontFamily="mono">
                    {txtVerification.type}
                  </Text>
                </Stack>
                <Stack>
                  <Text fontWeight="bold">Name</Text>
                  <Text fontSize="sm" fontFamily="mono">
                    {txtVerification.domain.slice(
                      0,
                      txtVerification.domain.length -
                        domainJson.apexName.length -
                        1,
                    )}
                  </Text>
                </Stack>
                <Stack>
                  <Text fontWeight="bold">Value</Text>
                  <Text fontSize="sm" fontFamily="mono">
                    <Box text-overflow="ellipsis" white-space="nowrap">
                      {txtVerification.value}
                    </Box>
                  </Text>
                </Stack>
              </HStack>
              <Alert status="warning">
                <AlertIcon />
                <Text>
                  If you are using this domain for another site, setting this
                  TXT record will transfer domain ownership away from that site
                  and break it. Please exercise caution when setting this
                  record.
                </Text>
              </Alert>
            </Stack>
          ) : status === "Unknown Error" ? (
            <Text mb="5" fontSize="sm">
              {error?.message}
            </Text>
          ) : (
            <Stack spacing={4}>
              <Text>
                To configure your{" "}
                {recordType === "A" ? "apex domain" : "subdomain"} (
                <Box as="span" fontWeight="bold">
                  {recordType === "A" ? domainJson.apexName : domainJson.name}
                </Box>
                ), set the following {recordType} record on your DNS provider to
                continue:
              </Text>
              <HStack justifyContent="space-between">
                <Stack>
                  <Text fontWeight="bold">Type</Text>
                  <Text fontFamily="mono" fontSize="sm">
                    {recordType}
                  </Text>
                </Stack>
                <Stack>
                  <Text fontWeight="bold">Name</Text>
                  <Text fontFamily="mono" fontSize="sm">
                    {recordType === "A" ? "@" : (subdomain ?? "www")}
                  </Text>
                </Stack>
                <Stack>
                  <Text fontWeight="bold">Value</Text>
                  <Text fontFamily="mono" fontSize="sm">
                    {recordType === "A"
                      ? "76.76.21.21"
                      : `cname.vercel-dns.com`}
                  </Text>
                </Stack>
                <Stack>
                  <Text fontWeight="bold">TTL</Text>
                  <Text fontFamily="mono" fontSize="sm">
                    86400
                  </Text>
                </Stack>
              </HStack>
              <Alert fontSize="sm">
                <AlertIcon />
                <Text>
                  Note: for TTL, if <Code>86400</Code> is not available, set the
                  highest value possible. Also, domain propagation can take up
                  to an hour.
                </Text>
              </Alert>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter as={HStack}>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const getSubdomain = (name: string, apexName: string) => {
  if (name === apexName) return null;
  return name.slice(0, name.length - apexName.length - 1);
};
