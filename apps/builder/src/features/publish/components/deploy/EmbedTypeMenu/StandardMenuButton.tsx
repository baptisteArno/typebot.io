import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { Button } from "@typebot.io/ui/components/Button";
import { motion } from "motion/react";
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
        <p className="text-lg font-medium">Standard</p>
        <p className="text-sm text-gray-500 leading-[1.2]">
          Embed in a container on your site
        </p>
      </div>
    </Button>
  );
};
