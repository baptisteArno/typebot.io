import {
  Heading,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
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
    <VStack spacing={4} h="100vh" justifyContent="center">
      <Seo
        title={
          type === "signin"
            ? t("auth.signin.heading")
            : t("auth.register.heading")
        }
      />
      <Stack
        bgColor={useColorModeValue("white", "gray.900")}
        p={8}
        rounded="lg"
        spacing={6}
      >
        <Stack gap={4}>
          <Heading>
            {type === "signin"
              ? t("auth.signin.heading")
              : t("auth.register.heading")}
          </Heading>
          {type === "signin" ? (
            <Text>
              {t("auth.signin.noAccountLabel.preLink")}{" "}
              <TextLink href="/register">
                {t("auth.signin.noAccountLabel.link")}
              </TextLink>
            </Text>
          ) : (
            <Text>
              {t("auth.register.alreadyHaveAccountLabel.preLink")}{" "}
              <TextLink href="/signin">
                {t("auth.register.alreadyHaveAccountLabel.link")}
              </TextLink>
            </Text>
          )}
        </Stack>

        <SignInForm defaultEmail={query.g?.toString()} />
      </Stack>
    </VStack>
  );
};
