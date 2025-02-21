import { Seo } from "@/components/Seo";
 import {
  Heading,
  Stack,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {  useTranslate } from "@tolgee/react";
import { useRouter } from "next/router";
import { SignInForm } from "./SignInForm";

type Props = {
  type: "signin" | "signup";
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
          <Heading>
            {t("auth.signin.heading")  }
          </Heading>
      

        <SignInForm defaultEmail={query.g?.toString()} />
        
      </Stack>
    </VStack>
  );
};
