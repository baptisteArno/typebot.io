import { TextLink } from "@/components/TextLink";
import { useToast } from "@/hooks/useToast";
import { sanitizeUrl } from "@braintree/sanitize-url";
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  HStack,
  type HTMLChakraProps,
  Input,
  PinInput,
  PinInputField,
  SlideFade,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { BuiltInProviderType } from "next-auth/providers/index";
import {
  type ClientSafeProvider,
  type LiteralUnion,
  getProviders,
  signIn,
  useSession,
} from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import type { ChangeEvent, FormEvent } from "react";
import React, { useEffect, useState } from "react";
import { createEmailMagicLink } from "../helpers/createEmailMagicLink";
import { DividerWithText } from "./DividerWithText";
import { SignInError } from "./SignInError";
import { SocialLoginButtons } from "./SocialLoginButtons";

type Props = {
  defaultEmail?: string;
};

export const SignInForm = ({
  defaultEmail,
}: Props & HTMLChakraProps<"form">) => {
  const { t } = useTranslate();
  const router = useRouter();
  const [authError, setAuthError] = useQueryState("error");
  const [redirectPath] = useQueryState("redirectPath");
  const { status } = useSession();
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  const [emailValue, setEmailValue] = useState(defaultEmail ?? "");
  const [isMagicCodeSent, setIsMagicCodeSent] = useState(false);

  const { showToast } = useToast();
  const [providers, setProviders] =
    useState<
      Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>
    >();

  const hasNoAuthProvider =
    !isLoadingProviders && Object.keys(providers ?? {}).length === 0;

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectPath ? sanitizeUrl(redirectPath) : "/typebots");
      return;
    }
    (async () => {
      const providers = await getProviders();
      setProviders(providers ?? undefined);
      setIsLoadingProviders(false);
    })();
  }, [status, router]);

  useEffect(() => {
    if (authError === "ip-banned") {
      showToast({
        status: "info",
        description:
          "Your account has suspicious activity and is being reviewed by our team. Feel free to contact us.",
      });
    }
  }, [authError, showToast]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmailValue(e.target.value);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (isMagicCodeSent) return;
    setAuthLoading(true);
    try {
      const response = await signIn("email", {
        email: emailValue,
        redirect: false,
      });
      if (response?.error) {
        if (response.error.includes("rate-limited"))
          showToast({
            status: "info",
            description: t("auth.signinErrorToast.tooManyRequests"),
          });
        else if (response.error.includes("sign-up-disabled"))
          showToast({
            title: t("auth.signinErrorToast.title"),
            description: t("auth.signinErrorToast.description"),
          });
        else
          showToast({
            status: "info",
            description: t("errorMessage"),
            details: {
              content: "Check server logs to see relevent error message.",
              lang: "json",
            },
          });
      } else {
        setIsMagicCodeSent(true);
      }
    } catch (e) {
      showToast({
        status: "info",
        description: "An error occured while signing in",
      });
    }
    setAuthLoading(false);
  };

  const redirectToMagicLink = (token: string) => {
    window.location.assign(
      createEmailMagicLink(token, emailValue, redirectPath ?? undefined),
    );
  };

  if (isLoadingProviders) return <Spinner />;
  if (hasNoAuthProvider)
    return (
      <Text>
        {t("auth.noProvider.preLink")}{" "}
        <TextLink
          href="https://docs.typebot.io/self-hosting/configuration"
          isExternal
        >
          {t("auth.noProvider.link")}
        </TextLink>
      </Text>
    );
  return (
    <Stack spacing="4" w="330px">
      {!isMagicCodeSent && (
        <>
          <SocialLoginButtons providers={providers} />
          {providers?.email && (
            <>
              <DividerWithText mt="6">{t("auth.orEmailLabel")}</DividerWithText>
              <HStack as="form" onSubmit={handleEmailSubmit}>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@company.com"
                  required
                  value={emailValue}
                  onChange={handleEmailChange}
                />
                <Button
                  type="submit"
                  isLoading={
                    ["loading", "authenticated"].includes(status) || authLoading
                  }
                  isDisabled={isMagicCodeSent}
                >
                  {t("auth.emailSubmitButton.label")}
                </Button>
              </HStack>
            </>
          )}
        </>
      )}
      <SlideFade offsetY="20px" in={isMagicCodeSent} unmountOnExit>
        <Stack spacing={3}>
          <Alert status="success" w="100%">
            <HStack>
              <AlertIcon />
              <Stack spacing={1}>
                <Text fontWeight="semibold">{t("auth.magicLink.title")}</Text>
                <Text fontSize="sm">{t("auth.magicLink.description")}</Text>
              </Stack>
            </HStack>
          </Alert>
          <FormControl as={VStack} spacing={0}>
            <FormLabel>Login code:</FormLabel>
            <HStack>
              <PinInput onComplete={redirectToMagicLink}>
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
          </FormControl>
        </Stack>
      </SlideFade>
      {authError && <SignInError error={authError} />}
    </Stack>
  );
};
