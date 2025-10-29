import { useTranslate } from "@tolgee/react";
import { useRouter } from "next/router";
import { Seo } from "@/components/Seo";
import { TextLink } from "@/components/TextLink";
import { SignInForm } from "./SignInForm";

type Props = {
  type: "signin" | "signup";
  defaultEmail?: string;
};

export const SignInPage = ({ type }: Props) => {
  const { t } = useTranslate();
  const { query } = useRouter();

  return (
    <div className="flex flex-col gap-4 h-screen justify-center items-center">
      <Seo
        title={
          type === "signin"
            ? t("auth.signin.heading")
            : t("auth.register.heading")
        }
      />
      <div className="flex flex-col p-8 rounded-lg gap-6 bg-gray-1">
        <div className="flex flex-col gap-4">
          <h2>
            {type === "signin"
              ? t("auth.signin.heading")
              : t("auth.register.heading")}
          </h2>
          {type === "signin" ? (
            <p>
              {t("auth.signin.noAccountLabel.preLink")}{" "}
              <TextLink href="/register">
                {t("auth.signin.noAccountLabel.link")}
              </TextLink>
            </p>
          ) : (
            <p>
              {t("auth.register.alreadyHaveAccountLabel.preLink")}{" "}
              <TextLink href="/signin">
                {t("auth.register.alreadyHaveAccountLabel.link")}
              </TextLink>
            </p>
          )}
        </div>

        <SignInForm defaultEmail={query.g?.toString()} />
      </div>
    </div>
  );
};
