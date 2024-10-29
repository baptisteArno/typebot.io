"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { forwardRef } from "react";

export const MotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => <motion.div ref={ref} {...props} />,
);
