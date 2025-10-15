import { useTranslate } from "@tolgee/react";
import { Alert } from "@typebot.io/ui/components/Alert";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";

type Props = {
  error: string;
};

export const SignInError = ({ error }: Props) => {
  const { t } = useTranslate();
  const errors: Record<string, string> = {
    Signin: t("auth.error.default"),
    OAuthSignin: t("auth.error.default"),
    OAuthCallback: t("auth.error.default"),
    OAuthCreateAccount: t("auth.error.email"),
    EmailCreateAccount: t("auth.error.default"),
    Callback: t("auth.error.default"),
    Verification:
      "Your email authentication request is expired. Please sign in again.",
    OAuthAccountNotLinked: t("auth.error.oauthNotLinked"),
    default: t("auth.error.unknown"),
  };

  if (!errors[error]) return null;
  return (
    <Alert.Root variant="error">
      <TriangleAlertIcon />
      <Alert.Description>{errors[error]}</Alert.Description>
    </Alert.Root>
  );
};
