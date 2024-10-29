import type { MotionProps } from "framer-motion";

type Props = {
  delay?: number;
  duration?: number;
};

export const blurInProps = ({ delay = 0, duration = 0.5 }: Props = {}) =>
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
