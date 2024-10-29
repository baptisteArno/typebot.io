"use client";

import { blurInProps } from "@/components/motion";
import { Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";

export const HeroHeading = () => {
  return (
    <Heading textAlign="center" textTransform="uppercase" textStyle="4xl">
      <motion.span {...blurInProps()}>Hack the bot game:</motion.span>
      <br />
      <motion.span {...blurInProps({ delay: 0.1 })}>Build faster, </motion.span>
      <br />
      <motion.span {...blurInProps({ delay: 0.2 })}>Chat smarter</motion.span>
    </Heading>
  );
};
