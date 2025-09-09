import { forwardRef } from "@chakra-ui/react";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { isValidMotionProp, type MotionProps, motion } from "framer-motion";

export const MotionButton = motion(
  forwardRef<MotionProps & ButtonProps, "button">((props, ref) => {
    const buttonProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !isValidMotionProp(key)),
    );

    return <Button ref={ref} {...buttonProps} />;
  }),
);
