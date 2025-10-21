import { Text } from "@chakra-ui/react";
import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { Button } from "@typebot.io/ui/components/Button";
import { motion } from "framer-motion";
import { StandardIllustration } from "./illustrations/StandardIllustration";

export const StandardMenuButton = ({
  className,
  ...props
}: Omit<ButtonProps, "render" | "size" | "variant" | "iconStyle">) => {
  return (
    <Button
      className="flex flex-col font-normal whitespace-normal gap-6 flex-1 h-60 items-center"
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
      <StandardIllustration />
      <div className="flex flex-col gap-1">
        <Text fontSize="lg" fontWeight="medium">
          Standard
        </Text>
        <Text textColor="gray.500" fontSize="sm" lineHeight={1.2}>
          Embed in a container on your site
        </Text>
      </div>
    </Button>
  );
};
