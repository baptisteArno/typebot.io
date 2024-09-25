import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import {
  Button,
  HStack,
  Heading,
  Stack,
  Text,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { T, useTranslate } from "@tolgee/react";
import { prices } from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { Plan } from "@typebot.io/prisma/enum";
import { FeaturesList } from "./FeaturesList";

type Props = {
  currentPlan: Plan;
  currency?: "eur" | "usd";
  isLoading?: boolean;
  onPayClick: () => void;
};

export const StarterPlanPricingCard = ({
  currentPlan,
  isLoading,
  currency,
  onPayClick,
}: Props) => {
  const { t } = useTranslate();

  const getButtonLabel = () => {
    if (currentPlan === Plan.PRO) return t("downgrade");
    if (currentPlan === Plan.STARTER)
      return t("billing.pricingCard.upgradeButton.current");
    return t("upgrade");
  };

  return (
    <Stack
      spacing={6}
      p="6"
      rounded="lg"
      borderWidth="1px"
      flex="1"
      h="full"
      justifyContent="space-between"
      pt="8"
    >
      <Stack spacing="4">
        <Stack>
          <Stack spacing="4">
            <Heading fontSize="2xl">
              <T
                keyName="billing.pricingCard.heading"
                params={{
                  strong: <chakra.span color="orange.400">Starter</chakra.span>,
                }}
              />
            </Heading>
            <Text>{t("billing.pricingCard.starter.description")}</Text>
          </Stack>
          <Heading>
            {formatPrice(prices.STARTER, { currency })}
            <chakra.span fontSize="md">
              {t("billing.pricingCard.perMonth")}
            </chakra.span>
          </Heading>
        </Stack>

        <FeaturesList
          features={[
            t("billing.pricingCard.starter.includedSeats"),
            <Stack key="starter-chats" spacing={0}>
              <HStack>
                <Text>2,000 {t("billing.pricingCard.chatsPerMonth")}</Text>
                <MoreInfoTooltip>
                  {t("billing.pricingCard.chatsTooltip")}
                </MoreInfoTooltip>
              </HStack>
              <Text
                fontSize="sm"
                color={useColorModeValue("gray.500", "gray.400")}
              >
                Extra chats: $10 per 500
              </Text>
            </Stack>,
            t("billing.pricingCard.starter.brandingRemoved"),
            t("billing.pricingCard.starter.fileUploadBlock"),
            t("billing.pricingCard.starter.createFolders"),
            "Direct priority support",
          ]}
        />
      </Stack>
      <Button
        colorScheme="orange"
        variant="outline"
        onClick={onPayClick}
        isLoading={isLoading}
        isDisabled={currentPlan === Plan.STARTER}
      >
        {getButtonLabel()}
      </Button>
    </Stack>
  );
};
