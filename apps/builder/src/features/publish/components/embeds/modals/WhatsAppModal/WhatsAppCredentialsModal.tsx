import { CopyButton } from "@/components/CopyButton";
import { TextLink } from "@/components/TextLink";
import { ChevronLeftIcon, ExternalLinkIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs/TextInput";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { queryClient, trpc, trpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import {
  Box,
  Button,
  Code,
  HStack,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Stack,
  Step,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  UnorderedList,
  useSteps,
} from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { env } from "@typebot.io/env";
import { parseUnknownClientError } from "@typebot.io/lib/parseUnknownClientError";
import { isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import React, { useState } from "react";

const steps = [
  { title: "Requirements" },
  { title: "User Token" },
  { title: "Phone Number" },
  { title: "Webhook" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (id: string) => void;
};

const credentialsId = createId();

export const WhatsAppCredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <WhatsAppCreateModalContent
        onNewCredentials={onNewCredentials}
        onClose={onClose}
      />
    </Modal>
  );
};

export const WhatsAppCreateModalContent = ({
  onNewCredentials,
  onClose,
}: Pick<Props, "onNewCredentials" | "onClose">) => {
  const { workspace } = useWorkspace();
  const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  const [systemUserAccessToken, setSystemUserAccessToken] = useState("");
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

  const createMetaCredentials = async () => {
    if (!workspace) return;
    mutate({
      scope: "workspace",
      workspaceId: workspace.id,
      credentials: {
        id: credentialsId,
        type: "whatsApp",
        name: phoneNumberName,
        data: {
          systemUserAccessToken,
          phoneNumberId,
        },
      },
    });
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
    if (activeStep === steps.length - 1) return createMetaCredentials();
    if (activeStep === 1 && !(await isTokenValid())) return;
    if (activeStep === 2 && !(await isPhoneNumberAvailable())) return;

    goToNext();
  };
  return (
    <ModalContent>
      <ModalHeader>
        <HStack h="40px">
          {activeStep > 0 && (
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label={"Go back"}
              variant="ghost"
              onClick={goToPrevious}
            />
          )}
          <Heading size="md">Add a WhatsApp phone number</Heading>
        </HStack>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody as={Stack} spacing="10">
        <Stepper index={activeStep} size="sm" pt="4">
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
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={goToNextStep}
          colorScheme="orange"
          isDisabled={
            (activeStep === 1 && isEmpty(systemUserAccessToken)) ||
            (activeStep === 2 && isEmpty(phoneNumberId))
          }
          isLoading={isVerifying || isCreating}
        >
          {activeStep === steps.length - 1 ? "Submit" : "Continue"}
        </Button>
      </ModalFooter>
    </ModalContent>
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
      <Button
        as={Link}
        href="https://business.facebook.com/settings/system-users"
        isExternal
        rightIcon={<ExternalLinkIcon />}
        size="sm"
      >
        System users page
      </Button>
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
          <Button
            as={Link}
            href={`https://developers.facebook.com/apps/${appId}/whatsapp-business/wa-dev-console`}
            isExternal
            rightIcon={<ExternalLinkIcon />}
            size="sm"
          >
            WhatsApp Dev Console{" "}
          </Button>
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
        <Button
          as={Link}
          href={`https://developers.facebook.com/apps/${appId}/whatsapp-business/wa-settings`}
          rightIcon={<ExternalLinkIcon />}
          isExternal
          size="sm"
        >
          WhatsApp Settings page
        </Button>
        , click on the Edit button and insert the following values:
      </Text>
      <UnorderedList spacing={6}>
        <ListItem>
          <HStack>
            <Text flexShrink={0}>Callback URL:</Text>
            <InputGroup size="sm">
              <Input type={"text"} defaultValue={webhookUrl} />
              <InputRightElement width="60px">
                <CopyButton size="sm" textToCopy={webhookUrl} />
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
                <CopyButton size="sm" textToCopy={verificationToken} />
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
