import { Stack, type StackProps, forwardRef } from "@chakra-ui/react";
import { type MotionProps, isValidMotionProp, motion } from "framer-motion";

export const MotionStack = motion(
  forwardRef<MotionProps & StackProps, "div">((props, ref) => {
    const chakraProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !isValidMotionProp(key)),
    );

    return <Stack ref={ref} {...chakraProps} />;
  }),
);
