import {
  Box,
  Card,
  CardBody,
  Code,
  Heading,
  HStack,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  OrderedList,
  Stack,
  Step,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Tag,
  Text,
  UnorderedList,
  useSteps,
  VStack,
} from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { env } from "@typebot.io/env";
import { parseUnknownClientError } from "@typebot.io/lib/parseUnknownClientError";
import { isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { CopyButton } from "@/components/CopyButton";
import { ChevronLeftIcon, ExternalLinkIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs/TextInput";
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
  const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
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
      { enabled: isNotEmpty(systemUserAccessToken) },
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
      <HStack h="40px">
        {(activeStep > 0 || provider) && (
          <Button
            size="icon"
            aria-label={"Go back"}
            variant="ghost"
            onClick={goToPrevious}
          >
            <ChevronLeftIcon />
          </Button>
        )}
        <Heading size="md">
          {!provider
            ? "Choose WhatsApp Provider"
            : provider === "meta"
              ? "Add Meta WhatsApp number"
              : "Add 360Dialog Integration"}
        </Heading>
      </HStack>
      {!provider ? (
        <ProviderSelection onProviderSelect={setProvider} />
      ) : (
        <>
          <Stepper index={activeStep} size="sm">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
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
  <Stack spacing={4}>
    <Text>
      Make sure you have{" "}
      <TextLink
        href="https://docs.typebot.io/deploy/whatsapp/create-meta-app"
        isExternal
      >
        created a WhatsApp Meta app
      </TextLink>
      . You should be able to get to this page:
    </Text>
    <Image
      src="/images/whatsapp-quickstart-page.png"
      alt="WhatsApp quickstart page"
      rounded="md"
    />
  </Stack>
);

const SystemUserToken = ({
  initialToken,
  setToken,
}: {
  initialToken: string;
  setToken: (id: string) => void;
}) => (
  <OrderedList spacing={4}>
    <ListItem>
      Go to your{" "}
      <ButtonLink
        href="https://business.facebook.com/settings/system-users"
        target="_blank"
        variant="secondary"
        size="sm"
      >
        System users page
        <ExternalLinkIcon />
      </ButtonLink>
    </ListItem>
    <ListItem>
      Create a new user by clicking on <Code>Add</Code>
    </ListItem>
    <ListItem>
      Fill it with any name and give it the <Code>Admin</Code> role
    </ListItem>
    <ListItem>
      <Stack>
        <Text>
          Click on <Code>Add assets</Code>. Under <Code>Apps</Code>, look for
          your previously created app, select it and check{" "}
          <Code>Manage app</Code>
        </Text>
        <Image
          src="/images/meta-system-user-assets.png"
          alt="Meta system user assets"
          rounded="md"
        />
      </Stack>
    </ListItem>
    <ListItem>
      <Stack spacing={4}>
        <Text>
          Now, click on <Code>Generate new token</Code>. Select your app.
        </Text>
        <UnorderedList spacing={4}>
          <ListItem>
            Token expiration: <Code>Never</Code>
          </ListItem>
          <ListItem>
            Available Permissions: <Code>whatsapp_business_messaging</Code>,{" "}
            <Code>whatsapp_business_management</Code>{" "}
          </ListItem>
        </UnorderedList>
      </Stack>
    </ListItem>
    <ListItem>Copy and paste the generated token:</ListItem>
    <TextInput
      isRequired
      type="password"
      label="System User Token"
      defaultValue={initialToken}
      onChange={(val) => setToken(val.trim())}
      withVariableButton={false}
      debounceTimeout={0}
    />
  </OrderedList>
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
  <OrderedList spacing={4}>
    <ListItem>
      <HStack>
        <Text>
          Go to your{" "}
          <ButtonLink
            href={`https://developers.facebook.com/apps/${appId}/whatsapp-business/wa-dev-console`}
            target="_blank"
            variant="secondary"
            size="sm"
          >
            WhatsApp Dev Console <ExternalLinkIcon />
          </ButtonLink>
        </Text>
      </HStack>
    </ListItem>
    <ListItem>
      Add your phone number by clicking on the <Code>Add phone number</Code>{" "}
      button.
    </ListItem>
    <ListItem>
      <Stack>
        <Text>
          Select a phone number and paste the associated{" "}
          <Code>Phone number ID</Code>
        </Text>
        <HStack>
          <TextInput
            label="Phone number ID"
            defaultValue={initialPhoneNumberId}
            withVariableButton={false}
            debounceTimeout={0}
            isRequired
            onChange={setPhoneNumberId}
          />
        </HStack>
        <Image
          src="/images/whatsapp-phone-selection.png"
          alt="WA phone selection"
        />
      </Stack>
    </ListItem>
  </OrderedList>
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
    <Stack spacing={6}>
      <Text>
        In your{" "}
        <ButtonLink
          href={`https://developers.facebook.com/apps/${appId}/whatsapp-business/wa-settings`}
          target="_blank"
          variant="secondary"
          size="sm"
        >
          WhatsApp Settings page
          <ExternalLinkIcon />
        </ButtonLink>
        , click on the Edit button and insert the following values:
      </Text>
      <UnorderedList spacing={6}>
        <ListItem>
          <HStack>
            <Text flexShrink={0}>Callback URL:</Text>
            <InputGroup size="sm">
              <Input type={"text"} defaultValue={webhookUrl} />
              <InputRightElement width="60px">
                <CopyButton textToCopy={webhookUrl} />
              </InputRightElement>
            </InputGroup>
          </HStack>
        </ListItem>
        <ListItem>
          <HStack>
            <Text flexShrink={0}>Verify Token:</Text>
            <InputGroup size="sm">
              <Input type={"text"} defaultValue={verificationToken} />
              <InputRightElement width="60px">
                <CopyButton textToCopy={verificationToken} />
              </InputRightElement>
            </InputGroup>
          </HStack>
        </ListItem>
        <ListItem>
          <HStack>
            <Text flexShrink={0}>
              Webhook fields: Next to <Code>messages</Code>, click on
              "Subscribe"
            </Text>
          </HStack>
        </ListItem>
      </UnorderedList>
    </Stack>
  );
};

const ProviderSelection = ({
  onProviderSelect,
}: {
  onProviderSelect: (provider: "meta" | "360dialog") => void;
}) => (
  <HStack spacing={4} w="full">
    <Card
      w="full"
      cursor="pointer"
      onClick={() => onProviderSelect("meta")}
      _hover={{ bg: "gray.50" }}
    >
      <CardBody textAlign="center">
        <VStack spacing={3}>
          <MetaLogo boxSize={10} />
          <Stack>
            <Text fontWeight="bold">Meta (Facebook)</Text>
            <Text fontSize="sm" color="gray.600">
              Official Meta WhatsApp Business API
            </Text>
          </Stack>
          <Text fontSize="xs" color="gray.500">
            Requires Meta Developer account, system user token, and phone number
            setup
          </Text>
        </VStack>
      </CardBody>
    </Card>
    <Card
      w="full"
      cursor="pointer"
      onClick={() => onProviderSelect("360dialog")}
      _hover={{ bg: "gray.50" }}
    >
      <CardBody textAlign="center">
        <VStack spacing={3}>
          <Dialog360Logo boxSize={10} />
          <Stack>
            <Text fontWeight="bold">
              360Dialog <Tag colorScheme="orange">Beta</Tag>
            </Text>
            <Text fontSize="sm" color="gray.600">
              Third-party WhatsApp Business Solution Provider
            </Text>
          </Stack>
          <Text fontSize="xs" color="gray.500">
            Simple setup with API key only
          </Text>
        </VStack>
      </CardBody>
    </Card>
  </HStack>
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
  <Stack spacing={4}>
    <TextInput
      isRequired
      label="Phone number"
      defaultValue={initialPhoneNumber}
      onChange={(val) => setPhoneNumber(val.trim())}
      withVariableButton={false}
      debounceTimeout={0}
      placeholder="+1234567890"
    />
    <TextInput
      isRequired
      type="password"
      label="API Key"
      defaultValue={initialApiKey}
      onChange={(val) => setApiKey(val.trim())}
      helperText={
        <Text>
          You can find this in your{" "}
          <TextLink href="https://hub.360dialog.com/" isExternal>
            360Dialog Hub dashboard
          </TextLink>
          .
        </Text>
      }
      withVariableButton={false}
      debounceTimeout={0}
    />
  </Stack>
);

const Dialog360Webhook = ({ credentialsId }: { credentialsId: string }) => {
  const { workspace } = useWorkspace();
  const webhookUrl = `${
    env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0]
  }/api/v1/workspaces/${workspace?.id}/whatsapp/${credentialsId}/webhook`;

  return (
    <Stack spacing={6}>
      <Text>
        In your{" "}
        <TextLink href="https://hub.360dialog.com/" isExternal>
          360Dialog Hub dashboard
        </TextLink>
        , go to <Code>Channels → WhatsApp → Webhooks</Code> and add the
        following webhook URL:
      </Text>
      <Stack>
        <HStack>
          <InputGroup size="sm">
            <Input type={"text"} defaultValue={webhookUrl} />
            <InputRightElement width="60px">
              <CopyButton size="sm" textToCopy={webhookUrl} />
            </InputRightElement>
          </InputGroup>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          Make sure to enable webhooks for message events in your 360Dialog
          configuration.
        </Text>
      </Stack>
    </Stack>
  );
};
