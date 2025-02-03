import { LaptopIcon, MouseIcon } from "@/components/icons";
import {
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { GraphNavigation } from "@typebot.io/prisma/enum";

type Props = {
  defaultValue: string;
  onChange: (value: string) => void;
};
export const GraphNavigationRadioGroup = ({
  defaultValue,
  onChange,
}: Props) => {
  const { t } = useTranslate();
  const graphNavigationData = [
    {
      value: GraphNavigation.MOUSE,
      label: t("account.preferences.graphNavigation.mouse.label"),
      description: t("account.preferences.graphNavigation.mouse.description"),
      icon: <MouseIcon boxSize="35px" />,
    },
    {
      value: GraphNavigation.TRACKPAD,
      label: t("account.preferences.graphNavigation.trackpad.label"),
      description: t(
        "account.preferences.graphNavigation.trackpad.description",
      ),
      icon: <LaptopIcon boxSize="35px" />,
    },
  ];
  return (
    <RadioGroup onChange={onChange} defaultValue={defaultValue}>
      <HStack spacing={4} w="full" align="stretch">
        {graphNavigationData.map((option) => (
          <VStack
            key={option.value}
            as="label"
            htmlFor={option.label}
            cursor="pointer"
            borderWidth="1px"
            borderRadius="md"
            w="full"
            p="6"
            spacing={6}
            justifyContent="space-between"
          >
            <VStack spacing={6}>
              {option.icon}
              <Stack>
                <Text fontWeight="bold">{option.label}</Text>
                <Text>{option.description}</Text>
              </Stack>
            </VStack>

            <Radio value={option.value} id={option.label} />
          </VStack>
        ))}
      </HStack>
    </RadioGroup>
  );
};
