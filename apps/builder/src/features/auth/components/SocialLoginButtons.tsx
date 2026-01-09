import { useTranslate } from "@tolgee/react";
import { omit } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { GithubIcon } from "@typebot.io/ui/icons/GithubIcon";
import { useRouter } from "next/router";
import { stringify } from "qs";
import { useState } from "react";
import { GoogleLogo } from "@/components/GoogleLogo";
import { AzureAdLogo } from "@/components/logos/AzureAdLogo";
import { FacebookLogo } from "@/components/logos/FacebookLogo";
import { GitlabLogo } from "@/components/logos/GitlabLogo";
import { KeycloackLogo } from "@/components/logos/KeycloakLogo";
import { authClient, useSession } from "@/lib/auth/client";
import type { AvailableProviders } from "@/lib/auth/getAvailableProviders";

type Props = {
  availableProviders: AvailableProviders;
};

export const SocialLoginButtons = ({ availableProviders }: Props) => {
  const { t } = useTranslate();
  const { query } = useRouter();
  const { data: session, isPending } = useSession();
  const [authLoading, setAuthLoading] = useState<string>();

  const getCallbackUrl = () =>
    query.callbackUrl?.toString() ??
    `/typebots?${stringify(omit(query, "error", "callbackUrl"))}`;

  const handleSignIn = async (provider: "github" | "google" | "facebook" | "gitlab" | "microsoft") => {
    setAuthLoading(provider);
    await authClient.signIn.social({
      provider,
      callbackURL: getCallbackUrl(),
    });
    setTimeout(() => setAuthLoading(undefined), 3000);
  };

  const handleGitHubClick = () => handleSignIn("github");

  const handleGoogleClick = () => handleSignIn("google");

  const handleFacebookClick = () => handleSignIn("facebook");

  const handleGitlabClick = () => handleSignIn("gitlab");

  const handleMicrosoftEntraIdClick = () => handleSignIn("microsoft");

  const handleCustomOAuthClick = async () => {
    setAuthLoading("custom-oauth");
    await authClient.signIn.oauth2({
      providerId: "custom-oauth",
      callbackURL: getCallbackUrl(),
    });
    setTimeout(() => setAuthLoading(undefined), 3000);
  };

  const handleKeyCloackClick = async () => {
    setAuthLoading("keycloak");
    await authClient.signIn.oauth2({
      providerId: "keycloak",
      callbackURL: getCallbackUrl(),
    });
    setTimeout(() => setAuthLoading(undefined), 3000);
  };

  const isDisabled = isPending || !!session?.user;

  return (
    <div className="flex flex-col gap-2">
      {availableProviders.github && (
        <Button
          onClick={handleGitHubClick}
          disabled={isDisabled || authLoading === "github"}
          variant="outline-secondary"
        >
          <GithubIcon />
          {t("auth.socialLogin.githubButton.label")}
        </Button>
      )}
      {availableProviders.google && (
        <Button
          onClick={handleGoogleClick}
          disabled={isDisabled || authLoading === "google"}
          variant="outline-secondary"
        >
          <GoogleLogo />
          {t("auth.socialLogin.googleButton.label")}
        </Button>
      )}
      {availableProviders.facebook && (
        <Button
          onClick={handleFacebookClick}
          disabled={isDisabled || authLoading === "facebook"}
          variant="outline-secondary"
        >
          <FacebookLogo />
          {t("auth.socialLogin.facebookButton.label")}
        </Button>
      )}
      {availableProviders.gitlab && (
        <Button
          onClick={handleGitlabClick}
          disabled={isDisabled || authLoading === "gitlab"}
          variant="outline-secondary"
        >
          <GitlabLogo />
          {t("auth.socialLogin.gitlabButton.label", {
            gitlabProviderName: "GitLab",
          })}
        </Button>
      )}
      {availableProviders.microsoft && (
        <Button
          onClick={handleMicrosoftEntraIdClick}
          disabled={isDisabled || authLoading === "microsoft"}
          variant="outline"
        >
          <AzureAdLogo />
          {t("auth.socialLogin.azureButton.label", {
            azureProviderName: "Microsoft",
          })}
        </Button>
      )}
      {availableProviders.customOAuth && (
        <Button
          onClick={handleCustomOAuthClick}
          disabled={isDisabled || authLoading === "custom-oauth"}
          variant="outline-secondary"
        >
          {t("auth.socialLogin.customButton.label", {
            customProviderName: availableProviders.customOAuthName || "SSO",
          })}
        </Button>
      )}
      {availableProviders.keycloak && (
        <Button
          onClick={handleKeyCloackClick}
          disabled={isDisabled || authLoading === "keycloak"}
          variant="outline-secondary"
        >
          <KeycloackLogo />
          {t("auth.socialLogin.keycloakButton.label")}
        </Button>
      )}
    </div>
  );
};
