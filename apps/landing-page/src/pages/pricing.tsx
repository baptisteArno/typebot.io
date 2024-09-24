import { StripeClimateLogo } from "@/assets/logos/StripeClimateLogo";
import { BackgroundPolygons } from "@/components/Homepage/Hero/BackgroundPolygons";
import { ChatsProTiersModal } from "@/components/PricingPage/ChatsProTiersModal";
import { EnterprisePlanCard } from "@/components/PricingPage/EnterprisePlanCard";
import { Faq } from "@/components/PricingPage/Faq";
import { FreePlanCard } from "@/components/PricingPage/FreePlanCard";
import { PlanComparisonTables } from "@/components/PricingPage/PlanComparisonTables";
import { ProPlanCard } from "@/components/PricingPage/ProPlanCard";
import { StarterPlanCard } from "@/components/PricingPage/StarterPlanCard";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header/Header";
import { SocialMetaTags } from "@/components/common/SocialMetaTags";
import { TextLink } from "@/components/common/TextLink";
import {
  DarkMode,
  Flex,
  HStack,
  Heading,
  Stack,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";

const Pricing = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Stack overflowX="hidden" bgColor="gray.900">
      <ChatsProTiersModal isOpen={isOpen} onClose={onClose} />
      <Flex
        pos="relative"
        flexDir="column"
        minHeight="100vh"
        alignItems="center"
        bgGradient="linear(to-b, gray.900, gray.800)"
        pb={40}
      >
        <SocialMetaTags currentUrl={`https://www.typebot.io/pricing`} />
        <BackgroundPolygons />
        <DarkMode>
          <Header />
        </DarkMode>

        <VStack spacing={"24"} mt={[20, 32]} w="full">
          <Stack align="center" spacing="12" w="full" px={4}>
            <VStack>
              <Heading fontSize={{ base: "4xl", xl: "6xl" }}>
                Plans fit for you
              </Heading>
              <Text
                maxW="900px"
                textAlign="center"
                fontSize={{ base: "lg", xl: "xl" }}
              >
                Whether you&apos;re a{" "}
                <Text as="span" color="orange.200" fontWeight="bold">
                  solo business owner
                </Text>
                , a{" "}
                <Text as="span" color="blue.200" fontWeight="bold">
                  growing startup
                </Text>{" "}
                or a{" "}
                <Text as="span" fontWeight="bold">
                  large company
                </Text>
                , Typebot is here to help you build high-performing chat forms
                for the right price. Pay for as little or as much usage as you
                need.
              </Text>
            </VStack>

            <HStack
              maxW="500px"
              spacing="4"
              bgColor="gray.800"
              p="4"
              rounded="md"
            >
              <StripeClimateLogo />
              <Text fontSize="sm">
                Typebot is contributing 1% of your subscription to remove CO₂
                from the atmosphere.{" "}
                <TextLink href="https://climate.stripe.com/5VCRAq" isExternal>
                  More info
                </TextLink>
              </Text>
            </HStack>
            <Stack
              direction={["column", "row"]}
              alignItems={["stretch"]}
              spacing={10}
              w="full"
              maxW="1200px"
            >
              <FreePlanCard />
              <StarterPlanCard />
              <ProPlanCard onChatsTiersClick={onOpen} />
            </Stack>

            <EnterprisePlanCard />
          </Stack>

          <VStack maxW="1200px" w="full" spacing={[12, 20]} px="4">
            <Stack w="full" spacing={10} display={["none", "flex"]}>
              <Heading>Compare plans & features</Heading>
              <PlanComparisonTables onChatsTiersClick={onOpen} />
            </Stack>
            <Faq />
          </VStack>
        </VStack>
      </Flex>
      <Footer />
    </Stack>
  );
};

export default Pricing;
