import { sanitizeUrl } from "@braintree/sanitize-url";
import { useTranslate } from "@tolgee/react";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { Otp } from "@typebot.io/ui/components/Otp";
import { CheckmarkSquare02Icon } from "@typebot.io/ui/icons/CheckmarkSquare02Icon";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRouter } from "next/navigation";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useQueryState } from "nuqs";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { TextLink } from "@/components/TextLink";
import { toast } from "@/lib/toast";
import { createEmailMagicLink } from "../helpers/createEmailMagicLink";
import { DividerWithText } from "./DividerWithText";
import { SignInError } from "./SignInError";
import { SocialLoginButtons } from "./SocialLoginButtons";

type Props = {
  defaultEmail?: string;
  className?: string;
};

export const SignInForm = ({ defaultEmail, className }: Props) => {
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
      <p>
        {t("auth.noProvider.preLink")}{" "}
        <TextLink
          href="https://docs.typebot.io/self-hosting/configuration"
          isExternal
        >
          {t("auth.noProvider.link")}
        </TextLink>
      </p>
    );
  return (
    <div className={cn("flex flex-col gap-6 w-[330px]", className)}>
      {!isMagicCodeSent && (
        <>
          <SocialLoginButtons providers={providers} />
          {providers?.nodemailer && (
            <>
              <DividerWithText>{t("auth.orEmailLabel")}</DividerWithText>
              <form
                className="flex items-center gap-2"
                onSubmit={handleEmailSubmit}
              >
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@company.com"
                  required
                  value={emailValue}
                  onValueChange={setEmailValue}
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
              </form>
            </>
          )}
        </>
      )}
      {isMagicCodeSent && (
        <div className="flex flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-4">
          <Alert.Root variant="success">
            <CheckmarkSquare02Icon />
            <div className="flex flex-col gap-2">
              <Alert.Title>{t("auth.magicLink.title")}</Alert.Title>
              <Alert.Description>
                {t("auth.magicLink.description")}
              </Alert.Description>
            </div>
          </Alert.Root>
          <Field.Root>
            <Field.Label>Login code:</Field.Label>
            <Otp.Root maxLength={6} onComplete={redirectToMagicLink}>
              <Otp.Group>
                <Otp.Slot index={0} />
                <Otp.Slot index={1} />
                <Otp.Slot index={2} />
                <Otp.Slot index={3} />
                <Otp.Slot index={4} />
                <Otp.Slot index={5} />
              </Otp.Group>
            </Otp.Root>
          </Field.Root>
        </div>
      )}
      {authError && <SignInError error={authError} />}
    </div>
  );
};
