import { FormControl, FormLabel, HStack, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { StripeCredentials } from "@typebot.io/credentials/schemas";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import type React from "react";
import { useState } from "react";
import { TextInput } from "@/components/inputs";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { TextLink } from "@/components/TextLink";
import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

export const CreateStripeCredentialsDialog = ({
  isOpen,
  onNewCredentials,
  onClose,
}: Props) => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <CreateStripeCredentialsDialogBody
        onNewCredentials={onNewCredentials}
        onClose={onClose}
      />
    </Dialog.Root>
  );
};

export const CreateStripeCredentialsDialogBody = ({
  onNewCredentials,
  onClose,
}: Pick<Props, "onClose" | "onNewCredentials">) => {
  const { t } = useTranslate();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<
    StripeCredentials["data"] & { name: string }
  >({
    name: "",
    live: { publicKey: "", secretKey: "" },
    test: { publicKey: "", secretKey: "" },
  });
  const { mutate } = useMutation(
    trpc.credentials.createCredentials.mutationOptions({
      onMutate: () => setIsCreating(true),
      onSettled: () => setIsCreating(false),
      onError: (err) => {
        toast({
          description: err.message,
        });
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.credentials.listCredentials.queryKey({
            workspaceId: workspace?.id,
          }),
        });
        onNewCredentials(data.credentialsId);
        onClose();
      },
    }),
  );

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
      scope: "workspace",
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
      },
      workspaceId: workspace.id,
    });
  };

  return (
    <Dialog.Popup
      render={(props) => <form onSubmit={createCredentials} {...props} />}
    >
      <Dialog.Title>Create Stripe config</Dialog.Title>
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
          {t("blocks.inputs.payment.settings.stripeConfig.testKeys.label")}{" "}
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
          {t("blocks.inputs.payment.settings.stripeConfig.liveKeys.label")}
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
          {t("blocks.inputs.payment.settings.stripeConfig.findKeys.here.label")}
        </TextLink>
        )
      </Text>

      <Dialog.Footer>
        <Button
          type="submit"
          disabled={
            stripeConfig.live.publicKey === "" ||
            stripeConfig.name === "" ||
            stripeConfig.live.secretKey === "" ||
            isCreating
          }
        >
          {t("connect")}
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
