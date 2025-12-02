import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { Button } from "@typebot.io/ui/components/Button";
import { cn } from "@typebot.io/ui/lib/cn";
import { motion } from "motion/react";
import { PopupIllustration } from "./illustrations/PopupIllustration";

export const PopupMenuButton = ({
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
      <PopupIllustration />
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium">Popup</p>
        <p className="text-sm text-gray-500 leading-[1.2]">
          Embed in a popup on top of your website
        </p>
      </div>
    </Button>
  );
};
