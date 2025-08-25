import { GoogleLogo } from "@/components/GoogleLogo";
import { GithubIcon } from "@/components/icons";
import { AzureAdLogo } from "@/components/logos/AzureAdLogo";
import { FacebookLogo } from "@/components/logos/FacebookLogo";
import { GitlabLogo } from "@/components/logos/GitlabLogo";
import { KeycloackLogo } from "@/components/logos/KeycloakLogo";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { omit } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { type getProviders, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { stringify } from "qs";
import React, { useState } from "react";

type Props = {
  providers: Awaited<ReturnType<typeof getProviders>> | undefined;
};

export const SocialLoginButtons = ({ providers }: Props) => {
  const { t } = useTranslate();
  const { query } = useRouter();
  const { status } = useSession();
  const [authLoading, setAuthLoading] = useState<string>();

  const handleSignIn = async (provider: string) => {
    setAuthLoading(provider);
    await signIn(provider, {
      callbackUrl:
        query.callbackUrl?.toString() ??
        `/typebots?${stringify(omit(query, "error", "callbackUrl"))}`,
    });
    setTimeout(() => setAuthLoading(undefined), 3000);
  };

  const handleGitHubClick = () => handleSignIn("github");

  const handleGoogleClick = () => handleSignIn("google");

  const handleFacebookClick = () => handleSignIn("facebook");

  const handleGitlabClick = () => handleSignIn("gitlab");

  const handleMicrosoftEntraIdClick = () => handleSignIn("microsoft-entra-id");

  const handleCustomOAuthClick = () => handleSignIn("custom-oauth");

  const handleKeyCloackClick = () => handleSignIn("keycloak");

  return (
    <Stack>
      {providers?.github && (
        <Button
          onClick={handleGitHubClick}
          disabled={
            ["loading", "authenticated"].includes(status) ||
            authLoading === "github"
          }
          variant="outline-secondary"
        >
          <GithubIcon />
          {t("auth.socialLogin.githubButton.label")}
        </Button>
      )}
      {providers?.google && (
        <Button
          onClick={handleGoogleClick}
          disabled={
            ["loading", "authenticated"].includes(status) ||
            authLoading === "google"
          }
          variant="outline-secondary"
        >
          <GoogleLogo />
          {t("auth.socialLogin.googleButton.label")}
        </Button>
      )}
      {providers?.facebook && (
        <Button
          onClick={handleFacebookClick}
          disabled={
            ["loading", "authenticated"].includes(status) ||
            authLoading === "facebook"
          }
          variant="outline-secondary"
        >
          <FacebookLogo />
          {t("auth.socialLogin.facebookButton.label")}
        </Button>
      )}
      {providers?.gitlab && (
        <Button
          onClick={handleGitlabClick}
          disabled={
            ["loading", "authenticated"].includes(status) ||
            authLoading === "gitlab"
          }
          variant="outline-secondary"
        >
          <GitlabLogo />
          {t("auth.socialLogin.gitlabButton.label", {
            gitlabProviderName: providers.gitlab.name,
          })}
        </Button>
      )}
      {providers?.["microsoft-entra-id"] && (
        <Button
          onClick={handleMicrosoftEntraIdClick}
          disabled={
            ["loading", "authenticated"].includes(status) ||
            authLoading === "microsoft-entra-id"
          }
          variant="outline"
        >
          <AzureAdLogo />
          {t("auth.socialLogin.azureButton.label", {
            azureProviderName: providers["microsoft-entra-id"].name,
          })}
        </Button>
      )}
      {providers?.["custom-oauth"] && (
        <Button
          onClick={handleCustomOAuthClick}
          disabled={
            ["loading", "authenticated"].includes(status) ||
            authLoading === "custom-oauth"
          }
          variant="outline-secondary"
        >
          {t("auth.socialLogin.customButton.label", {
            customProviderName: providers["custom-oauth"].name,
          })}
        </Button>
      )}
      {providers?.keycloak && (
        <Button
          onClick={handleKeyCloackClick}
          disabled={
            ["loading", "authenticated"].includes(status) ||
            authLoading === "keycloak"
          }
          variant="outline-secondary"
        >
          <KeycloackLogo />
          {t("auth.socialLogin.keycloakButton.label")}
        </Button>
      )}
    </Stack>
  );
};
