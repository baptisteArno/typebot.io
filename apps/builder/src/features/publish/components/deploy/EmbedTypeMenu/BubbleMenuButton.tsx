import { Text } from "@chakra-ui/react";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { cn } from "@typebot.io/ui/lib/cn";
import { motion } from "framer-motion";
import { BubbleIllustration } from "./illustrations/BubbleIllustration";

export const BubbleMenuButton = ({
  className,
  ...props
}: Omit<ButtonProps, "render" | "size" | "variant" | "iconStyle">) => {
  return (
    <Button
      className={cn(
        "flex flex-col font-normal whitespace-normal gap-6 flex-1 h-60 items-center",
        className,
      )}
      variant="outline-secondary"
      size="lg"
      iconStyle="none"
      render={
        <motion.button
          animate="default"
          whileHover="animateBubbles"
          transition={{ staggerChildren: 0.1 }}
        />
      }
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
    </Button>
  );
};
