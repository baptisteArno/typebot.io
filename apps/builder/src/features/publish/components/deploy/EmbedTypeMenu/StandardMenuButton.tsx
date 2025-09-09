import { type StackProps, Text } from "@chakra-ui/react";
import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { MotionButton } from "@/components/MotionButton";
import { StandardIllustration } from "./illustrations/StandardIllustration";

type Props = StackProps & Pick<ButtonProps, "disabled">;

export const StandardMenuButton = (props: Props) => {
  return (
    <MotionButton
      className="flex flex-col font-normal whitespace-normal gap-6 flex-1 h-60 items-center"
      variant="outline-secondary"
      animate="default"
      size="lg"
      iconStyle="none"
      whileHover="animateBubbles"
      transition={{ staggerChildren: 0.1 }}
      {...props}
    >
      <StandardIllustration />
      <div className="flex flex-col gap-1">
        <Text fontSize="lg" fontWeight="medium">
          Standard
        </Text>
        <Text textColor="gray.500" fontSize="sm" lineHeight={1.2}>
          Embed in a container on your site
        </Text>
      </div>
    </MotionButton>
  );
};
