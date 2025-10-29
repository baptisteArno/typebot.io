import { createId } from "@paralleldrive/cuid2";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
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
import { useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { CopyInput } from "@/components/inputs/CopyInput";
import { Dialog360Logo } from "@/components/logos/Dialog360Logo";
import { MetaLogo } from "@/components/logos/MetaLogo";
import { TextLink } from "@/components/TextLink";
import { useFeatureFlagsQuery } from "@/features/featureFlags/useFeatureFlagsQuery";
import { formatPhoneNumberDisplayName } from "@/features/whatsapp/formatPhoneNumberDisplayName";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc, trpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";

const metaSteps = [
  { title: "Requirements" },
  { title: "User Token" },
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
  const featureFlags = useFeatureFlagsQuery();

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <WhatsAppCreateDialogBody
        is360DialogEnabled={featureFlags?.["360dialog"] ?? false}
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
  is360DialogEnabled,
  onNewCredentials,
  onClose,
}: {
  is360DialogEnabled: boolean;
  onNewCredentials: (id: string) => void;
  onClose: () => void;
}) => {
  const { workspace } = useWorkspace();
  const [provider, setProvider] = useState<"meta" | "360dialog" | null>(
    is360DialogEnabled ? null : "meta",
  );
  const steps = provider === "meta" ? metaSteps : dialog360Steps;
  const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps();
  const [systemUserAccessToken, setSystemUserAccessToken] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [phoneNumberName, setPhoneNumberName] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
        resetForm();
      },
    }),
  );

  const { data: tokenInfoData } = useQuery(
    trpc.whatsAppInternal.getSystemTokenInfo.queryOptions(
      {
        token: systemUserAccessToken,
      },
      { enabled: isNotEmpty(systemUserAccessToken) && activeStep > 1 },
    ),
  );

  const resetForm = () => {
    setActiveStep(0);
    setSystemUserAccessToken("");
    setPhoneNumberId("");
  };

  const createCredentials = async () => {
    if (!workspace || !provider) return;

    if (provider === "meta") {
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
            phoneNumberId,
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
          },
        },
      });
    }
  };

  const isTokenValid = async () => {
    setIsVerifying(true);
    try {
      const { expiresAt, scopes } =
        await trpcClient.whatsAppInternal.getSystemTokenInfo.query({
          token: systemUserAccessToken,
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
      setIsVerifying(false);
      if (err instanceof TRPCClientError) {
        if (err.data?.logError) {
          toast(err.data.logError);
          return false;
        }
      }
      toast(await parseUnknownClientError({ err }));
      return false;
    }
    setIsVerifying(false);
    return true;
  };

  const isPhoneNumberAvailable = async () => {
    setIsVerifying(true);
    try {
      const { name } = await trpcClient.whatsAppInternal.getPhoneNumber.query({
        systemToken: systemUserAccessToken,
        phoneNumberId,
      });
      setPhoneNumberName(name);
      try {
        const { message } =
          await trpcClient.whatsAppInternal.verifyIfPhoneNumberAvailable.query({
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
          await trpcClient.whatsAppInternal.generateVerificationToken.mutate();
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
      if (err instanceof TRPCClientError) {
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
      <div className="flex items-center gap-2 h-[40px]">
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
              <>
                <div key={index} className="flex gap-2">
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
              </>
            ))}
          </div>
          {provider === "meta" && (
            <>
              {activeStep === 0 && <Requirements />}
              {activeStep === 1 && (
                <SystemUserToken
                  initialToken={systemUserAccessToken}
                  setToken={setSystemUserAccessToken}
                />
              )}
              {activeStep === 2 && (
                <PhoneNumber
                  appId={tokenInfoData?.appId}
                  initialPhoneNumberId={phoneNumberId}
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
                  setApiKey={setApiKey}
                  initialPhoneNumber={phoneNumberName}
                  setPhoneNumber={setPhoneNumberName}
                />
              )}
              {activeStep === 1 && (
                <Dialog360Webhook credentialsId={credentialsId} />
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
                isEmpty(phoneNumberId)) ||
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
        href="https://docs.typebot.io/deploy/whatsapp/create-meta-app"
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
  initialToken,
  setToken,
}: {
  initialToken: string;
  setToken: (id: string) => void;
}) => (
  <ol>
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
          <code>Manage app</code>
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
  initialPhoneNumberId,
  setPhoneNumberId,
}: {
  appId?: string;
  initialPhoneNumberId: string;
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
          <code>Phone number ID</code>
        </p>
        <div className="flex items-center gap-2">
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
    </div>
  );
};

const ProviderSelection = ({
  onProviderSelect,
}: {
  onProviderSelect: (provider: "meta" | "360dialog") => void;
}) => (
  <div className="flex items-center gap-4 w-full">
    <div
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
    </div>
    <div
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
    </div>
  </div>
);

const Dialog360PhoneNumber = ({
  initialPhoneNumber,
  initialApiKey,
  setPhoneNumber,
  setApiKey,
}: {
  initialPhoneNumber: string;
  initialApiKey: string;
  setPhoneNumber: (phoneNumber: string) => void;
  setApiKey: (apiKey: string) => void;
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
  </div>
);

const Dialog360Webhook = ({ credentialsId }: { credentialsId: string }) => {
  const { workspace } = useWorkspace();
  const webhookUrl = `${
    env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0]
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
    </div>
  );
};
