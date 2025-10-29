import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { StripeCredentials } from "@typebot.io/credentials/schemas";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { useEffect, useState } from "react";
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
      <form className="flex flex-col gap-4">
        <Field.Root>
          <Field.Label>
            {t("blocks.inputs.payment.settings.stripeConfig.accountName.label")}
          </Field.Label>
          <Input
            defaultValue={stripeConfig?.name}
            onValueChange={handleNameChange}
            placeholder="Typebot"
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>
            {t("blocks.inputs.payment.settings.stripeConfig.testKeys.label")}
            <MoreInfoTooltip>
              {t(
                "blocks.inputs.payment.settings.stripeConfig.testKeys.infoText.label",
              )}
            </MoreInfoTooltip>
          </Field.Label>
          <div className="flex items-center gap-2">
            <Input
              onValueChange={handleTestPublicKeyChange}
              placeholder="pk_test_..."
              defaultValue={stripeConfig?.test?.publicKey}
            />
            <Input
              onValueChange={handleTestSecretKeyChange}
              placeholder="sk_test_..."
              defaultValue={stripeConfig?.test?.secretKey}
              type="password"
            />
          </div>
        </Field.Root>
        <Field.Root>
          <Field.Label>
            {t("blocks.inputs.payment.settings.stripeConfig.liveKeys.label")}
          </Field.Label>
          <div className="flex items-center gap-2">
            <Input
              onValueChange={handlePublicKeyChange}
              placeholder="pk_live_..."
              defaultValue={stripeConfig?.live?.publicKey}
            />
            <Input
              onValueChange={handleSecretKeyChange}
              placeholder="sk_live_..."
              defaultValue={stripeConfig?.live?.secretKey}
              type="password"
            />
          </div>
        </Field.Root>

        <p>
          ({t("blocks.inputs.payment.settings.stripeConfig.findKeys.label")}{" "}
          <TextLink href="https://dashboard.stripe.com/apikeys" isExternal>
            {t(
              "blocks.inputs.payment.settings.stripeConfig.findKeys.here.label",
            )}
          </TextLink>
          )
        </p>
      </form>
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
