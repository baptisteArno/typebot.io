import { MotionButton } from "@/components/MotionButton";
import { type StackProps, Text } from "@chakra-ui/react";
import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { BubbleIllustration } from "./illustrations/BubbleIllustration";

type Props = StackProps & Pick<ButtonProps, "disabled">;

export const BubbleMenuButton = (props: Props) => {
  return (
    <MotionButton
      className="flex flex-col font-normal whitespace-normal gap-6 flex-1 h-60 items-center"
      variant="outline-secondary"
      size="lg"
      iconStyle="none"
      animate="default"
      whileHover="animateBubbles"
      transition={{ staggerChildren: 0.1 }}
      {...props}
    >
      <BubbleIllustration />
      <div className="flex flex-col gap-1">
        <Text fontSize="lg" fontWeight="medium">
          Bubble
        </Text>
        <Text textColor="gray.500" fontSize="sm" lineHeight={1.2}>
          Embed in a chat bubble
        </Text>
      </div>
    </MotionButton>
  );
};
