import { sanitizeUrl } from "@braintree/sanitize-url";
import {
  FormControl,
  FormLabel,
  HStack,
  type HTMLChakraProps,
  Input,
  PinInput,
  PinInputField,
  SlideFade,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { CheckmarkSquare02Icon } from "@typebot.io/ui/icons/CheckmarkSquare02Icon";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { useRouter } from "next/navigation";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useQueryState } from "nuqs";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { TextLink } from "@/components/TextLink";
import { toast } from "@/lib/toast";
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

  const [providers, setProviders] =
    useState<Awaited<ReturnType<typeof getProviders>>>();

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
      toast({
        type: "info",
        description:
          "Your account has suspicious activity and is being reviewed by our team. Feel free to contact us.",
      });
    }
  }, [authError]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmailValue(e.target.value);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (isMagicCodeSent) return;
    setAuthLoading(true);
    try {
      const response = await signIn("nodemailer", {
        email: emailValue,
        redirect: false,
      });
      if (response?.error) {
        if (response.error.includes("too-many-requests"))
          toast({
            type: "info",
            description: t("auth.signinErrorToast.tooManyRequests"),
          });
        else if (response.error.includes("sign-up-disabled"))
          toast({
            type: "info",
            description: t("auth.signinErrorToast.title"),
          });
        else if (response.error.includes("email-not-legit"))
          toast({
            description: "Please use a valid email address",
          });
        else
          toast({
            description: t("errorMessage"),
            details: "Check server logs to see relevent error message.",
          });
      } else {
        setIsMagicCodeSent(true);
      }
    } catch (_e) {
      toast({
        type: "info",
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

  if (isLoadingProviders) return <LoaderCircleIcon className="animate-spin" />;
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
    <Stack spacing="6" w="330px">
      {!isMagicCodeSent && (
        <>
          <SocialLoginButtons providers={providers} />
          {providers?.nodemailer && (
            <>
              <DividerWithText>{t("auth.orEmailLabel")}</DividerWithText>
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
                  disabled={
                    ["loading", "authenticated"].includes(status) ||
                    authLoading ||
                    isMagicCodeSent
                  }
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
          <Alert.Root variant="success">
            <CheckmarkSquare02Icon />
            <div className="flex flex-col gap-2">
              <Alert.Title>{t("auth.magicLink.title")}</Alert.Title>
              <Alert.Description>
                {t("auth.magicLink.description")}
              </Alert.Description>
            </div>
          </Alert.Root>
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
