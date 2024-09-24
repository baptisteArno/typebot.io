import { MotionStack } from "@/components/MotionStack";
import {
  Button,
  type ButtonProps,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import { StandardIllustration } from "./illustrations/StandardIllustration";

type Props = StackProps & Pick<ButtonProps, "isDisabled">;

export const StandardMenuButton = (props: Props) => {
  return (
    <MotionStack
      as={Button}
      fontWeight="normal"
      alignItems="center"
      variant="outline"
      colorScheme="gray"
      whiteSpace={"normal"}
      spacing="6"
      height="250px"
      flex="1"
      animate="default"
      whileHover="animateBubbles"
      transition={{ staggerChildren: 0.1 }}
      {...props}
    >
      <StandardIllustration />
      <Stack>
        <Text fontSize="lg" fontWeight="semibold">
          Standard
        </Text>
        <Text textColor="gray.500">Embed in a container on your site</Text>
      </Stack>
    </MotionStack>
  );
};
