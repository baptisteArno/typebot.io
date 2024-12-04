"use client";

import { blurInProps } from "@/components/motion";
import { motion } from "framer-motion";

export const HeroHeading = () => {
  return (
    <h1 className="text-center uppercase font-bold text-balance">
      <motion.span {...blurInProps()}>Hack the bot game:</motion.span>
      <br />
      <motion.span {...blurInProps({ delay: 0.2 })}>Build faster, </motion.span>
      <br />
      <motion.span {...blurInProps({ delay: 0.4 })}>Chat smarter</motion.span>
    </h1>
  );
};
