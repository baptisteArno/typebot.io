import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { TextLink } from "@/components/TextLink";
import { TextInput } from "@/components/inputs";
import { useUser } from "@/features/account/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
import {
  Button,
  FormControl,
  FormLabel,
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
import { useTranslate } from "@tolgee/react";
import type { StripeCredentials } from "@typebot.io/blocks-inputs/payment/schema";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type React from "react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const StripeConfigModal = ({
  isOpen,
  onNewCredentials,
  onClose,
}: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <StripeCreateModalContent
        onNewCredentials={onNewCredentials}
        onClose={onClose}
      />
    </Modal>
  );
};

export const StripeCreateModalContent = ({
  onNewCredentials,
  onClose,
}: Pick<Props, "onClose" | "onNewCredentials">) => {
  const { t } = useTranslate();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();
  const [stripeConfig, setStripeConfig] = useState<
    StripeCredentials["data"] & { name: string }
  >({
    name: "",
    live: { publicKey: "", secretKey: "" },
    test: { publicKey: "", secretKey: "" },
  });
  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext();
  const { mutate } = trpc.credentials.createCredentials.useMutation({
    onMutate: () => setIsCreating(true),
    onSettled: () => setIsCreating(false),
    onError: (err) => {
      showToast({
        description: err.message,
        status: "error",
      });
    },
    onSuccess: (data) => {
      refetchCredentials();
      onNewCredentials(data.credentialsId);
      onClose();
    },
  });

  const handleNameChange = (name: string) =>
    setStripeConfig({
      ...stripeConfig,
      name,
    });

  const handlePublicKeyChange = (publicKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, publicKey },
    });

  const handleSecretKeyChange = (secretKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, secretKey },
    });

  const handleTestPublicKeyChange = (publicKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, publicKey },
    });

  const handleTestSecretKeyChange = (secretKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, secretKey },
    });

  const createCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !workspace?.id) return;
    mutate({
      credentials: {
        data: {
          live: stripeConfig.live,
          test: {
            publicKey: isNotEmpty(stripeConfig.test.publicKey)
              ? stripeConfig.test.publicKey
              : undefined,
            secretKey: isNotEmpty(stripeConfig.test.secretKey)
              ? stripeConfig.test.secretKey
              : undefined,
          },
        },
        name: stripeConfig.name,
        type: "stripe",
        workspaceId: workspace.id,
      },
    });
  };

  return (
    <ModalContent>
      <ModalHeader>
        {t("blocks.inputs.payment.settings.stripeConfig.title.label")}
      </ModalHeader>
      <ModalCloseButton />
      <form onSubmit={createCredentials}>
        <ModalBody>
          <Stack spacing={4}>
            <TextInput
              isRequired
              label={t(
                "blocks.inputs.payment.settings.stripeConfig.accountName.label",
              )}
              onChange={handleNameChange}
              placeholder="Typebot"
              withVariableButton={false}
              debounceTimeout={0}
            />
            <Stack>
              <FormLabel>
                {t(
                  "blocks.inputs.payment.settings.stripeConfig.testKeys.label",
                )}{" "}
                <MoreInfoTooltip>
                  {t(
                    "blocks.inputs.payment.settings.stripeConfig.testKeys.infoText.label",
                  )}
                </MoreInfoTooltip>
              </FormLabel>
              <HStack>
                <TextInput
                  onChange={handleTestPublicKeyChange}
                  placeholder="pk_test_..."
                  withVariableButton={false}
                  debounceTimeout={0}
                />
                <TextInput
                  onChange={handleTestSecretKeyChange}
                  placeholder="sk_test_..."
                  withVariableButton={false}
                  debounceTimeout={0}
                  type="password"
                />
              </HStack>
            </Stack>
            <Stack>
              <FormLabel>
                {t(
                  "blocks.inputs.payment.settings.stripeConfig.liveKeys.label",
                )}
              </FormLabel>
              <HStack>
                <FormControl>
                  <TextInput
                    onChange={handlePublicKeyChange}
                    placeholder="pk_live_..."
                    withVariableButton={false}
                    debounceTimeout={0}
                  />
                </FormControl>
                <FormControl>
                  <TextInput
                    onChange={handleSecretKeyChange}
                    placeholder="sk_live_..."
                    withVariableButton={false}
                    debounceTimeout={0}
                    type="password"
                  />
                </FormControl>
              </HStack>
            </Stack>

            <Text>
              ({t("blocks.inputs.payment.settings.stripeConfig.findKeys.label")}{" "}
              <TextLink href="https://dashboard.stripe.com/apikeys" isExternal>
                {t(
                  "blocks.inputs.payment.settings.stripeConfig.findKeys.here.label",
                )}
              </TextLink>
              )
            </Text>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="blue"
            isDisabled={
              stripeConfig.live.publicKey === "" ||
              stripeConfig.name === "" ||
              stripeConfig.live.secretKey === ""
            }
            isLoading={isCreating}
          >
            {t("connect")}
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
};
