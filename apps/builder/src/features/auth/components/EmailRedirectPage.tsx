import { Seo } from "@/components/Seo";
import { toast } from "@/lib/toast";
import {
  Heading,
  Stack,
  Tag,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Button } from "@typebot.io/ui/components/Button";
import { useQueryState } from "nuqs";
import { createEmailMagicLink } from "../helpers/createEmailMagicLink";

export const EmailRedirectPage = () => {
  const [redirectPath] = useQueryState("redirectPath");
  const [email] = useQueryState("email");
  const [token] = useQueryState("token");
  const bgColor = useColorModeValue("gray.50", "gray.900");

  const redirectToMagicLink = () => {
    if (!token || !email) {
      toast({ description: "Missing token or email query params" });
      return;
    }
    window.location.assign(
      createEmailMagicLink(token, email, redirectPath ?? undefined),
    );
  };

  if (!email || !token) return null;

  return (
    <VStack h="100vh" justifyContent="center">
      <Seo title={"Email auth confirmation"} />
      <Stack bg={bgColor} p={10} borderRadius={8} borderWidth={1} spacing={6}>
        <Stack spacing={4}>
          <Heading
            onClick={() => {
              throw new Error("Sentry is working");
            }}
          >
            Email authentication
          </Heading>
          <Text>
            You are about to login with <Tag>{email}</Tag>
          </Text>
        </Stack>
        <Button onClick={redirectToMagicLink}>Continue</Button>
      </Stack>
    </VStack>
  );
};
