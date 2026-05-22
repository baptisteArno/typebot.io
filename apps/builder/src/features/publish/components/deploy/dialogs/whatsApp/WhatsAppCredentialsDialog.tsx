import { ORPCError } from "@orpc/client";
import { createId } from "@paralleldrive/cuid2";
import { useMutation, useQuery } from "@tanstack/react-query";
import { whatsAppCredentialsDataSchema } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { parseUnknownClientError } from "@typebot.io/lib/parseUnknownClientError";
import { isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { ArrowLeft01Icon } from "@typebot.io/ui/icons/ArrowLeft01Icon";
import { ArrowUpRight01Icon } from "@typebot.io/ui/icons/ArrowUpRight01Icon";
import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { dialog360WebhookSecretHeaderName } from "@typebot.io/whatsapp/constants";
import { formatPhoneNumberDisplayName } from "@typebot.io/whatsapp/formatPhoneNumberDisplayName";
import { Fragment, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { CopyButton } from "@/components/CopyButton";
import { CopyInput } from "@/components/inputs/CopyInput";
import { Dialog360Logo } from "@/components/logos/Dialog360Logo";
import { MetaLogo } from "@/components/logos/MetaLogo";
import { TextLink } from "@/components/TextLink";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { orpc, orpcClient, queryClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";

const metaSteps = [
  { title: "Requirements" },
  { title: "App Credentials" },
  { title: "Phone Number" },
  { title: "Webhook" },
];

const dialog360Steps = [{ title: "Phone Number" }, { title: "Webhook" }];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

const credentialsId = createId();

export const WhatsAppCredentialsDialog = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <WhatsAppCreateDialogBody
        onNewCredentials={onNewCredentials}
        onClose={onClose}
      />
    </Dialog.Root>
  );
};

const useSteps = () => {
  const [activeStep, setActiveStep] = useState(0);

  const goToNext = () => setActiveStep(activeStep + 1);
  const goToPrevious = () => setActiveStep(activeStep - 1);

  return { activeStep, goToNext, goToPrevious, setActiveStep };
};

export const WhatsAppCreateDialogBody = ({
  onNewCredentials,
  onClose,
}: {
  onNewCredentials: (id: string) => void;
  onClose: () => void;
}) => {
  const { workspace } = useWorkspace();
  const [provider, setProvider] = useState<"meta" | "360dialog" | null>(null);
  const steps = provider === "meta" ? metaSteps : dialog360Steps;
  const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps();
  const [systemUserAccessToken, setSystemUserAccessToken] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState(createId);
  const [wabaId, setWabaId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [phoneNumberName, setPhoneNumberName] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { mutate } = useMutation(
    orpc.credentials.createCredentials.mutationOptions({
      onMutate: () => setIsCreating(true),
      onSettled: () => setIsCreating(false),
      onError: (err) => {
        toast({
          description: err.message,
        });
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: orpc.credentials.listCredentials.key(),
        });
        onNewCredentials(data.credentialsId);
        onClose();
        resetForm();
      },
    }),
  );

  const { data: tokenInfoData } = useQuery(
    orpc.whatsApp.getSystemTokenInfo.queryOptions({
      input: {
        token: systemUserAccessToken,
        appSecret: appSecret || undefined,
      },
      enabled: isNotEmpty(systemUserAccessToken) && activeStep > 1,
    }),
  );

  const resetForm = () => {
    setActiveStep(0);
    setSystemUserAccessToken("");
    setAppSecret("");
    setWebhookSecret(createId());
    setWabaId("");
    setPhoneNumberId("");
  };

  const createCredentials = async () => {
    if (!workspace || !provider) return;

    if (provider === "meta") {
      setIsVerifying(true);
      try {
        await orpcClient.whatsApp.setupMetaWebhook({
          systemToken: systemUserAccessToken,
          appSecret: appSecret || undefined,
          wabaId,
          phoneNumberId,
          subscribe: true,
        });
      } catch (err) {
        toast(await parseUnknownClientError({ err }));
        return;
      } finally {
        setIsVerifying(false);
      }

      mutate({
        scope: "workspace",
        workspaceId: workspace.id,
        credentials: {
          id: credentialsId,
          type: "whatsApp",
          name: phoneNumberName,
          data: {
            provider: "meta",
            systemUserAccessToken,
            wabaId,
            phoneNumberId,
            appSecret: appSecret || undefined,
          },
        },
      });
    } else if (provider === "360dialog") {
      mutate({
        scope: "workspace",
        workspaceId: workspace.id,
        credentials: {
          id: credentialsId,
          type: "whatsApp",
          name: phoneNumberName,
          data: {
            provider: "360dialog",
            apiKey,
            webhookSecret: webhookSecret || undefined,
          },
        },
      });
    }
  };

  const isTokenValid = async () => {
    setIsVerifying(true);
    try {
      const { expiresAt, scopes } =
        await orpcClient.whatsApp.getSystemTokenInfo({
          token: systemUserAccessToken,
          appSecret: appSecret || undefined,
        });
      if (expiresAt !== 0) {
        toast({
          description:
            "Token expiration was not set to *never*. Create the token again with the correct expiration.",
        });
        return false;
      }
      if (
        ["whatsapp_business_management", "whatsapp_business_messaging"].find(
          (scope) => !scopes.includes(scope),
        )
      ) {
        toast({
          description: "Token does not have all the necessary scopes",
        });
        return false;
      }
    } catch (err) {
      if (err instanceof ORPCError) {
        if (err.data?.logError) {
          toast(err.data.logError);
          return false;
        }
      }
      toast(await parseUnknownClientError({ err }));
      return false;
    } finally {
      setIsVerifying(false);
    }
    return true;
  };

  const isPhoneNumberAvailable = async () => {
    setIsVerifying(true);
    try {
      const { name } = await orpcClient.whatsApp.setupMetaWebhook({
        systemToken: systemUserAccessToken,
        appSecret: appSecret || undefined,
        wabaId,
        phoneNumberId,
        subscribe: false,
      });
      setPhoneNumberName(name);
      try {
        const { message } =
          await orpcClient.whatsApp.verifyIfPhoneNumberAvailable({
            phoneNumberDisplayName: name,
          });

        if (message === "taken") {
          setIsVerifying(false);
          toast({
            description: "Phone number is already registered on Typebot",
          });
          return false;
        }
        const { verificationToken } =
          await orpcClient.whatsApp.generateVerificationToken();
        setVerificationToken(verificationToken);
      } catch (err) {
        console.error(err);
        setIsVerifying(false);
        toast({
          description: "Could not verify if phone number is available",
        });
        return false;
      }
    } catch (err) {
      setIsVerifying(false);
      if (err instanceof ORPCError) {
        if (err.data?.logError) {
          toast(err.data.logError);
          return false;
        }
      }
      console.error(err);
      toast(await parseUnknownClientError({ err }));
      return false;
    }
    setIsVerifying(false);
    return true;
  };

  const goToNextStep = async () => {
    if (activeStep === steps.length - 1) return createCredentials();

    if (provider === "meta") {
      if (activeStep === 1 && !(await isTokenValid())) return;
      if (activeStep === 2 && !(await isPhoneNumberAvailable())) return;
    } else if (provider === "360dialog") {
      if (activeStep === 0) {
        if (!phoneNumberName.trim() || !apiKey.trim()) return;
        setPhoneNumberName(formatPhoneNumberDisplayName(phoneNumberName));
      }
    }

    goToNext();
  };

  return (
    <Dialog.Popup className="max-w-3xl">
      <div className="flex items-center gap-2 h-10">
        {(activeStep > 0 || provider) && (
          <Button
            size="icon"
            aria-label={"Go back"}
            variant="ghost"
            onClick={goToPrevious}
          >
            <ArrowLeft01Icon />
          </Button>
        )}
        <h2 className="text-md">
          {!provider
            ? "Choose WhatsApp Provider"
            : provider === "meta"
              ? "Add Meta WhatsApp number"
              : "Add 360Dialog Integration"}
        </h2>
      </div>
      {!provider ? (
        <ProviderSelection onProviderSelect={setProvider} />
      ) : (
        <>
          <div className="flex items-center gap-2 w-full">
            {steps.map((step, index) => (
              <Fragment key={step.title}>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cx(
                        "size-6 rounded-full items-center flex justify-center text-center",
                        index <= activeStep
                          ? "text-white bg-orange-9"
                          : "bg-gray-6",
                      )}
                    >
                      {index < activeStep ? (
                        <TickIcon />
                      ) : (
                        <p className="text-sm">{index + 1}</p>
                      )}
                    </div>
                    <p className="text-sm">{step.title}</p>
                  </div>
                </div>
                {index !== steps.length - 1 && <hr className="flex-1 w-full" />}
              </Fragment>
            ))}
          </div>
          {provider === "meta" && (
            <>
              {activeStep === 0 && <Requirements />}
              {activeStep === 1 && (
                <SystemUserToken
                  initialToken={systemUserAccessToken}
                  initialAppSecret={appSecret}
                  setAppSecret={setAppSecret}
                  setToken={setSystemUserAccessToken}
                />
              )}
              {activeStep === 2 && (
                <PhoneNumber
                  appId={tokenInfoData?.appId}
                  initialWabaId={wabaId}
                  initialPhoneNumberId={phoneNumberId}
                  setWabaId={setWabaId}
                  setPhoneNumberId={setPhoneNumberId}
                />
              )}
              {activeStep === 3 && (
                <Webhook
                  appId={tokenInfoData?.appId}
                  verificationToken={verificationToken}
                  credentialsId={credentialsId}
                />
              )}
            </>
          )}
          {provider === "360dialog" && (
            <>
              {activeStep === 0 && (
                <Dialog360PhoneNumber
                  initialApiKey={apiKey}
                  initialWebhookSecret={webhookSecret}
                  setApiKey={setApiKey}
                  setWebhookSecret={setWebhookSecret}
                  initialPhoneNumber={phoneNumberName}
                  setPhoneNumber={setPhoneNumberName}
                />
              )}
              {activeStep === 1 && (
                <Dialog360Webhook
                  credentialsId={credentialsId}
                  webhookSecret={webhookSecret}
                />
              )}
            </>
          )}
        </>
      )}
      <Dialog.Footer>
        {provider && (
          <Button
            onClick={goToNextStep}
            disabled={
              isVerifying ||
              isCreating ||
              (provider === "meta" &&
                activeStep === 1 &&
                isEmpty(systemUserAccessToken)) ||
              (provider === "meta" &&
                activeStep === 2 &&
                (isEmpty(wabaId) || isEmpty(phoneNumberId))) ||
              (provider === "360dialog" && activeStep === 0 && isEmpty(apiKey))
            }
          >
            {activeStep === steps.length - 1 ? "Submit" : "Continue"}
          </Button>
        )}
      </Dialog.Footer>
    </Dialog.Popup>
  );
};

const Requirements = () => (
  <div className="flex flex-col gap-4">
    <p>
      Make sure you have{" "}
      <TextLink
        href="https://docs.typebot.com/deploy/whatsapp/create-meta-app"
        isExternal
      >
        created a WhatsApp Meta app
      </TextLink>
      . You should be able to get to this page:
    </p>
    <img
      className="rounded-md"
      src="/images/whatsapp-quickstart-page.png"
      alt="WhatsApp quickstart page"
    />
  </div>
);

const SystemUserToken = ({
  initialAppSecret,
  initialToken,
  setAppSecret,
  setToken,
}: {
  initialAppSecret: string;
  initialToken: string;
  setAppSecret: (id: string) => void;
  setToken: (id: string) => void;
}) => (
  <ol>
    <li>
      In your Meta app dashboard, go to <code>App settings → Basic</code> and
      copy your app secret.
    </li>
    <Field.Root>
      <Field.Label>App secret</Field.Label>
      <Input
        type="password"
        defaultValue={initialAppSecret}
        onValueChange={(val) => setAppSecret(val.trim())}
      />
    </Field.Root>
    <li>
      Go to your{" "}
      <ButtonLink
        href="https://business.facebook.com/settings/system-users"
        target="_blank"
        variant="secondary"
        size="sm"
      >
        System users page
        <ArrowUpRight01Icon />
      </ButtonLink>
    </li>
    <li>
      Create a new user by clicking on <code>Add</code>
    </li>
    <li>
      Fill it with any name and give it the <code>Admin</code> role
    </li>
    <li>
      <div className="flex flex-col gap-2">
        <p>
          Click on <code>Add assets</code>. Under <code>Apps</code>, look for
          your previously created app, select it and check{" "}
          <code>Manage app</code>. Under <code>WhatsApp Accounts</code>, select
          your account and allow management access.
        </p>
        <img
          className="rounded-md"
          src="/images/meta-system-user-assets.png"
          alt="Meta system user assets"
        />
      </div>
    </li>
    <li>
      <div className="flex flex-col gap-4">
        <p>
          Now, click on <code>Generate new token</code>. Select your app.
        </p>
        <ul>
          <li>
            Token expiration: <code>Never</code>
          </li>
          <li>
            Available Permissions: <code>whatsapp_business_messaging</code>,{" "}
            <code>whatsapp_business_management</code>{" "}
          </li>
        </ul>
      </div>
    </li>
    <li>Copy and paste the generated token:</li>
    <Field.Root>
      <Field.Label>System User Token</Field.Label>
      <Input
        type="password"
        defaultValue={initialToken}
        onValueChange={(val) => setToken(val.trim())}
      />
    </Field.Root>
  </ol>
);

const PhoneNumber = ({
  appId,
  initialWabaId,
  initialPhoneNumberId,
  setWabaId,
  setPhoneNumberId,
}: {
  appId?: string;
  initialWabaId: string;
  initialPhoneNumberId: string;
  setWabaId: (id: string) => void;
  setPhoneNumberId: (id: string) => void;
}) => (
  <ol>
    <li>
      <div className="flex items-center gap-2">
        <p>
          Go to your{" "}
          <ButtonLink
            href={`https://developers.facebook.com/apps/${appId}/whatsapp-business/wa-dev-console`}
            target="_blank"
            variant="secondary"
            size="sm"
          >
            WhatsApp Dev Console <ArrowUpRight01Icon />
          </ButtonLink>
        </p>
      </div>
    </li>
    <li>
      Add your phone number by clicking on the <code>Add phone number</code>{" "}
      button.
    </li>
    <li>
      <div className="flex flex-col gap-2">
        <p>
          Select a phone number and paste the associated{" "}
          <code>WhatsApp Business Account ID</code> and{" "}
          <code>Phone number ID</code>
        </p>
        <div className="flex items-center gap-2">
          <Field.Root>
            <Field.Label>WhatsApp Business Account ID</Field.Label>
            <Input
              defaultValue={initialWabaId}
              onValueChange={(value) => setWabaId(value.trim())}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Phone number ID</Field.Label>
            <Input
              defaultValue={initialPhoneNumberId}
              onValueChange={setPhoneNumberId}
            />
          </Field.Root>
        </div>
        <img
          src="/images/whatsapp-phone-selection.png"
          alt="WA phone selection"
        />
      </div>
    </li>
  </ol>
);

const Webhook = ({
  appId,
  verificationToken,
  credentialsId,
}: {
  appId?: string;
  verificationToken: string;
  credentialsId: string;
}) => {
  const { workspace } = useWorkspace();
  const webhookUrl = `${
    env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0]
  }/api/v1/workspaces/${workspace?.id}/whatsapp/${credentialsId}/webhook`;

  return (
    <div className="flex flex-col gap-6">
      <p>
        In your{" "}
        <ButtonLink
          href={`https://developers.facebook.com/apps/${appId}/whatsapp-business/wa-settings`}
          target="_blank"
          variant="secondary"
          size="sm"
        >
          WhatsApp Settings page
          <ArrowUpRight01Icon />
        </ButtonLink>
        , click on the Edit button and insert the following values:
      </p>
      <ul>
        <li>
          <div className="flex items-center gap-2">
            <p className="shrink-0">Callback URL:</p>
            <CopyInput value={webhookUrl} />
          </div>
        </li>
        <li>
          <div className="flex items-center gap-2">
            <p className="shrink-0">Verify Token:</p>
            <CopyInput value={verificationToken} />
          </div>
        </li>
        <li>
          <div className="flex items-center gap-2">
            <p className="shrink-0">
              Webhook fields: Next to <code>messages</code>, click on
              "Subscribe"
            </p>
          </div>
        </li>
      </ul>
      <p>
        After saving these settings in Meta, click Submit. Typebot will
        subscribe this app to the WhatsApp Business Account automatically.
      </p>
    </div>
  );
};

export const WhatsAppUpdateDialogBody = ({
  credentialsId,
  scope,
  onUpdate,
}: {
  credentialsId: string;
  scope: "workspace" | "user";
  onUpdate: () => void;
}) => {
  const { workspace } = useWorkspace();
  const [appSecret, setAppSecret] = useState<string>();
  const [webhookSecret, setWebhookSecret] = useState<string>();
  const [wabaId, setWabaId] = useState<string>();
  const [isValidatingCredentials, setIsValidatingCredentials] = useState(false);

  const { data: existingCredentials } = useQuery(
    orpc.credentials.getCredentials.queryOptions({
      input:
        scope === "workspace"
          ? {
              scope: "workspace",
              workspaceId: workspace?.id ?? "",
              credentialsId,
            }
          : {
              scope: "user",
              credentialsId,
            },
      enabled: scope === "user" || !!workspace?.id,
    }),
  );

  const { mutate: updateCredentials, isPending } = useMutation(
    orpc.credentials.updateCredentials.mutationOptions({
      onError: (err) => {
        toast({
          description: err.message,
        });
      },
      onSuccess: () => {
        onUpdate();
      },
    }),
  );

  const parsedCredentialsData = whatsAppCredentialsDataSchema.safeParse(
    existingCredentials?.data,
  );
  const whatsAppCredentialsData = parsedCredentialsData.success
    ? parsedCredentialsData.data
    : undefined;
  const isMetaCredentials =
    whatsAppCredentialsData && whatsAppCredentialsData.provider !== "360dialog";
  const isDialog360Credentials =
    whatsAppCredentialsData?.provider === "360dialog";
  const wabaIdValue =
    wabaId ?? (isMetaCredentials ? (whatsAppCredentialsData.wabaId ?? "") : "");
  const appSecretValue =
    appSecret ??
    (isMetaCredentials ? (whatsAppCredentialsData.appSecret ?? "") : "");
  const webhookSecretValue =
    webhookSecret ??
    (isDialog360Credentials
      ? (whatsAppCredentialsData.webhookSecret ?? "")
      : "");

  const updateWhatsAppCredentials = async () => {
    if (!existingCredentials || !whatsAppCredentialsData) return;
    const nextCredentialsData =
      whatsAppCredentialsData.provider === "360dialog"
        ? {
            ...whatsAppCredentialsData,
            webhookSecret:
              (webhookSecret === undefined
                ? whatsAppCredentialsData.webhookSecret
                : webhookSecret) || undefined,
          }
        : {
            ...whatsAppCredentialsData,
            wabaId:
              (wabaId === undefined
                ? whatsAppCredentialsData.wabaId
                : wabaId) || undefined,
            appSecret:
              (appSecret === undefined
                ? whatsAppCredentialsData.appSecret
                : appSecret) || undefined,
          };

    if (
      nextCredentialsData.provider !== "360dialog" &&
      (nextCredentialsData.appSecret || nextCredentialsData.wabaId)
    ) {
      setIsValidatingCredentials(true);
      try {
        if (nextCredentialsData.wabaId)
          await orpcClient.whatsApp.setupMetaWebhook({
            systemToken: nextCredentialsData.systemUserAccessToken,
            appSecret: nextCredentialsData.appSecret,
            wabaId: nextCredentialsData.wabaId,
            phoneNumberId: nextCredentialsData.phoneNumberId,
            subscribe: true,
          });
        else
          await orpcClient.whatsApp.getSystemTokenInfo({
            token: nextCredentialsData.systemUserAccessToken,
            appSecret: nextCredentialsData.appSecret,
          });
      } catch (err) {
        toast(await parseUnknownClientError({ err }));
        return;
      } finally {
        setIsValidatingCredentials(false);
      }
    }

    if (scope === "workspace") {
      if (!workspace?.id) return;
      updateCredentials({
        scope: "workspace",
        workspaceId: workspace.id,
        credentialsId,
        credentials: {
          type: "whatsApp",
          name: existingCredentials.name,
          data: nextCredentialsData,
        },
      });
      return;
    }

    updateCredentials({
      scope: "user",
      credentialsId,
      credentials: {
        type: "whatsApp",
        name: existingCredentials.name,
        data: nextCredentialsData,
      },
    });
  };

  return (
    <Dialog.Popup className="max-w-xl">
      <Dialog.Title>Update WhatsApp credentials</Dialog.Title>
      {isDialog360Credentials ? (
        <Field.Root>
          <Field.Label>Webhook secret</Field.Label>
          <SecretInput
            value={webhookSecretValue}
            onValueChange={(value) => setWebhookSecret(value.trim())}
          />
          <Field.Description>
            <p>
              When set, incoming 360Dialog webhook payloads must include the{" "}
              <code>{dialog360WebhookSecretHeaderName}</code> header with this
              value.
            </p>
          </Field.Description>
        </Field.Root>
      ) : (
        <div className="flex flex-col gap-4">
          <Field.Root>
            <Field.Label>WhatsApp Business Account ID</Field.Label>
            <Input
              value={wabaIdValue}
              onValueChange={(value) => setWabaId(value.trim())}
            />
            <Field.Description>
              <p>
                When set, Typebot verifies that this WABA contains the phone
                number and subscribes the Meta app to its webhooks.
              </p>
            </Field.Description>
          </Field.Root>
          <Field.Root>
            <Field.Label>App secret</Field.Label>
            <Input
              type="password"
              value={appSecretValue}
              onValueChange={(value) => setAppSecret(value.trim())}
            />
            <Field.Description>
              <p>
                When set, incoming Meta webhook payloads are verified with the{" "}
                <code>x-hub-signature-256</code> header.
              </p>
            </Field.Description>
          </Field.Root>
        </div>
      )}
      <Dialog.Footer>
        <Button
          type="button"
          disabled={
            (!isMetaCredentials && !isDialog360Credentials) ||
            isPending ||
            isValidatingCredentials
          }
          onClick={updateWhatsAppCredentials}
        >
          {isValidatingCredentials ? "Validating..." : "Update"}
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
};

const SecretInput = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <div className="relative">
    <Input
      type="password"
      value={value}
      className="pr-14"
      onValueChange={onValueChange}
    />
    <CopyButton
      size="xs"
      textToCopy={value}
      className="absolute right-2 top-1/2 -translate-y-1/2"
    />
  </div>
);

const ProviderSelection = ({
  onProviderSelect,
}: {
  onProviderSelect: (provider: "meta" | "360dialog") => void;
}) => (
  <div className="flex items-center gap-4 w-full">
    <button
      type="button"
      className="cursor-pointer border p-8 rounded-md flex flex-col items-center text-center gap-3 hover:bg-gray-2 flex-1"
      onClick={() => onProviderSelect("meta")}
    >
      <MetaLogo className="size-10" />
      <div className="flex flex-col gap-2">
        <p className="font-bold">Meta (Facebook)</p>
        <p className="text-sm" color="gray.600">
          Official Meta WhatsApp Business API
        </p>
      </div>
      <p className="text-xs" color="gray.500">
        Requires Meta Developer account, system user token, and phone number
        setup
      </p>
    </button>
    <button
      type="button"
      className="cursor-pointer border p-8 rounded-md flex flex-col items-center text-center gap-3 hover:bg-gray-2 flex-1"
      onClick={() => onProviderSelect("360dialog")}
    >
      <Dialog360Logo className="size-10" />
      <div className="flex flex-col gap-2">
        <p className="font-bold">
          360Dialog <Badge colorScheme="orange">Beta</Badge>
        </p>
        <p className="text-sm" color="gray.600">
          Third-party WhatsApp Business Solution Provider
        </p>
      </div>
      <p className="text-xs" color="gray.500">
        Simple setup with API key only
      </p>
    </button>
  </div>
);

const Dialog360PhoneNumber = ({
  initialPhoneNumber,
  initialApiKey,
  initialWebhookSecret,
  setPhoneNumber,
  setApiKey,
  setWebhookSecret,
}: {
  initialPhoneNumber: string;
  initialApiKey: string;
  initialWebhookSecret: string;
  setPhoneNumber: (phoneNumber: string) => void;
  setApiKey: (apiKey: string) => void;
  setWebhookSecret: (webhookSecret: string) => void;
}) => (
  <div className="flex flex-col gap-4">
    <Field.Root>
      <Field.Label>Phone number</Field.Label>
      <Input
        defaultValue={initialPhoneNumber}
        onValueChange={(val) => setPhoneNumber(val.trim())}
        placeholder="+1234567890"
      />
    </Field.Root>
    <Field.Root>
      <Field.Label>API Key</Field.Label>
      <Input
        type="password"
        defaultValue={initialApiKey}
        onValueChange={(val) => setApiKey(val.trim())}
      />
      <Field.Description>
        <p>
          You can find this in your{" "}
          <TextLink href="https://hub.360dialog.com/" isExternal>
            360Dialog Hub dashboard
          </TextLink>
          .
        </p>
      </Field.Description>
    </Field.Root>
    <Field.Root>
      <Field.Label>Webhook secret</Field.Label>
      <SecretInput
        value={initialWebhookSecret}
        onValueChange={(value) => setWebhookSecret(value.trim())}
      />
      <Field.Description>
        <p>
          This secret will be required in the{" "}
          <code>{dialog360WebhookSecretHeaderName}</code> custom header.
        </p>
      </Field.Description>
    </Field.Root>
  </div>
);

const Dialog360Webhook = ({
  credentialsId,
  webhookSecret,
}: {
  credentialsId: string;
  webhookSecret: string;
}) => {
  const { workspace } = useWorkspace();
  const webhookUrl = `${
    env.NEXT_PUBLIC_VIEWER_URL?.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL?.[0]
  }/api/v1/workspaces/${workspace?.id}/whatsapp/${credentialsId}/webhook`;

  return (
    <div className="flex flex-col gap-6">
      <p>
        In your{" "}
        <TextLink href="https://hub.360dialog.com/" isExternal>
          360Dialog Hub dashboard
        </TextLink>
        , go to <code>Channels → WhatsApp → Webhooks</code> and add the
        following webhook URL:
      </p>
      <div className="flex flex-col gap-2">
        <CopyInput value={webhookUrl} />
        <p className="text-sm" color="gray.600">
          Make sure to enable webhooks for message events in your 360Dialog
          configuration.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p>Custom header name:</p>
        <CopyInput value={dialog360WebhookSecretHeaderName} />
      </div>
      <div className="flex flex-col gap-2">
        <p>Custom header value:</p>
        <CopyInput value={webhookSecret} />
      </div>
    </div>
  );
};
