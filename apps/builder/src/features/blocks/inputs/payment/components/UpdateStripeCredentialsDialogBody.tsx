import { FormControl, FormLabel, HStack, Stack, Text } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { StripeCredentials } from "@typebot.io/credentials/schemas";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useEffect, useState } from "react";
import { TextInput } from "@/components/inputs";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { TextLink } from "@/components/TextLink";
import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";

type Props = {
  credentialsId: string;
  onUpdate: () => void;
};

export const UpdateStripeCredentialsDialogBody = ({
  credentialsId,
  onUpdate,
}: Props) => {
  const { t } = useTranslate();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<
    StripeCredentials["data"] & { name: string }
  >();

  const { data: existingCredentials } = useQuery(
    trpc.credentials.getCredentials.queryOptions(
      {
        scope: "workspace",
        credentialsId,
        workspaceId: workspace!.id,
      },
      {
        enabled: !!workspace?.id,
      },
    ),
  );

  useEffect(() => {
    if (!existingCredentials || stripeConfig) return;
    setStripeConfig({
      name: existingCredentials.name,
      live: (existingCredentials.data as any).live,
      test: (existingCredentials.data as any).test,
    });
  }, [existingCredentials, stripeConfig]);

  const { mutate } = useMutation(
    trpc.credentials.updateCredentials.mutationOptions({
      onMutate: () => setIsCreating(true),
      onSettled: () => setIsCreating(false),
      onSuccess: () => {
        onUpdate();
      },
    }),
  );

  const handleNameChange = (name: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      name,
    });

  const handlePublicKeyChange = (publicKey: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, publicKey },
    });

  const handleSecretKeyChange = (secretKey: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, secretKey },
    });

  const handleTestPublicKeyChange = (publicKey: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, publicKey },
    });

  const handleTestSecretKeyChange = (secretKey: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, secretKey },
    });

  const updateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !workspace?.id || !stripeConfig) return;
    mutate({
      credentialsId,
      scope: "workspace",
      workspaceId: workspace.id,
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
    });
  };

  return (
    <Dialog.Popup render={<form onSubmit={updateCreds} />}>
      <Stack as="form" spacing={4}>
        <TextInput
          isRequired
          label={t(
            "blocks.inputs.payment.settings.stripeConfig.accountName.label",
          )}
          defaultValue={stripeConfig?.name}
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
              defaultValue={stripeConfig?.test?.publicKey}
              debounceTimeout={0}
            />
            <TextInput
              onChange={handleTestSecretKeyChange}
              placeholder="sk_test_..."
              withVariableButton={false}
              debounceTimeout={0}
              defaultValue={stripeConfig?.test?.secretKey}
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
                defaultValue={stripeConfig?.live?.publicKey}
                debounceTimeout={0}
              />
            </FormControl>
            <FormControl>
              <TextInput
                onChange={handleSecretKeyChange}
                placeholder="sk_live_..."
                withVariableButton={false}
                defaultValue={stripeConfig?.live?.secretKey}
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

      <Dialog.Footer>
        <Button
          type="submit"
          disabled={
            stripeConfig?.live.publicKey === "" ||
            stripeConfig?.name === "" ||
            stripeConfig?.live.secretKey === "" ||
            isCreating
          }
        >
          {t("connect")}
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
