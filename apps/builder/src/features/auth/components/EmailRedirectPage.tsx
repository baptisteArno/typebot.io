import { Seo } from "@/components/Seo";
import { Button, Heading, Tag, Text, VStack } from "@chakra-ui/react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { createEmailMagicLink } from "../helpers/createEmailMagicLink";

export const EmailRedirectPage = () => {
  const [redirectPath] = useQueryState("redirectPath");
  const [email] = useQueryState("email");
  const [token] = useQueryState("token");

  const redirectToMagicLink = () => {
    if (!token || !email) {
      toast.error("Missing token or email query params");
      return;
    }
    window.location.assign(
      createEmailMagicLink(token, email, redirectPath ?? undefined),
    );
  };

  if (!email || !token) return null;

  return (
    <VStack spacing={4} h="100vh" justifyContent="center">
      <Seo title={"Email auth confirmation"} />
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
      <Button onClick={redirectToMagicLink} colorScheme="blue">
        Continue
      </Button>
    </VStack>
  );
};
