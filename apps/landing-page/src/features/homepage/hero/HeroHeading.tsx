import { type MotionProps, motion } from "motion/react";

const blurInProps = ({
  delay = 0,
  duration = 0.5,
}: {
  delay?: number;
  duration?: number;
} = {}) =>
  ({
    variants: {
      hidden: {
        opacity: 0,
        filter: "blur(5px)",
      },
      visible: {
        opacity: 1,
        filter: "blur(0px)",
      },
    },
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true },
    transition: {
      delay,
      type: "linear",
      duration,
    },
  }) satisfies MotionProps;

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
